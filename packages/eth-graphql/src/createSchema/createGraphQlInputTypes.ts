import { JsonFragmentType } from 'ethers';
import { GraphQLFieldConfig, GraphQLInputObjectType } from 'graphql';

import createGraphQlType from './createGraphQlType';
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
      // Fallback to using index if input does not have a name
      [component.name || componentIndex]: {
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
