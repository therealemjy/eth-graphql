import { JsonFragment } from '@ethersproject/abi';
import { GraphQLOutputType } from 'graphql';

import createGraphQlType from './createGraphQlType';
import { GraphQlVoid } from './scalars';
import { SharedGraphQlTypes } from './types';

const createGraphQlOutputTypes = ({
  abiItem,
  sharedGraphQlTypes,
}: {
  abiItem: JsonFragment;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) => {
  const abiItemOutputs = abiItem.outputs || [];

  // Map no output to void
  if (abiItemOutputs.length === 0) {
    // Ideally we'd return an undefined or null type, but GraphQL does not
    // permit that so instead we return a nullable string
    return GraphQlVoid;
  }

  return createGraphQlType({
    isInput: false,
    component:
      abiItemOutputs.length === 1
        ? // Map single output to a single type
          abiItemOutputs[0]
        : // Map array output to an object
          {
            ...abiItem,
            components: abiItemOutputs,
            type: 'tuple',
            internalType: `${abiItem.name}Output`,
          },
    sharedGraphQlTypes,
  }) as GraphQLOutputType;
};

export default createGraphQlOutputTypes;
