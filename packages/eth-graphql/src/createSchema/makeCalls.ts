import { providers } from '@0xsequence/multicall';
import { Contract } from 'ethers';
import { GraphQLResolveInfo, Kind } from 'graphql';

import { ContractCall, SolidityValue } from '../types';
import formatGraphQlArgs from './formatGraphQlArgs';
import { ContractMapping, FieldNameMapping } from './types';

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

      const contractName = contractSelection.name.value;
      const contractConfig = contractMapping[contractName];

      if (!contractConfig.address) {
        // TODO: handle calling contract at multiple addresses
        const contractAddressesArg =
          (graphqlResolveInfo.variableValues.addresses as string[]) || [];
        throw new Error(
          `TODO: handle calling contract at multiple addresses ${contractAddressesArg}`,
        );
      }

      const contract = new Contract(
        contractConfig.address[graphqlResolveInfo.variableValues.chainId as number],
        contractConfig.abi,
        multicallProvider,
      );

      // Go through call nodes
      const contractCalls = (contractSelection.selectionSet?.selections || []).reduce<
        ContractCall[]
      >((accContractCalls, callSelection) => {
        // Ignore __typename and non-field selections
        if (callSelection.kind !== Kind.FIELD || callSelection.name.value === '__typename') {
          return accContractCalls;
        }

        // Find corresponding function name in mapping
        const fnName = fieldMapping[contractName][callSelection.name.value];

        // Format arguments
        const contractCallArguments = formatGraphQlArgs(callSelection.arguments || []);

        // Shape call
        const contractCall: ContractCall = {
          contractName: contractName,
          fieldName: callSelection.name.value,
          call: contract[fnName](...contractCallArguments),
        };

        return [...accContractCalls, contractCall];
      }, []);

      return accCalls.concat(contractCalls);
    },
    [],
  );

  // Merge all calls into one using multicall contract
  const multicallResults = await Promise.all(calls.map(({ call }) => call));

  // Format and return results
  const formattedResults = multicallResults.reduce<{
    [contractName: string]: {
      [methodName: string]: SolidityValue;
    };
  }>((accResults, result, index) => {
    const contractCall = calls[index];

    return {
      ...accResults,
      [contractCall.contractName]: {
        ...(accResults[contractCall.contractName] || {}),
        [contractCall.fieldName]: result,
      },
    };
  }, {});

  return formattedResults;
};

export default makeCalls;
