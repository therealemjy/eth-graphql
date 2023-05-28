const contracts = require('./contracts');
const { providers } = require('ethers');

const RPC_PROVIDER_URL = 'https://ethereum.publicnode.com';
const provider = new providers.JsonRpcProvider(RPC_PROVIDER_URL);

const config = {
  chains: {
    1: {
      provider,
    },
  },
  contracts: contracts.default,
};

module.exports = {
  default: config,
};
