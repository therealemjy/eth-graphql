import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';

import { DEPLOYER_ACCOUNT_MNEMONIC } from './constants';

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  networks: {
    hardhat: {
      accounts: {
        mnemonic: DEPLOYER_ACCOUNT_MNEMONIC,
      },
    },
  },
};

export default config;
