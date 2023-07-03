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
import {
  MULT_FIELD_SINGLE_ARGUMENT_NAME,
  MULT_FIELD_SUFFIX,
  ROOT_FIELD_NAME,
  ROOT_FIELD_SINGLE_ARGUMENT_NAME,
} from './constants';
import createGraphQlInputTypes from './createGraphQlInputTypes';
import createGraphQlMultInputTypes from './createGraphQlMultInputTypes';
import createGraphQlMultOutputType from './createGraphQlMultOutputType';
import createGraphQlOutputType from './createGraphQlOutputType';
import formatToFieldName from './formatToFieldName';
import makeCalls from './makeCalls';
import resolve from './resolve';
import { FieldNameMapping, SharedGraphQlTypes } from './types';
import validateConfig from './validateConfig';

const addressesGraphQlInputType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(GraphQLString)),
);

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

  // Mapping of GraphQL fields to contracts
  const fieldMapping: FieldNameMapping = {};

  const contractsType = new GraphQLObjectType({
    name: ROOT_FIELD_NAME,
    // Go through contracts and build field types
    fields: config.contracts.reduce((accContracts, contract) => {
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

              // Initialize field mapping if necessary
              if (!fieldMapping[contract.name]) {
                fieldMapping[contract.name] = {};
              }

              // Add field to field mapping
              fieldMapping[contract.name][contractFieldName] = {
                contract,
                abiItem,
                isMult: false,
              };

              const newAccContractFields: typeof accContractFields = {
                ...accContractFields,
              };

              // Add field to schema
              const contractField: GraphQLFieldConfig<
                { [key: string]: SolidityValue },
                unknown,
                unknown
              > = {
                type: createGraphQlOutputType({
                  abiItem,
                  contractName: contract.name,
                  sharedGraphQlTypes,
                }),
                resolve,
              };

              newAccContractFields[contractFieldName] = contractField;

              // Handle argument types
              if (abiInputs.length > 0) {
                contractField[MULT_FIELD_SINGLE_ARGUMENT_NAME] = createGraphQlInputTypes({
                  components: abiInputs,
                  contractName: contract.name,
                  sharedGraphQlTypes,
                });

                // Create a MULT field that can be used to call the same method
                // with multiple sets of arguments
                const multContractFieldName = `${contractFieldName}${MULT_FIELD_SUFFIX}`;

                // Add MULT field to field mapping
                fieldMapping[contract.name][multContractFieldName] = {
                  contract,
                  abiItem,
                  isMult: true,
                };

                // Add MULT field to schema
                const multContractField: GraphQLFieldConfig<
                  { [key: string]: SolidityValue },
                  unknown,
                  unknown
                > = {
                  ...contractField,
                  type: createGraphQlMultOutputType({
                    outputType: contractField.type,
                    contractFieldName,
                    sharedGraphQlTypes,
                  }),
                  args: createGraphQlMultInputTypes({
                    inputTypes: contractField.args,
                    contractFieldName,
                    sharedGraphQlTypes,
                  }),
                };

                newAccContractFields[multContractFieldName] = multContractField;
              }

              return newAccContractFields;
            }, {}),
          }),
        ),
        resolve,
      };

      // Add "addresses" input argument if contract in config does not have an
      // address property. This is done to support calling multiple contracts
      // sharing the same ABI and for which the user does not know or does not
      // wish to put the addresses of inside the config.
      if (!contract.address) {
        contractType.args = {
          [ROOT_FIELD_SINGLE_ARGUMENT_NAME]: { type: addressesGraphQlInputType },
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
