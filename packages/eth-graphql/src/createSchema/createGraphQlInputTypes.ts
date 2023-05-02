import { JsonFragmentType } from 'ethers';
import { GraphQLFieldConfig, GraphQLInputObjectType } from 'graphql';

import createGraphQlType from './createGraphQlType';
import formatToFieldName from './formatToFieldName';
import { SharedGraphQlTypes } from './types';

const createGraphQlInputTypes = ({
  components,
  sharedGraphQlTypes,
}: {
  components: ReadonlyArray<JsonFragmentType>;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) =>
  components.reduce<GraphQLFieldConfig<unknown, unknown, unknown>['args']>(
    (accArgs, component, componentIndex) => ({
      ...accArgs,
      [formatToFieldName({
        name: component.name,
        index: componentIndex,
      })]: {
        type: createGraphQlType({
          isInput: true,
          component,
          sharedGraphQlTypes,
        }) as GraphQLInputObjectType,
      },
    }),
    {},
  );

export default createGraphQlInputTypes;
