import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { expect } from 'chai';
import chai from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import { createLink } from 'eth-graphql';
import { ethers } from 'hardhat';

import { MAINNET_CHAIN_ID } from '../constants';

chai.use(chaiJestSnapshot);

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

// Create fixture for TestContract
function initClient() {
  const link = createLink({
    provider: ethers.provider,
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return client;
}

describe('end-to-end tests', function () {
  this.beforeAll(async function () {
    const TestContract = await ethers.getContractFactory('TestContract');
    await TestContract.deploy();
  });

  it('should return the correct data', async function () {
    // Make GraphQL request
    const client = initClient();
    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!) {
          contracts(chainId: $chainId) {
            TestContract {
              getAnyMovie {
                id
                title
              }
              movies(arg0: 0) {
                id
                title
                director {
                  name
                  walletAddress
                }
              }
              getAllMovies {
                id
                title
                director {
                  name
                  walletAddress
                }
              }
              getMultipleValuesExample {
                value0
                value1
                value2 {
                  name
                  walletAddress
                }
              }
              getByteExample
              getBooleanExample
              getStringExample
              getUintExample
              getIntExample
              getTupleExample
              overloadedFn0(arg0: 10)
              overloadedFn1
              overloadedFn2(arg0: "some-string", arg1: "10000000000000000000", arg2: "")
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
});
