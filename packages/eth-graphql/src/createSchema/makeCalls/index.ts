import { Multicall, providers } from '@0xsequence/multicall';
import { Contract } from 'ethers';
import { GraphQLResolveInfo, Kind } from 'graphql';

import EthGraphQlError from '../../EthGraphQlError';
import { Config } from '../../types';
import formatToSignature from '../../utilities/formatToSignature';
import { MULT_FIELD_SINGLE_ARGUMENT_NAME, ROOT_FIELD_SINGLE_ARGUMENT_NAME } from '../constants';
import { FieldNameMapping } from '../types';
import formatArgumentNodes from './formatArgumentNodes';
import formatGraphQlArgs from './formatGraphQlArgs';
import formatMulticallResults from './formatMulticallResults';
import { ContractCall, ContractCallArgs } from './types';

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

      // Throw an error if an address property was defined for the contract
      // but no address was added for the queried chain ID
      if (field.contract.address && !field.contract.address[chainId]) {
        throw new EthGraphQlError(
          `Missing address for ${contractName} contract for chain ID ${chainId}`,
        );
      }

      // Get contract address from config if it exists
      let contractAddresses = field.contract.address && [field.contract.address[chainId]];

      // If contract was defined in config without an address property, then it
      // means an array of addresses to call was passed as the first and only
      // argument of the contract field
      if (!contractAddresses) {
        const contractArguments = formatArgumentNodes({
          argumentNodes: contractSelection.arguments || [],
          variableValues: graphqlResolveInfo.variableValues,
        });

        // Since the a contract field only accepts one "addresses" argument,
        // then we know it is the first (and only) argument of the array
        contractAddresses = contractArguments[ROOT_FIELD_SINGLE_ARGUMENT_NAME] as string[];
      }

      const hasDefinedAddress = !!field.contract.address;

      // Format arguments
      const contractCallArguments = formatArgumentNodes({
        argumentNodes: callSelection.arguments || [],
        variableValues: graphqlResolveInfo.variableValues,
      });

      const contractFunctionSignature = formatToSignature(field.abiItem);

      // Shape a contract call for each contract address to call
      contractAddresses.forEach((contractAddress, contractAddressIndex) => {
        const contractInstance = new Contract(
          contractAddress,
          field.contract.abi,
          multicallProvider,
        );

        // Shape a contract call for each set of arguments
        const callArgumentSets = field.isMult
          ? (contractCallArguments[MULT_FIELD_SINGLE_ARGUMENT_NAME] as ContractCallArgs[])
          : [contractCallArguments];

        callArgumentSets.forEach(callArguments => {
          const contractCall: ContractCall = {
            contractName,
            contractInstance,
            contractFunctionSignature,
            abiItem: field.abiItem,
            isMult: field.isMult,
            fieldName: callSelection.name.value,
            // We use the indexInResultArray property as an indicator for
            // which result this call data needs to be inserted in if it is
            // part of a contract call using dynamic addresses
            indexInResultArray: hasDefinedAddress ? undefined : contractAddressIndex,
            callArguments,
          };

          return calls.push(contractCall);
        });
      });
    });
  });

  // Merge all calls into one using multicall contract
  const multicallResults = await Promise.all(
    calls.map(({ contractInstance, contractFunctionSignature, callArguments, abiItem }) => {
      const formattedCallArguments = formatGraphQlArgs({
        callArguments,
        abiItemInputs: abiItem.inputs || [],
      });

      return contractInstance[contractFunctionSignature](...formattedCallArguments);
    }),
  );

  // Format and return results
  const formattedResults = formatMulticallResults({
    multicallResults,
    contractCalls: calls,
  });

  return formattedResults;
};

export default makeCalls;
