import { JsonFragment } from '@ethersproject/abi';
import type { ContractFunction, providers } from 'ethers';

export interface ContractConfig {
  name: string;
  address: {
    [chainId: number]: string;
  };
  abi: JsonFragment[];
}

export interface Config {
  provider: providers.Provider;
}

export interface ContractCall {
  call: ContractFunction;
  fieldName: string;
  contractName: string;
}

type SoliditySingleValue = string | number | bigint | boolean | object;
export type SolidityValue = SoliditySingleValue | Array<SoliditySingleValue>;
