import type { Contract } from 'ethcall';
import { JsonFragmentType, JsonRpcProvider } from 'ethers';
import {
  GraphQLBoolean,
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLSchema,
  GraphQLString,
  Kind,
  ThunkObjMap,
} from 'graphql';

import { BigIntScalar } from './scalars';
import { Config, ContractCall, ContractConfig } from './types';

interface SharedGraphQlTypes {
  inputs: {
    [key: string]: GraphQLInputType;
  };
  outputs: {
    [key: string]: GraphQLOutputType;
  };
}

const generateGraphQlTypeName = (componentInternalType: string) =>
  // TODO: add prefix to make sure type name is unique within schema (in case
  // generated schema is merged an existing one)
  componentInternalType.replace('struct ', '').replace('[]', '').replace('.', '_');

// Based on a given component, return the corresponding shared GraphQL input
// type if it exists or create onw then return it
function upSetSharedGraphQlInputType<TIsInput extends boolean>({
  isInput,
  component,
  sharedGraphQlTypes,
}: {
  isInput: TIsInput;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) {
  let sharedGraphQlTypeName = generateGraphQlTypeName(component.internalType!);

  // Add suffix if type is an input to prevent a potential duplicate with an
  // output
  if (isInput) {
    sharedGraphQlTypeName += 'Input';
  }

  if (!sharedGraphQlTypes[isInput ? 'inputs' : 'outputs'][sharedGraphQlTypeName]) {
    sharedGraphQlTypes[isInput ? 'inputs' : 'outputs'][sharedGraphQlTypeName] = isInput
      ? new GraphQLInputObjectType({
          name: sharedGraphQlTypeName,
          fields: component.components!.reduce<ThunkObjMap<GraphQLInputFieldConfig>>(
            (accComponentGraphqlTypes, component, componentIndex) => ({
              ...accComponentGraphqlTypes,
              [component.name || componentIndex]: {
                type: generateGraphqlType({
                  isInput,
                  component,
                  sharedGraphQlTypes,
                }),
              },
            }),
            {},
          ),
        })
      : new GraphQLObjectType({
          name: sharedGraphQlTypeName,
          fields: component.components!.reduce<ThunkObjMap<GraphQLFieldConfig<any, any, any>>>(
            (accComponentGraphqlTypes, component, componentIndex) => ({
              ...accComponentGraphqlTypes,
              [component.name || componentIndex]: {
                type: generateGraphqlType({
                  isInput,
                  component,
                  sharedGraphQlTypes,
                }) as GraphQLOutputType,
              },
            }),
            {},
          ),
        });
  }

  return sharedGraphQlTypes[isInput ? 'inputs' : 'outputs'][sharedGraphQlTypeName];
}

function generateGraphqlType<TIsInput extends boolean>({
  isInput,
  component,
  sharedGraphQlTypes,
}: {
  isInput: TIsInput;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) {
  // TODO: improve type
  let graphQlType: any = BigIntScalar;

  const componentType = component.type?.replace('[]', '');

  // Handle tuples
  if (componentType === 'tuple' && component.internalType) {
    graphQlType = upSetSharedGraphQlInputType({
      isInput,
      component,
      sharedGraphQlTypes,
    });
  } else if (componentType === 'string' || componentType === 'address') {
    graphQlType = GraphQLString;
  } else if (componentType === 'bool') {
    graphQlType = GraphQLBoolean;
  }

  // Detect if input is an array
  if (component.type?.slice(-2) === '[]') {
    graphQlType = new GraphQLList(graphQlType);
  }

  return graphQlType;
}

const generateGraphQlOutputType = ({
  components,
  sharedGraphQlTypes,
}: {
  components: ReadonlyArray<JsonFragmentType>;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) => {
  if (components.length === 1) {
    return generateGraphqlType({
      isInput: false,
      component: components[0],
      sharedGraphQlTypes,
    });
  }

  return components.map(component =>
    generateGraphqlType({
      isInput: false,
      component,
      sharedGraphQlTypes,
    }),
  );
};

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
          type: new GraphQLObjectType({
            name: contract.name,
            // Go through contract methods and build field types
            fields: contract.abi.reduce<ThunkObjMap<GraphQLFieldConfig<any, any, any>>>(
              (accContractFields, abiItem, abiItemIndex) => {
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
                const abiItemName = abiItem.name || abiItemIndex;
                const abiItemOutputs = abiItem.outputs || [];

                const contractField: GraphQLFieldConfig<any, any, any> = {
                  type: generateGraphQlOutputType({
                    components: abiItemOutputs,
                    sharedGraphQlTypes,
                  }),
                  resolve: (_obj: { [key: string]: unknown }) => _obj[abiItemName],
                };

                // Handle argument types
                if ((abiItem.inputs || []).length > 0) {
                  contractField.args = abiItem.inputs!.reduce<
                    GraphQLFieldConfig<any, any, any>['args']
                  >(
                    (accArgs, input, inputIndex) => ({
                      ...accArgs,
                      // Fallback to using index if input does not have a name
                      [input.name || inputIndex]: {
                        type: generateGraphqlType({
                          isInput: true,
                          component: input,
                          sharedGraphQlTypes,
                        }),
                      },
                    }),
                    {},
                  );
                }

                return {
                  ...accContractFields,
                  [abiItemName]: contractField,
                };
              },
              {},
            ),
          }),
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
        type: contractsType,
        args: {
          chainId: { type: GraphQLInt },
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
                const contractCallArguments = (callSelection.arguments || []).reduce<
                  ReadonlyArray<string | boolean>
                >(
                  (accArguments, argument) =>
                    'value' in argument.value
                      ? [...accArguments, argument.value.value]
                      : accArguments,
                  [],
                );

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

  return new GraphQLSchema({ query: queryType });
};

export default createSchema;
