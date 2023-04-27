import { Call } from 'ethcall';
import type { JsonFragment } from 'ethers';
import { DocumentNode } from 'graphql';

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
