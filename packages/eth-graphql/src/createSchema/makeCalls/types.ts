import { JsonFragment } from '@ethersproject/abi';
import { Contract } from 'ethers';

import { SolidityValue } from '../../types';

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

export interface ContractData {
  [methodName: string]: SolidityValue;
}
