import multiCallUtilsContractInfo from '@0xsequence/wallet-contracts/artifacts/contracts/modules/utils/MultiCallUtils.sol/MultiCallUtils.json';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { expect } from 'chai';
import chai from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import { createLink } from 'eth-graphql';
import { ethers } from 'hardhat';

import { MAINNET_CHAIN_ID, TEST_CONTRACT_2_ADDRESS, TEST_CONTRACT_ADDRESS } from '../constants';
import config from '../ethGraphQlConfig';
import { CALL_FRAGMENT } from './callFragment';

chai.use(chaiJestSnapshot);

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

const initClient = () => {
  const link = createLink(config);

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return client;
};

describe('end-to-end tests', function () {
  this.beforeAll(async function () {
    // Deploy test contracts
    const TestContract = await ethers.getContractFactory('TestContract');
    const deployedTestContract = await TestContract.deploy();
    console.log(`TestContract deployed at: ${deployedTestContract.address}`);

    const TestContract2 = await ethers.getContractFactory('TestContract');
    const deployedTestContract2 = await TestContract2.deploy();
    console.log(`TestContract2 deployed at: ${deployedTestContract2.address}`);

    // Deploy multicall contract
    const MulticallContract = await ethers.getContractFactory(
      multiCallUtilsContractInfo.abi,
      multiCallUtilsContractInfo.bytecode,
    );
    const deployedMulticallContract = await MulticallContract.deploy();
    console.log(`Multicall deployed at: ${deployedMulticallContract.address}`);
  });

  it.skip('test', async function () {
    // Make GraphQL request
    const client = initClient();
    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!) {
          contracts(chainId: $chainId) {
            TestContract {
              passInt_MULT(args: [{ someInt: 1 }, { someInt: 2 }, { someInt: 3 }])
            }
          }
        }
      `,
      variables: {
        chainId: MAINNET_CHAIN_ID,
      },
    });

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a contract with a defined address', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!) {
          contracts(chainId: $chainId) {
            TestContract {
              ${CALL_FRAGMENT}
            }
          }
        }
      `,
      variables: {
        chainId: MAINNET_CHAIN_ID,
      },
    });

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a contract with dynamic addresses', async function () {
    // Make GraphQL request
    const client = initClient();
    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract2(addresses: $addresses) {
              ${CALL_FRAGMENT}
            }
          }
        }
      `,
      variables: {
        chainId: MAINNET_CHAIN_ID,
        addresses: [TEST_CONTRACT_ADDRESS, TEST_CONTRACT_2_ADDRESS],
      },
    });

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling multiple contracts with either a defined address of dynamic addresses', async function () {
    // Make GraphQL request
    const client = initClient();
    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              ${CALL_FRAGMENT}
            }

            TestContract2(addresses: $addresses) {
              ${CALL_FRAGMENT}
            }
          }
        }
      `,
      variables: {
        chainId: MAINNET_CHAIN_ID,
        addresses: [TEST_CONTRACT_ADDRESS, TEST_CONTRACT_2_ADDRESS],
      },
    });

    expect(data).to.matchSnapshot();
  });
});
