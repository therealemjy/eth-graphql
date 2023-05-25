import { JsonFragment } from '@ethersproject/abi';
import type { ContractFunction, providers } from 'ethers';

export interface ContractConfig {
  name: string;
  abi: JsonFragment[];
  address?: {
    [chainId: number]: string;
  };
}

export interface Config {
  provider: providers.Provider;
  // TODO: add multicallAddress parameter
}

export interface ContractCall {
  call: ContractFunction;
  fieldName: string;
  contractName: string;
}

type SoliditySingleValue = string | number | bigint | boolean | object;
export type SolidityValue = SoliditySingleValue | Array<SoliditySingleValue>;
