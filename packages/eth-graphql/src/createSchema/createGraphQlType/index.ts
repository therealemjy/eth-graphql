import { JsonFragmentType } from 'ethers';
import { GraphQLBoolean, GraphQLList, GraphQLString } from 'graphql';

import { BigIntScalar } from '../../scalars';
import { SharedGraphQlTypes } from '../types';
import getOrSetSharedGraphQlInputType from './getOrSetSharedGraphQlInputType';

function createGraphQlType<TIsInput extends boolean>({
  isInput,
  component,
  sharedGraphQlTypes,
}: {
  isInput: TIsInput;
  component: JsonFragmentType;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) {
  // TODO: improve type
  let graphQlType: any = BigIntScalar;

  const componentType = component.type?.replace('[]', '');

  // Handle tuples
  if (componentType === 'tuple' && component.internalType) {
    graphQlType = getOrSetSharedGraphQlInputType({
      isInput,
      component,
      sharedGraphQlTypes,
    });
  } else if (componentType === 'string' || componentType === 'address') {
    graphQlType = GraphQLString;
  } else if (componentType === 'bool') {
    graphQlType = GraphQLBoolean;
  }

  // Detect if input is an array
  if (component.type?.slice(-2) === '[]') {
    graphQlType = new GraphQLList(graphQlType);
  }

  return graphQlType;
}
export default createGraphQlType;
