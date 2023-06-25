import {
  GraphQLFieldConfigArgumentMap,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

import { SharedGraphQlTypes } from './types';

const createGraphQlMultInputTypes = ({
  inputTypes,
  contractFieldName,
  sharedGraphQlTypes,
}: {
  inputTypes: GraphQLFieldConfigArgumentMap;
  contractFieldName: string;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) => {
  const graphQlTypeName = `${contractFieldName}Input`;

  if (!sharedGraphQlTypes.inputs[graphQlTypeName]) {
    sharedGraphQlTypes.inputs[graphQlTypeName] = new GraphQLNonNull(
      new GraphQLList(
        new GraphQLNonNull(
          new GraphQLInputObjectType({
            name: graphQlTypeName,
            fields: inputTypes,
          }),
        ),
      ),
    );
  }

  const multInputType: GraphQLFieldConfigArgumentMap = {
    // "args" will be the name of the only argument of the mult field input
    args: {
      type: sharedGraphQlTypes.inputs[graphQlTypeName],
    },
  };

  return multInputType;
};

export default createGraphQlMultInputTypes;
