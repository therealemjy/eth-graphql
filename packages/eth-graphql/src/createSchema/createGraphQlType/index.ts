import { JsonFragmentType } from 'ethers';
import {
  GraphQLBoolean,
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  ThunkObjMap,
} from 'graphql';
import { GraphQLBigInt } from 'graphql-scalars';

import formatToFieldName from '../formatToFieldName';
import { SharedGraphQlTypes } from '../types';
import createGraphQlTypeName from './createGraphQlTypeName';

function getOrSetSharedGraphQlType({
  isInput,
  component,
  sharedGraphQlTypes,
}: {
  isInput: boolean;
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
              [formatToFieldName({ name: component.name, index: componentIndex })]: {
                type: createGraphQlType({
                  isInput,
                  component,
                  sharedGraphQlTypes,
                }) as GraphQLNonNull<GraphQLInputObjectType>,
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
              [formatToFieldName({ name: component.name, index: componentIndex })]: {
                type: createGraphQlType({
                  isInput,
                  component,
                  sharedGraphQlTypes,
                }) as GraphQLNonNull<GraphQLObjectType>,
              },
            }),
            {},
          ),
        });
  }

  return sharedGraphQlTypes[keyType][sharedGraphQlTypeName];
}

function createGraphQlType({
  isInput,
  component,
  sharedGraphQlTypes,
}: {
  isInput: boolean;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) {
  let graphQlType;

  const componentType = component.type?.replace('[]', '');

  // Handle tuples
  if (componentType === 'tuple' && component.internalType) {
    graphQlType = getOrSetSharedGraphQlType({
      isInput,
      component,
      sharedGraphQlTypes,
    });
  } else if (componentType === 'string' || componentType === 'address') {
    graphQlType = GraphQLString;
  } else if (componentType === 'bool') {
    graphQlType = GraphQLBoolean;
  } else {
    graphQlType = GraphQLBigInt;
  }

  // Detect if input is an array
  if (component.type?.slice(-2) === '[]') {
    graphQlType = new GraphQLList(graphQlType);
  }

  return new GraphQLNonNull(graphQlType);
}

export default createGraphQlType;
