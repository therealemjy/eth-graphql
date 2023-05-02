import type { Contract } from 'ethcall';
import { JsonRpcProvider } from 'ethers';
import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
  Kind,
  ThunkObjMap,
} from 'graphql';

import { Config, ContractCall, ContractConfig } from '../types';
import createGraphQlInputTypes from './createGraphQlInputTypes';
import createGraphQlOutputTypes from './createGraphQlOutputTypes';
import formatGraphQlArgs from './formatGraphQlArgs';
import formatToFieldName from './formatToFieldName';
import { SharedGraphQlTypes } from './types';

interface CreateSchemaInput {
  config: Config;
  contracts: ContractConfig[];
}

const createSchema = ({ config, contracts }: CreateSchemaInput) => {
  const provider = new JsonRpcProvider(config.rpcProviderUrl);

  const sharedGraphQlTypes: SharedGraphQlTypes = {
    inputs: {},
    outputs: {},
  };

  const contractsType = new GraphQLObjectType({
    name: 'contracts',
    // Go through contracts and build field types
    fields: contracts.reduce(
      (accContracts, contract) => ({
        ...accContracts,
        [contract.name]: {
          type: new GraphQLNonNull(
            new GraphQLObjectType({
              name: contract.name,
              // Go through contract methods and build field types
              fields: contract.abi.reduce<
                ThunkObjMap<GraphQLFieldConfig<{ [key: string]: unknown }, unknown, unknown>>
              >((accContractFields, abiItem, abiItemIndex) => {
                // Filter out items that aren't non-mutating functions
                if (
                  abiItem.type !== 'function' ||
                  (abiItem.stateMutability !== 'view' && abiItem.stateMutability !== 'pure')
                ) {
                  return accContractFields;
                }

                // TODO: handle events

                // TODO: handle function overloading

                // Fallback to using index if method does not have a name
                const abiItemName = formatToFieldName({ name: abiItem.name, index: abiItemIndex });
                const abiInputs = abiItem.inputs || [];

                const contractField: GraphQLFieldConfig<
                  { [key: string]: unknown },
                  unknown,
                  unknown
                > = {
                  type: createGraphQlOutputTypes({
                    abiItem,
                    sharedGraphQlTypes,
                  }),
                  // TODO: handle multiple outputs (returned as an array of
                  // values, mapped to an object in GraphQL schema)
                  resolve: (_obj: { [key: string]: unknown }) => _obj[abiItemName],
                };

                // Handle argument types
                if (abiInputs.length > 0) {
                  contractField.args = createGraphQlInputTypes({
                    components: abiInputs,
                    sharedGraphQlTypes,
                  });
                }

                return {
                  ...accContractFields,
                  [abiItemName]: contractField,
                };
              }, {}),
            }),
          ),
          resolve: (_obj: { [key: string]: unknown }) => _obj[contract.name],
        },
      }),
      {},
    ),
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
          // Find Contracts node
          const fieldNodes = info.fieldNodes.filter(
            fieldNode => fieldNode.name.value === info.fieldName,
          );

          // Ensure there's only one Contracts node
          // TODO: find all contracts node and merge them together
          if (fieldNodes.length > 1) {
            // TODO: set human-friendlier error
            throw new Error('Only one "contracts" query is supported');
          }

          // Because the library ethcall is a pure ESM module, it cannot be
          // imported regularly in this library since it would require it to be
          // an ESM module as well; limiting its compatibility with other
          // projects that wish to use it. For that reason, we need to import it
          // dynamically
          const { Provider, Contract } = await import('ethcall');

          const fieldNode = fieldNodes[0];

          // Generate contract mapping. An instance of each contract is created
          // for each chain supported and mapped to the corresponding chain id
          const contractMapping = contracts.reduce<{
            [contractName: string]: {
              [chainId: number]: Contract;
            };
          }>(
            (contractsAcc, { name, address, abi }) => ({
              ...contractsAcc,
              [name]: Object.keys(address).reduce<{
                [chainId: number]: Contract;
              }>(
                (chainIdsAcc, chainId) => ({
                  ...chainIdsAcc,
                  [chainId]: new Contract(address[Number(chainId)], abi),
                }),
                {},
              ),
            }),
            {},
          );

          // Go through Contracts node to extract requests to make
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

                // Extract arguments
                const contractCallArguments = formatGraphQlArgs(callSelection.arguments || []);

                // Shape call
                const contractCall: ContractCall = {
                  contractName: contractName,
                  call: contract[callSelection.name.value](...contractCallArguments),
                };

                return [...accContractCalls, contractCall];
              }, []);

              return accCalls.concat(contractCalls);
            },
            [],
          );

          const ethCallProvider = new Provider(chainId, provider);
          const multicallResults = await ethCallProvider.all(calls.map(({ call }) => call));

          // Shape and return results
          return multicallResults.reduce<{
            [contractName: string]: {
              [methodName: string]: unknown;
            };
          }>((accResults, result, index) => {
            const contractCall = calls[index];
            const contractName = contractCall.contractName;

            return {
              ...accResults,
              [contractName]: {
                ...(accResults[contractName] || {}),
                [contractCall.call.name]: result,
              },
            };
          }, {});
        },
      },
    },
  });

  console.log(queryType);

  return new GraphQLSchema({ query: queryType });
};

export default createSchema;
