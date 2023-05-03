import type { Call } from 'ethcall';
import type { Provider as EthersProvider, JsonFragment } from 'ethers';

export interface ContractConfig {
  name: string;
  address: {
    [chainId: number]: string;
  };
  abi: JsonFragment[];
}

export interface Config {
  provider: EthersProvider;
}

export interface ContractCall {
  call: Call;
  contractName: string;
}

type SoliditySingleValue = string | number | bigint | boolean | object;
export type SolidityValue = SoliditySingleValue | Array<SoliditySingleValue>;
