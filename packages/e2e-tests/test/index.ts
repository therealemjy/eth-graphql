import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
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
async function deployTestContractFixture() {
  const TestContract = await ethers.getContractFactory('TestContract');
  const testContract = await TestContract.deploy();

  const testContractAddress = testContract.address;
  console.log('testContractAddress', testContractAddress);

  // TODO: Mock config to include deployed contracts address

  const link = createLink({
    // @ts-ignore
    provider: ethers.provider,
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return client;
}

describe('end-to-end tests', function () {
  it('should return the correct data', async function () {
    const client = await loadFixture(deployTestContractFixture);

    // Make GraphQL request
    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!) {
          contracts(chainId: $chainId) {
            TestContract {
              getMovieTitle
            }
          }
        }
      `,
      variables: {
        chainId: MAINNET_CHAIN_ID,
      },
    });

    console.log(data);

    expect(data).to.matchSnapshot();
  });
});
