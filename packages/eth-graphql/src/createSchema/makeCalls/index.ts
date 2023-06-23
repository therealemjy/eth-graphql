import { Multicall, providers } from '@0xsequence/multicall';
import { JsonFragment } from '@ethersproject/abi';
import { Contract } from 'ethers';
import { GraphQLResolveInfo, Kind } from 'graphql';

import EthGraphQlError from '../../EthGraphQlError';
import { Config, SolidityValue } from '../../types';
import formatToSignature from '../../utilities/formatToSignature';
import { FieldNameMapping } from '../types';
import formatGraphQlArgs from './formatGraphQlArgs';
import formatResult from './formatResult';

interface ContractCall {
  contractName: string;
  contractInstance: Contract;
  contractFunctionSignature: string;
  callArguments: readonly SolidityValue[];
  fieldName: string;
  abiItem: JsonFragment;
  indexInResultArray?: number;
}

interface ContractData {
  [methodName: string]: SolidityValue;
}

export interface MakeCallsInput {
  graphqlResolveInfo: GraphQLResolveInfo;
  fieldMapping: FieldNameMapping;
  config: Config;
  chainId: number;
}

const makeCalls = async ({ graphqlResolveInfo, fieldMapping, config, chainId }: MakeCallsInput) => {
  const chainConfig = config.chains[chainId];

  // Throw an error if no config has been provided for the requested chain ID
  if (!chainConfig) {
    throw new EthGraphQlError(`Missing config for chain ID ${chainId}`);
  }

  const multicallOptions: Partial<Multicall['options']> = {
    batchSize: Infinity, // Do not limit the amount of concurrent requests per batch
  };

  if (chainConfig.multicallAddress) {
    multicallOptions.contract = chainConfig.multicallAddress;
  }

  const multicallProvider = new providers.MulticallProvider(chainConfig.provider, multicallOptions);

  // Find "contracts" node
  const fieldNode = graphqlResolveInfo.fieldNodes.find(
    fieldNode => fieldNode.name.value === graphqlResolveInfo.fieldName,
  );

  if (!fieldNode) {
    return {};
  }

  // Go through "contracts" node to extract requests to make
  const calls: ContractCall[] = [];

  (fieldNode.selectionSet?.selections || []).forEach(contractSelection => {
    // Ignore __typename and non-field selections
    if (contractSelection.kind !== Kind.FIELD || contractSelection.name.value === '__typename') {
      return;
    }

    // Go through call nodes
    (contractSelection.selectionSet?.selections || []).forEach(callSelection => {
      // Ignore __typename and non-field selections
      if (callSelection.kind !== Kind.FIELD || callSelection.name.value === '__typename') {
        return;
      }

      const contractName = contractSelection.name.value;

      // Find corresponding field in mapping
      const field = fieldMapping[contractName][callSelection.name.value];

      // Format arguments
      const contractCallArguments = formatGraphQlArgs(callSelection.arguments || []);

      // Throw an error if an address property was defined for the contract
      // but no address was added for the queried chain ID
      if (field.contract.address && !field.contract.address[chainId]) {
        throw new EthGraphQlError(
          `Missing address for ${contractName} contract for chain ID ${chainId}`,
        );
      }

      // Get contract address from config if it exists
      let contractAddresses = field.contract.address && [field.contract.address[chainId]];

      // If contract was defined in config without an address property, then
      // it means an array of addresses to call was passed as the first
      // argument of the contract field
      if (!contractAddresses) {
        contractAddresses =
          (graphqlResolveInfo.variableValues.addresses as string[]) ||
          (formatGraphQlArgs(contractSelection.arguments || [])[0] as string[]);
      }

      const hasDefinedAddress = !!field.contract.address;

      // Shape a contract call for each contract address to call
      contractAddresses.forEach((contractAddress, contractAddressIndex) => {
        const contractInstance = new Contract(
          contractAddress,
          field.contract.abi,
          multicallProvider,
        );

        const contractFunctionSignature = formatToSignature(field.abiItem);

        // Shape a contract call for each set of arguments to call the
        // contract with
        // const callArguments = field.isMult ?

        const contractCall: ContractCall = {
          contractName,
          contractInstance,
          contractFunctionSignature,
          abiItem: field.abiItem,
          callArguments: contractCallArguments,
          fieldName: callSelection.name.value,
          // We use the indexInResultArray property as an indicator for
          // which result this call data needs to be inserted in if it is
          // part of a contract call using dynamic addresses
          indexInResultArray: hasDefinedAddress ? undefined : contractAddressIndex,
        };

        return calls.push(contractCall);
      });
    });
  });

  // Merge all calls into one using multicall contract
  const multicallResults = await Promise.all(
    calls.map(({ contractInstance, contractFunctionSignature, callArguments }) =>
      contractInstance[contractFunctionSignature](...callArguments),
    ),
  );

  // Format and return results
  const formattedResults = multicallResults.reduce<{
    [contractName: string]: ContractData | ContractData[];
  }>((accResults, result, index) => {
    const contractCall = calls[index];

    const formattedResult = formatResult({
      result,
      abiItem: contractCall.abiItem,
    });

    // Handle single results
    if (contractCall.indexInResultArray === undefined) {
      return {
        ...accResults,
        [contractCall.contractName]: {
          ...(accResults[contractCall.contractName] || {}),
          [contractCall.fieldName]: formattedResult,
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
      [contractCall.fieldName]: formattedResult,
    };

    return {
      ...accResults,
      [contractCall.contractName]: contractData,
    };
  }, {});

  return formattedResults;
};

export default makeCalls;
