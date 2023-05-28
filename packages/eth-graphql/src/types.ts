import { JsonFragment } from '@ethersproject/abi';
import type { providers } from 'ethers';

export interface ContractConfig {
  name: string;
  abi: JsonFragment[];
  address?: {
    [chainId: number]: string;
  };
}

export interface Config {
  provider: providers.Provider;
  contracts: ContractConfig[];
  multicallAddress?: string;
}

export type SoliditySingleValue = string | number | bigint | boolean | object;
export type SolidityValue = SoliditySingleValue | SoliditySingleValue[];
