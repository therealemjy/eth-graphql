import { JsonFragmentType } from '@ethersproject/abi';
import { GraphQLFieldConfigArgumentMap, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import formatToEntityName from '../utilities/formatToEntityName';
import createGraphQlType from './createGraphQlType';
import { SharedGraphQlTypes } from './types';

const createGraphQlInputTypes = ({
  components,
  contractName,
  sharedGraphQlTypes,
}: {
  components: ReadonlyArray<JsonFragmentType>;
  contractName: string;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) =>
  components.reduce<GraphQLFieldConfigArgumentMap>(
    (accArgs, component, componentIndex) => ({
      ...accArgs,
      [formatToEntityName({
        name: component.name,
        index: componentIndex,
        type: 'arg',
      })]: {
        type: createGraphQlType({
          isInput: true,
          contractName,
          component,
          sharedGraphQlTypes,
        }) as GraphQLNonNull<GraphQLInputObjectType>,
      },
    }),
    {},
  );

export default createGraphQlInputTypes;
