import { JsonFragment } from 'ethers';
import {
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  ThunkObjMap,
} from 'graphql';

import createGraphQlType from './createGraphQlType';
import formatToEntityName from './formatToEntityName';
import { SharedGraphQlTypes } from './types';

const createGraphQlOutputTypes = ({
  abiItem,
  sharedGraphQlTypes,
}: {
  abiItem: JsonFragment;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) => {
  const abiItemOutputs = abiItem.outputs || [];

  // Map single output to a single type
  if (abiItemOutputs.length === 1) {
    return createGraphQlType({
      isInput: false,
      component: abiItemOutputs[0],
      sharedGraphQlTypes,
    }) as GraphQLOutputType;
  }

  // Map array output to an object
  return new GraphQLNonNull(
    new GraphQLObjectType({
      name: `${abiItem.name!}Output`,
      fields: abiItemOutputs.reduce<
        ThunkObjMap<GraphQLFieldConfig<{ [key: string]: unknown }, unknown, unknown>>
      >(
        (accArgs, component, componentIndex) => ({
          ...accArgs,
          // Fallback to using index if input does not have a name
          [formatToEntityName({ name: component.name, index: componentIndex, type: 'value' })]: {
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
