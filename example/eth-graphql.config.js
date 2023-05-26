// TODO: find way to improve that (and accept modules?)
const erc20Abi = require('./abis/erc20.json');
const poolLensAbi = require('./abis/poolLens.json');
const comptrollerAbi = require('./abis/comptroller.json');

const contracts = [
  {
    name: 'XVS',
    address: {
      97: '0xB9e0E753630434d7863528cc73CB7AC638a7c8ff',
    },
    abi: erc20Abi,
  },
  {
    name: 'SXP',
    address: {
      97: '0xB9e0E753630434d7863528cc73CB7AC638a7c8ff',
    },
    abi: erc20Abi,
  },
  {
    name: 'ERC20',
    abi: erc20Abi,
  },
  {
    name: 'PoolLens',
    address: {
      97: '0x7d6A1a595dCa742B4FF4Fb8684e3F018C3c0bEC0',
    },
    abi: poolLensAbi,
  },
  {
    name: 'Comptroller',
    address: {
      97: '0x94d1820b2D1c7c7452A163983Dc888CEC546b77D',
    },
    abi: comptrollerAbi,
  },
];

module.exports = {
  default: contracts,
};
