import { providers } from 'ethers';

import erc20Abi from './abis/erc20.json';

const RPC_PROVIDER_URL = 'https://ethereum.publicnode.com';
const provider = new providers.JsonRpcProvider(RPC_PROVIDER_URL);

const config = {
  chains: {
    1: {
      provider,
    },
  },
  contracts: [
    {
      name: 'SHIB',
      address: {
        1: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      },
      abi: erc20Abi,
    },
    {
      name: 'ERC20',
      abi: erc20Abi,
    },
  ],
};

export default config;
