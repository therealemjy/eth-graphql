import { JsonFragment } from 'ethers';
import {
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  ThunkObjMap,
} from 'graphql';

import createGraphQlType from './createGraphQlType';
import formatToFieldName from './formatToFieldName';
import { SharedGraphQlTypes } from './types';

const createGraphQlOutputTypes = ({
  abiItem,
  sharedGraphQlTypes,
}: {
  abiItem: JsonFragment;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) => {
  const abiItemOutputs = abiItem.outputs || [];

  if (abiItemOutputs.length === 1) {
    return createGraphQlType({
      isInput: false,
      component: abiItemOutputs[0],
      sharedGraphQlTypes,
    }) as GraphQLOutputType;
  }

  // Map array outputs to an object
  return new GraphQLNonNull(
    new GraphQLObjectType({
      name: `${abiItem.name!}Output`,
      fields: abiItemOutputs.reduce<
        ThunkObjMap<GraphQLFieldConfig<{ [key: string]: unknown }, unknown, unknown>>
      >(
        (accArgs, component, componentIndex) => ({
          ...accArgs,
          // Fallback to using index if input does not have a name
          [formatToFieldName({ name: component.name, index: componentIndex })]: {
            type: createGraphQlType({
              isInput: false,
              component,
              sharedGraphQlTypes,
            }) as GraphQLNonNull<GraphQLOutputType>,
          },
        }),
        {},
      ),
    }),
  );
};

export default createGraphQlOutputTypes;
