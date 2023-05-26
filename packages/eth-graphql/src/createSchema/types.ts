import { GraphQLInputType, GraphQLOutputType } from 'graphql';

import { ContractConfig } from '../types';

export interface SharedGraphQlTypes {
  inputs: {
    [key: string]: GraphQLInputType;
  };
  outputs: {
    [key: string]: GraphQLOutputType;
  };
}

export interface ContractMapping {
  [contractName: string]: Omit<ContractConfig, 'name'>;
}

export interface FieldNameMapping {
  [contractName: string]: {
    [fieldName: string]: string;
  };
}
