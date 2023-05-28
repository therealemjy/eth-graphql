const erc20Abi = require('./abis/erc20.json');

const contracts = [
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
];

module.exports = {
  default: contracts,
};
