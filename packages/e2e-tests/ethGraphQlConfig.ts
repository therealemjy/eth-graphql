import { Config } from 'eth-graphql';
import { ethers } from 'hardhat';

import testContractInfo from './artifacts/contracts/TestContract.sol/TestContract.json';
import { MULTICALL_CONTRACT_ADDRESS, TEST_CONTRACT_ADDRESS } from './constants';

const config: Config = {
  chains: {
    1: {
      provider: ethers.provider,
      multicallAddress: MULTICALL_CONTRACT_ADDRESS,
    },
  },
  contracts: [
    {
      name: 'TestContract',
      address: {
        1: TEST_CONTRACT_ADDRESS,
      },
      abi: testContractInfo.abi,
    },
    {
      name: 'TestContract2',
      abi: testContractInfo.abi,
    },
  ],
};

export default config;
