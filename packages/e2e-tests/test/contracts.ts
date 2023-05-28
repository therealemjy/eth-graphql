import testContractInfo from '../artifacts/contracts/TestContract.sol/TestContract.json';
import { TEST_CONTRACT_ADDRESS } from '../constants';

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

export default contracts;
