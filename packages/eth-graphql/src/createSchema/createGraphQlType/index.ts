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

import formatToEntityName from '../../utilities/formatToEntityName';
import { GraphQLBigInt } from '../scalars';
import { SharedGraphQlTypes } from '../types';
import formatToGraphQlTypeName from './formatToGraphQlTypeName';

export interface GetOrSetSharedGraphQlType {
  isInput: boolean;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}

function getOrSetSharedGraphQlType({
  isInput,
  component,
  sharedGraphQlTypes,
}: GetOrSetSharedGraphQlType) {
  let sharedGraphQlTypeName = formatToGraphQlTypeName(component.internalType);
  // Add suffix if type is an input to prevent a potential duplicate with an
  // output type
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

export interface CreateGraphQlTypeInput {
  isInput: boolean;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}

function createGraphQlType({ isInput, component, sharedGraphQlTypes }: CreateGraphQlTypeInput) {
  let graphQlType;

  // Use string as the fallback type. In this context, the type property should
  // always be defined but we use this logic as a safeguard
  if (!component.type) {
    return GraphQLString;
  }

  const firstBracketIndex = component.type.indexOf('[');
  const componentBaseType = (
    firstBracketIndex > 0 ? component.type.substring(0, firstBracketIndex) : component.type
  ).replace(/[0-9]/g, '');

  // Handle structs
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

  graphQlType = new GraphQLNonNull(graphQlType);

  // Return list if type is an array. Note that since GraphQL does not support
  // tuples, values typed as a fixed-size array (e.g.: string[3]) will be
  // translated to an array without a fixed size. This is a compromise and a
  // choice taken in this library
  const isArray = firstBracketIndex > 0;
  if (isArray) {
    return new GraphQLNonNull(new GraphQLList(graphQlType));
  }

  return graphQlType;
}

export default createGraphQlType;
