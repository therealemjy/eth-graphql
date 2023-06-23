import { JsonFragment } from '@ethersproject/abi';
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

export interface FieldNameMapping {
  [contractName: string]: {
    [fieldName: string]: {
      contract: ContractConfig;
      abiItem: JsonFragment;
      isMult: boolean;
    };
  };
}
