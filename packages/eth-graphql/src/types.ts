import type { Call } from 'ethcall';
import type { JsonFragment } from 'ethers';

export interface ContractConfig {
  name: string;
  address: {
    [chainId: number]: string;
  };
  abi: JsonFragment[];
}

export interface Config {
  rpcProviderUrl: string;
}

export interface ContractCall {
  call: Call;
  contractName: string;
}

type SoliditySingleValue = string | number | bigint | boolean | object;
export type SolidityValue = SoliditySingleValue | Array<SoliditySingleValue>;
