// TODO: find way to improve that (and accept modules?)
const testContractInfo = require('./artifacts/contracts/TestContract.sol/TestContract.json');

const contracts = [
  {
    name: 'TestContract',
    address: {
      // TODO: find way to pass address of contract deployed during tests
      1: '0x1c39BA375faB6a9f6E0c01B9F49d488e101C2011',
    },
    abi: testContractInfo.abi,
  },
];

module.exports = {
  default: contracts,
};
