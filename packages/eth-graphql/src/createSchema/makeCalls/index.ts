import { providers } from '@0xsequence/multicall';
import { Contract, ContractFunction } from 'ethers';
import { GraphQLResolveInfo, Kind } from 'graphql';

import EthGraphQlError from '../../EthGraphQlError';
import { SolidityValue } from '../../types';
import { ContractMapping, FieldNameMapping } from '../types';
import formatGraphQlArgs from './formatGraphQlArgs';

interface ContractCall {
  call: ContractFunction;
  fieldName: string;
  contractName: string;
  indexInResultArray?: number;
}

interface ContractData {
  [methodName: string]: SolidityValue;
}

export interface MakeCallsInput {
  graphqlResolveInfo: GraphQLResolveInfo;
  contractMapping: ContractMapping;
  fieldMapping: FieldNameMapping;
  multicallProvider: providers.MulticallProvider;
  chainId: number;
}

const makeCalls = async ({
  graphqlResolveInfo,
  contractMapping,
  fieldMapping,
  multicallProvider,
  chainId,
}: MakeCallsInput) => {
  // Find "contracts" node
  const fieldNodes = graphqlResolveInfo.fieldNodes.filter(
    fieldNode => fieldNode.name.value === graphqlResolveInfo.fieldName,
  );

  const fieldNode = fieldNodes[0];

  // Go through "contracts" node to extract requests to make
  const calls = (fieldNode.selectionSet?.selections || []).reduce<ContractCall[]>(
    (accCalls, contractSelection) => {
      // Ignore __typename and non-field selections
      if (contractSelection.kind !== Kind.FIELD || contractSelection.name.value === '__typename') {
        return accCalls;
      }

      // Go through call nodes
      const contractCalls = (contractSelection.selectionSet?.selections || []).reduce<
        ContractCall[]
      >((accContractCalls, callSelection) => {
        // Ignore __typename and non-field selections
        if (callSelection.kind !== Kind.FIELD || callSelection.name.value === '__typename') {
          return accContractCalls;
        }

        const contractName = contractSelection.name.value;
        const contractConfig = contractMapping[contractName];

        // Find corresponding function name in mapping
        const fnName = fieldMapping[contractName][callSelection.name.value];

        // Format arguments
        const contractCallArguments = formatGraphQlArgs(callSelection.arguments || []);

        // Throw an error if an address property was defined for the contract
        // but no address was added for the queried chain ID
        if (contractConfig.address && !contractConfig.address[chainId]) {
          throw new EthGraphQlError(
            `Missing address for ${contractName} contract for chain ID ${chainId}`,
          );
        }

        // Get contract address from config if it exists
        let contractAddresses = contractConfig.address && [contractConfig.address[chainId]];

        // If contract was defined in config without an address property, then
        // it means an array of addresses to call was passed as the first
        // argument of the contract field
        if (!contractAddresses) {
          contractAddresses =
            (graphqlResolveInfo.variableValues.addresses as string[]) ||
            (formatGraphQlArgs(contractSelection.arguments || [])[0] as string[]);
        }

        const hasDefinedAddress = !!contractConfig.address;

        // Shape a contract call for each contract address to call
        const newContractCalls: ContractCall[] = contractAddresses.map(
          (contractAddress, contractAddressIndex) => {
            const contract = new Contract(contractAddress, contractConfig.abi, multicallProvider);

            return {
              contractName: contractName,
              fieldName: callSelection.name.value,
              call: contract[fnName](...contractCallArguments),
              // We use the indexInResultArray property as an indicator for
              // which result this call data needs to be inserted in if it is
              // part of a contract call using dynamic addresses
              indexInResultArray: hasDefinedAddress ? undefined : contractAddressIndex,
            };
          },
        );

        return accContractCalls.concat(newContractCalls);
      }, []);

      return accCalls.concat(contractCalls);
    },
    [],
  );

  // Merge all calls into one using multicall contract
  const multicallResults = await Promise.all(calls.map(({ call }) => call));

  // Format and return results
  const formattedResults = multicallResults.reduce<{
    [contractName: string]: ContractData | ContractData[];
  }>((accResults, result, index) => {
    const contractCall = calls[index];

    // Handle single results
    if (contractCall.indexInResultArray === undefined) {
      return {
        ...accResults,
        [contractCall.contractName]: {
          ...(accResults[contractCall.contractName] || {}),
          [contractCall.fieldName]: result,
        },
      };
    }

    // Handle multiple results merged into an array
    const contractData = (accResults[contractCall.contractName] as ContractData[]) || [];

    if (!contractData[contractCall.indexInResultArray]) {
      contractData[contractCall.indexInResultArray] = {};
    }

    contractData[contractCall.indexInResultArray] = {
      ...contractData[contractCall.indexInResultArray],
      [contractCall.fieldName]: result,
    };

    return {
      ...accResults,
      [contractCall.contractName]: contractData,
    };
  }, {});

  return formattedResults;
};

export default makeCalls;
