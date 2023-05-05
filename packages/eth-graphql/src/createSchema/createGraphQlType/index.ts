import { JsonFragmentType } from '@ethersproject/abi';
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

import GraphQLBigInt from '../../GraphQLBigInt';
import formatToEntityName from '../formatToEntityName';
import { SharedGraphQlTypes } from '../types';
import formatToGraphQlTypeName from './formatToGraphQlTypeName';

function getOrSetSharedGraphQlType({
  isInput,
  component,
  sharedGraphQlTypes,
}: {
  isInput: boolean;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) {
  let sharedGraphQlTypeName = formatToGraphQlTypeName(component.internalType!);
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
              [formatToEntityName({ name: component.name, index: componentIndex, type: 'arg' })]: {
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
              [formatToEntityName({ name: component.name, index: componentIndex, type: 'value' })]:
                {
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

  const componentBaseType = component.type?.replace('[]', '').replace(/[0-9]/g, '');

  // Handle tuples
  if (componentBaseType === 'tuple' && component.internalType) {
    graphQlType = getOrSetSharedGraphQlType({
      isInput,
      component,
      sharedGraphQlTypes,
    });
  } else if (componentBaseType === 'uint' || componentBaseType === 'int') {
    graphQlType = GraphQLBigInt;
  } else if (componentBaseType === 'bool') {
    graphQlType = GraphQLBoolean;
  } else {
    graphQlType = GraphQLString;
  }

  // Detect if input is an array
  if (component.type?.slice(-2) === '[]') {
    graphQlType = new GraphQLList(graphQlType);
  }

  return new GraphQLNonNull(graphQlType);
}

export default createGraphQlType;
