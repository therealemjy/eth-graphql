// TODO: find way to improve that (and accept modules?)
const testContractInfo = require('./artifacts/contracts/TestContract.sol/TestContract.json');
const { TEST_CONTRACT_ADDRESS } = require('./constants');

const contracts = [
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
];

module.exports = {
  default: contracts,
};
