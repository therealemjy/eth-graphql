import { GraphQLInputType, GraphQLOutputType } from 'graphql';

export interface SharedGraphQlTypes {
  inputs: {
    [key: string]: GraphQLInputType;
  };
  outputs: {
    [key: string]: GraphQLOutputType;
  };
}
