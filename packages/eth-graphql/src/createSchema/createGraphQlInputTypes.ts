import { JsonFragmentType } from 'ethers';
import { GraphQLFieldConfig } from 'graphql';

import createGraphQlType from './createGraphQlType';
import { SharedGraphQlTypes } from './types';

const createGraphQlInputTypes = ({
  components,
  sharedGraphQlTypes,
}: {
  components: ReadonlyArray<JsonFragmentType>;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) =>
  // TODO: make all inputs required
  components.reduce<GraphQLFieldConfig<unknown, unknown, unknown>['args']>(
    (accArgs, input, inputIndex) => ({
      ...accArgs,
      // Fallback to using index if input does not have a name
      [input.name || inputIndex]: {
        type: createGraphQlType({
          isInput: true,
          component: input,
          sharedGraphQlTypes,
        }),
      },
    }),
    {},
  );

export default createGraphQlInputTypes;
