// TODO: find way to improve that (and accept modules?)
const testContractInfo = require('./artifacts/contracts/TestContract.sol/TestContract.json');

const contracts = [
  {
    name: 'TestContract',
    address: {
      // TODO: find way to pass address of contract deployed during tests
      1: '0x5E5713a0d915701F464DEbb66015adD62B2e6AE9',
    },
    abi: testContractInfo.abi,
  },
  {
    name: 'TestContract2',
    abi: testContractInfo.abi,
  },
];

module.exports = {
  default: contracts,
};
