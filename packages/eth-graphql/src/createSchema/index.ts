import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
  GraphQLString,
  ThunkObjMap,
} from 'graphql';

import EthGraphQlError from '../EthGraphQlError';
import { Config, SolidityValue } from '../types';
import filterAbiItems from '../utilities/filterAbiItems';
import formatToSignature from '../utilities/formatToSignature';
import createGraphQlInputTypes from './createGraphQlInputTypes';
import createGraphQlOutputTypes from './createGraphQlOutputTypes';
import formatToFieldName from './formatToFieldName';
import makeCalls from './makeCalls';
import { ContractMapping, FieldNameMapping, SharedGraphQlTypes } from './types';
import validateConfig from './validateConfig';

const ROOT_NODE_NAME = 'contracts';
const addressesGraphQlInputType = new GraphQLNonNull(new GraphQLList(GraphQLString));

const createSchema = (config: Config) => {
  // Validate user config
  const configValidation = validateConfig(config);

  if (!configValidation.isValid) {
    throw new EthGraphQlError(configValidation.error);
  }

  const sharedGraphQlTypes: SharedGraphQlTypes = {
    inputs: {},
    outputs: {},
  };

  // Mapping of contract names to their config
  const contractMapping: ContractMapping = {};

  // Mapping of GraphQL fields to contract functions
  const fieldMapping: FieldNameMapping = {};

  const contractsType = new GraphQLObjectType({
    name: ROOT_NODE_NAME,
    // Go through contracts and build field types
    fields: config.contracts.reduce((accContracts, contract) => {
      // Add contract to mapping
      contractMapping[contract.name] = {
        abi: contract.abi,
        address: contract.address,
      };

      const filteredContractAbiItems = filterAbiItems(contract.abi);

      const contractType: GraphQLFieldConfig<{ [key: string]: SolidityValue }, unknown, unknown> = {
        type: new GraphQLNonNull(
          new GraphQLObjectType({
            name: contract.name,
            // Go through contract methods and build field types
            fields: filteredContractAbiItems.reduce<
              ThunkObjMap<GraphQLFieldConfig<{ [key: string]: SolidityValue }, unknown, unknown>>
            >((accContractFields, abiItem, abiItemIndex) => {
              const abiItemName = abiItem.name!; // We've already filtered out nameless functions
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
                resolve: (_obj: { [key: string]: SolidityValue }) => _obj[contractFieldName],
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
          graphqlResolveInfo: GraphQLResolveInfo,
        ) =>
          makeCalls({
            graphqlResolveInfo,
            contractMapping,
            fieldMapping,
            config,
            chainId,
          }),
      },
    },
  });

  const schema = new GraphQLSchema({ query: queryType });
  return schema;
};

export default createSchema;
