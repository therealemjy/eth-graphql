import { JsonFragment } from '@ethersproject/abi';
import type { providers } from 'ethers';

export interface ContractConfig {
  name: string;
  abi: JsonFragment[];
  address?: {
    [chainId: number]: string;
  };
}

export interface ChainConfig {
  provider: providers.Provider;
  multicallAddress?: string;
}

export interface Config {
  chains: {
    [chainId: number]: ChainConfig;
  };
  contracts: ContractConfig[];
}

export type SoliditySingleValue = string | number | boolean | null | undefined | object;
export type SolidityValue = SoliditySingleValue | SoliditySingleValue[];
