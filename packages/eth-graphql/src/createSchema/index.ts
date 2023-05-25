import { providers } from '@0xsequence/multicall';
import { Contract } from 'ethers';
import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
  GraphQLString,
  Kind,
  ThunkObjMap,
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
  [contractName: string]: Omit<ContractConfig, 'name'>;
}

interface FieldNameMapping {
  [contractName: string]: {
    [fieldName: string]: string;
  };
}

const addressesGraphQlInputType = new GraphQLNonNull(new GraphQLList(GraphQLString));

const createSchema = ({ config, contracts }: CreateSchemaInput) => {
  const sharedGraphQlTypes: SharedGraphQlTypes = {
    inputs: {},
    outputs: {},
  };

  const provider = new providers.MulticallProvider(config.provider);

  // Map contract names to their config
  const contractMapping = contracts.reduce<ContractMapping>(
    (contractsAcc, { name, address, abi }) => ({
      ...contractsAcc,
      [name]: {
        abi,
        address,
      },
    }),
    {},
  );

  // Mapping of GraphQL fields to contract functions
  const fieldMapping: FieldNameMapping = {};

  const contractsType = new GraphQLObjectType({
    name: ROOT_NODE_NAME,
    // Go through contracts and build field types
    fields: contracts.reduce((accContracts, contract) => {
      // Filter out ABI items that aren't non-mutating named functions
      const filteredContractAbiItems = contract.abi.filter(
        abiItem =>
          abiItem.type === 'function' &&
          !!abiItem.name &&
          (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure'),
      );

      const contractType: GraphQLFieldConfig<{ [key: string]: SolidityValue }, unknown, unknown> = {
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

              const abiItemName = abiItem.name;
              const abiInputs = abiItem.inputs || [];

              const contractFieldName = formatToFieldName({
                name: abiItemName,
                indexInAbi: abiItemIndex,
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

                  // Handle functions that return void
                  if (abiItemOutputs.length === 0) {
                    return undefined;
                  }

                  // Handle functions that return only one value
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
      };

      // Add "addresses" input argument if contract in config does not have an
      // address property. This is done to support calling multiple contracts
      // sharing the same ABI and for which the user does not know or does not
      // wish to put the addresses of inside the config.
      if (!contract.address) {
        contractType.args = {
          addresses: { type: addressesGraphQlInputType },
        };

        // Transform type into a list to reflect the fact an array of results
        // will be returned
        contractType.type = new GraphQLNonNull(new GraphQLList(contractType.type));
      }

      return {
        ...accContracts,
        [contract.name]: contractType,
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
          const calls = (fieldNode.selectionSet?.selections || []).reduce<ContractCall[]>(
            (accCalls, contractSelection) => {
              // Ignore __typename and non-field selections
              if (
                contractSelection.kind !== Kind.FIELD ||
                contractSelection.name.value === '__typename'
              ) {
                return accCalls;
              }

              const contractName = contractSelection.name.value;
              const contractConfig = contractMapping[contractName];

              if (!contractConfig.address) {
                // TODO: handle calling contract at multiple addresses
                const contractAddressesArg = (info.variableValues.addresses as string[]) || [];
                throw new Error(
                  `TODO: handle calling contract at multiple addresses ${contractAddressesArg}`,
                );
              }

              const contract = new Contract(
                contractConfig.address[chainId],
                contractConfig.abi,
                provider,
              );

              // Go through call nodes
              const contractCalls = (contractSelection.selectionSet?.selections || []).reduce<
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

            return {
              ...accResults,
              [contractCall.contractName]: {
                ...(accResults[contractCall.contractName] || {}),
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
  return schema;
};

export default createSchema;
