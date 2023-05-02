import { JsonFragmentType } from 'ethers';
import {
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLOutputType,
  ThunkObjMap,
} from 'graphql';

import createGraphQlType from '..';
import { SharedGraphQlTypes } from '../../types';
import createGraphQlTypeName from './createGraphQlTypeName';

// Based on a given component, return the corresponding shared GraphQL input
// type if it exists or create onw then return it
function getOrSetSharedGraphQlInputType<TIsInput extends boolean>({
  isInput,
  component,
  sharedGraphQlTypes,
}: {
  isInput: TIsInput;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) {
  let sharedGraphQlTypeName = createGraphQlTypeName(component.internalType!);
  // Add suffix if type is an input to prevent a potential duplicate with an
  // output
  if (isInput) {
    sharedGraphQlTypeName += 'Input';
  }

  const keyType = isInput ? 'inputs' : 'outputs';

  // Create new shared type if it does not exist already
  if (!sharedGraphQlTypes[keyType][sharedGraphQlTypeName]) {
    sharedGraphQlTypes[keyType][sharedGraphQlTypeName] = isInput
      ? new GraphQLInputObjectType({
          name: sharedGraphQlTypeName,
          fields: (component.components || []).reduce<ThunkObjMap<GraphQLInputFieldConfig>>(
            (accComponentGraphqlTypes, component, componentIndex) => ({
              ...accComponentGraphqlTypes,
              [component.name || componentIndex]: {
                type: createGraphQlType({
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
          fields: (component.components || []).reduce<
            ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>>
          >(
            (accComponentGraphqlTypes, component, componentIndex) => ({
              ...accComponentGraphqlTypes,
              [component.name || componentIndex]: {
                type: createGraphQlType({
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

  return sharedGraphQlTypes[keyType][sharedGraphQlTypeName];
}

export default getOrSetSharedGraphQlInputType;
