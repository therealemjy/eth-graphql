import { JsonFragment } from '@ethersproject/abi';
import { Contract } from 'ethers';

import { SolidityValue } from '../../types';

export interface ContractCallArgs {
  [argumentName: string]: SolidityValue;
}

export interface ContractCall {
  contractName: string;
  contractInstance: Contract;
  contractFunctionSignature: string;
  callArguments: ContractCallArgs;
  fieldName: string;
  abiItem: JsonFragment;
  isMult: boolean;
  indexInResultArray?: number;
}

export interface ContractData {
  [methodName: string]: SolidityValue;
}
