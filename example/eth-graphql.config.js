const Erc20Abi = require('./abis/erc20.json');

const contracts = [
  {
    name: 'XVS',
    address: {
      97: '0xB9e0E753630434d7863528cc73CB7AC638a7c8ff',
    },
    abi: Erc20Abi,
  },
  {
    name: 'SXP',
    address: {
      97: '0xB9e0E753630434d7863528cc73CB7AC638a7c8ff',
    },
    abi: Erc20Abi,
  },
];

module.exports = {
  default: contracts,
};
