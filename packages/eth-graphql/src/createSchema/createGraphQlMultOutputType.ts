import { GraphQLList, GraphQLNonNull, GraphQLOutputType } from 'graphql';

import { SharedGraphQlTypes } from './types';

const createGraphQlMultOutputType = ({
  outputType,
  contractFieldName,
  sharedGraphQlTypes,
}: {
  outputType: GraphQLOutputType;
  contractFieldName: string;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) => {
  if (!sharedGraphQlTypes.outputs[contractFieldName]) {
    sharedGraphQlTypes.outputs[contractFieldName] = new GraphQLNonNull(new GraphQLList(outputType));
  }

  return sharedGraphQlTypes.outputs[contractFieldName];
};

export default createGraphQlMultOutputType;
