import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  networks: {
    hardhat: {
      forking: {
        url: process.env['MAINNET_FORKING_RPC_URL'] || '',
      },
    },
  },
};

export default config;
