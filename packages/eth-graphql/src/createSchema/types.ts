import { JsonFragment } from '@ethersproject/abi';
import { Contract } from 'ethers';
import { GraphQLInputType, GraphQLOutputType } from 'graphql';

import { ContractConfig, SolidityValue } from '../types';

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

export interface ContractCall {
  contractName: string;
  contractInstance: Contract;
  contractFunctionSignature: string;
  callArguments: readonly SolidityValue[];
  fieldName: string;
  abiItem: JsonFragment;
  isMult: boolean;
  indexInResultArray?: number;
}
