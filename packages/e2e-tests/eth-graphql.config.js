// TODO: find way to improve that (and accept modules?)
const testContractInfo = require('./artifacts/contracts/TestContract.sol/TestContract.json');
const constants = require('./constants');

const contracts = [
  {
    name: 'TestContract',
    address: {
      [constants.MAINNET_CHAIN_ID]: '0x0c03eCB91Cb50835e560a7D52190EB1a5ffba797',
    },
    abi: testContractInfo.abi,
  },
];

module.exports = {
  default: contracts,
};
