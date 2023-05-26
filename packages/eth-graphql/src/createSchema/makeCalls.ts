import { providers } from '@0xsequence/multicall';
import { Contract, ContractFunction } from 'ethers';
import { GraphQLResolveInfo, Kind } from 'graphql';

import { SolidityValue } from '../types';
import formatGraphQlArgs from './formatGraphQlArgs';
import { ContractMapping, FieldNameMapping } from './types';

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
}

const makeCalls = async ({
  graphqlResolveInfo,
  contractMapping,
  fieldMapping,
  multicallProvider,
}: MakeCallsInput) => {
  // Find "contracts" node
  const fieldNodes = graphqlResolveInfo.fieldNodes.filter(
    fieldNode => fieldNode.name.value === graphqlResolveInfo.fieldName,
  );

  // Ensure there's only one "contracts" node
  if (fieldNodes.length > 1) {
    throw new Error('Only one "contracts" query field is supported');
  }

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

        // Get contract address(es). If contract was defined in config without an address, then it means we're calling it
        const chainId = graphqlResolveInfo.variableValues.chainId as number;
        const contractAddresses = contractConfig.address
          ? [contractConfig.address[chainId]]
          : (graphqlResolveInfo.variableValues.addresses as string[]) || [];

        // Shape a contract call for each contract address to call
        const newContractCalls: ContractCall[] = contractAddresses.map(
          (contractAddress, contractAddressIndex) => {
            const contract = new Contract(contractAddress, contractConfig.abi, multicallProvider);

            return {
              contractName: contractName,
              fieldName: callSelection.name.value,
              call: contract[fnName](...contractCallArguments),
              indexInResultArray: !contractConfig.address ? contractAddressIndex : undefined,
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
