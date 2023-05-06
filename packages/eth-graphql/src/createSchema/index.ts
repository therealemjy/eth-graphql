import { providers } from '@0xsequence/multicall';
import { Contract } from 'ethers';
import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
  Kind,
  ThunkObjMap,
  printSchema,
} from 'graphql';

import { Config, ContractCall, ContractConfig, SolidityValue } from '../types';
import createGraphQlInputTypes from './createGraphQlInputTypes';
import createGraphQlOutputTypes from './createGraphQlOutputTypes';
import formatGraphQlArgs from './formatGraphQlArgs';
import formatToEntityName from './formatToEntityName';
import formatToFieldName from './formatToFieldName';
import formatToSignature from './formatToSignature';
import { SharedGraphQlTypes } from './types';

const ROOT_NODE_NAME = 'contracts';

interface CreateSchemaInput {
  config: Config;
  contracts: ContractConfig[];
}

interface ContractMapping {
  [contractName: string]: {
    [chainId: number]: Contract;
  };
}

interface FieldNameMapping {
  [contractName: string]: {
    [fieldName: string]: string;
  };
}

const createSchema = ({ config, contracts }: CreateSchemaInput) => {
  const sharedGraphQlTypes: SharedGraphQlTypes = {
    inputs: {},
    outputs: {},
  };

  const provider = new providers.MulticallProvider(config.provider);

  // Map contract names to contract instances
  const contractMapping = contracts.reduce<ContractMapping>(
    (contractsAcc, { name, address, abi }) => ({
      ...contractsAcc,
      [name]: Object.keys(address).reduce<{
        [chainId: number]: Contract;
      }>(
        (chainIdsAcc, chainId) => ({
          ...chainIdsAcc,
          [chainId]: new Contract(address[Number(chainId)], abi, provider),
        }),
        {},
      ),
    }),
    {},
  );

  // Mapping of GraphQL fields to contract functions
  const fieldMapping: FieldNameMapping = {};

  const contractsType = new GraphQLObjectType({
    name: ROOT_NODE_NAME,
    // Go through contracts and build field types
    fields: contracts.reduce((accContracts, contract) => {
      // Filter out ABI items that aren't non-mutating functions
      const filteredContractAbiItems = contract.abi.filter(
        abiItem =>
          abiItem.type === 'function' &&
          !!abiItem.name &&
          (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure'),
      );

      return {
        ...accContracts,
        [contract.name]: {
          type: new GraphQLNonNull(
            new GraphQLObjectType({
              name: contract.name,
              // Go through contract methods and build field types
              fields: filteredContractAbiItems.reduce<
                ThunkObjMap<GraphQLFieldConfig<{ [key: string]: SolidityValue }, unknown, unknown>>
              >((accContractFields, abiItem, abiItemIndex) => {
                // Filter out items that aren't non-mutating functions
                if (
                  abiItem.type !== 'function' ||
                  !abiItem.name ||
                  (abiItem.stateMutability !== 'view' && abiItem.stateMutability !== 'pure')
                ) {
                  return accContractFields;
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const abiItemName = abiItem.name!; // We've already asserted that the name property is truthy
                const abiInputs = abiItem.inputs || [];

                const contractFieldName = formatToFieldName({
                  name: abiItemName,
                  index: abiItemIndex,
                  abi: filteredContractAbiItems,
                });

                const contractField: GraphQLFieldConfig<
                  { [key: string]: SolidityValue },
                  unknown,
                  unknown
                > = {
                  type: createGraphQlOutputTypes({
                    abiItem,
                    sharedGraphQlTypes,
                  }),
                  resolve: (_obj: { [key: string]: SolidityValue }) => {
                    const abiItemOutputs = abiItem.outputs || [];
                    const data = _obj[contractFieldName];

                    if (abiItemOutputs.length === 1 || !Array.isArray(data)) {
                      return data;
                    }

                    // If the output in the ABI contains multiple components, we
                    // map them to an object, similarly to how they are mapped
                    // in the GraphQL schema
                    return abiItemOutputs.reduce<{
                      [key: string]: SolidityValue;
                    }>(
                      (accFormattedData, outputComponent, outputComponentIndex) => ({
                        ...accFormattedData,
                        [formatToEntityName({
                          name: outputComponent.name,
                          index: outputComponentIndex,
                          type: 'value',
                        })]: data[outputComponentIndex],
                      }),
                      {},
                    );
                  },
                };

                // Handle argument types
                if (abiInputs.length > 0) {
                  contractField.args = createGraphQlInputTypes({
                    components: abiInputs,
                    sharedGraphQlTypes,
                  });
                }

                const contractFunctionSignature = formatToSignature(abiItem);

                // Initialize contract mapping if necessary
                if (!fieldMapping[contract.name]) {
                  fieldMapping[contract.name] = {};
                }

                // Add field to contract mapping
                fieldMapping[contract.name][contractFieldName] = contractFunctionSignature;

                return {
                  ...accContractFields,
                  [contractFieldName]: contractField,
                };
              }, {}),
            }),
          ),
          resolve: (_obj: { [key: string]: SolidityValue }) => _obj[contract.name],
        },
      };
    }, {}),
  });

  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      contracts: {
        type: new GraphQLNonNull(contractsType),
        args: {
          chainId: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (
          _obj: unknown,
          { chainId }: { chainId: number },
          _context: unknown,
          info: GraphQLResolveInfo,
        ) => {
          // Find "contracts" node
          const fieldNodes = info.fieldNodes.filter(
            fieldNode => fieldNode.name.value === info.fieldName,
          );

          // Ensure there's only one "contracts" node
          if (fieldNodes.length > 1) {
            throw new Error('Only one "contracts" query field is supported');
          }

          const fieldNode = fieldNodes[0];

          // Go through "contracts" node to extract requests to make
          const calls = fieldNode.selectionSet!.selections.reduce<ContractCall[]>(
            (accCalls, contractSelection) => {
              // Ignore __typename and non-field selections
              if (
                contractSelection.kind !== Kind.FIELD ||
                contractSelection.name.value === '__typename'
              ) {
                return accCalls;
              }

              const contractName = contractSelection.name.value;
              const contract = contractMapping[contractName][chainId];

              // Go through call nodes
              const contractCalls = contractSelection.selectionSet!.selections.reduce<
                ContractCall[]
              >((accContractCalls, callSelection) => {
                // Ignore __typename and non-field selections
                if (
                  callSelection.kind !== Kind.FIELD ||
                  callSelection.name.value === '__typename'
                ) {
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
            const contractName = contractCall.contractName;

            return {
              ...accResults,
              [contractName]: {
                ...(accResults[contractName] || {}),
                [contractCall.fieldName]: result,
              },
            };
          }, {});

          return formattedResults;
        },
      },
    },
  });

  const schema = new GraphQLSchema({ query: queryType });

  console.log(printSchema(schema));

  return schema;
};

export default createSchema;
