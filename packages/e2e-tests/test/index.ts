import multiCallUtilsContractInfo from '@0xsequence/wallet-contracts/artifacts/contracts/modules/utils/MultiCallUtils.sol/MultiCallUtils.json';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { expect } from 'chai';
import chai from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import { createLink } from 'eth-graphql';
import { ethers } from 'hardhat';

import { MAINNET_CHAIN_ID, MULTICALL_CONTRACT_ADDRESS } from '../constants';

chai.use(chaiJestSnapshot);

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

const initClient = () => {
  const link = createLink({
    provider: ethers.provider,
    multicallAddress: MULTICALL_CONTRACT_ADDRESS,
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return client;
};

describe('end-to-end tests', function () {
  this.beforeAll(async function () {
    // Deploy test contract
    const TestContract = await ethers.getContractFactory('TestContract');
    await TestContract.deploy();

    // Deploy multicall contract
    const MulticallContract = await ethers.getContractFactory(
      multiCallUtilsContractInfo.abi,
      multiCallUtilsContractInfo.bytecode,
    );
    await MulticallContract.deploy();
  });

  it('returns the correct data when calling a contract with a defined address', async function () {
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
                status
              }
              movies(arg0: 0) {
                id
                title
                status
                director {
                  name
                  walletAddress
                }
              }
              getAllMovies {
                id
                title
                status
                director {
                  name
                  walletAddress
                }
              }
              getMultipleValues {
                value0
                value1
                value2 {
                  name
                  walletAddress
                }
              }
              getNothing
              getString
              getNamedString
              getBoolean
              getAddress
              getBytes
              getUint
              getInt
              getTuple
              overloadedFn0(arg0: 10) {
                value0
                value1
              }
              overloadedFn1 {
                value0
                value1
              }
              overloadedFn2(arg0: "some-string", arg1: "10000000000000000000", arg2: "") {
                value0
                value1
              }
              passUnnamedString(arg0: "some-string")
              passString(someString: "some-string")
              passBoolean(someBoolean: true)
              passAddress(someAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111")
              passBytes(
                someBytes: "0xed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd"
              )
              passUint(someUint: "128738121231267831231323")
              passInt(someInt: 1265341)
              passTuple(someTuple: ["0", "1", "2"])
              passMovie(
                someMovie: {
                  id: "0"
                  title: "fake movie"
                  status: "1"
                  director: {
                    name: "fake director"
                    walletAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111"
                  }
                }
              ) {
                id
                title
                status
                director {
                  name
                  walletAddress
                }
              }
              mayhem(
                arg0: "fake string"
                someUint: 671432189
                arg2: ["1000000000000000000", "200000000000000000"]
                someMovies: [
                  {
                    id: "0"
                    title: "fake movie"
                    status: "1"
                    director: {
                      name: "fake director"
                      walletAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111"
                    }
                  }
                  {
                    id: "0"
                    title: "fake movie"
                    status: "1"
                    director: {
                      name: "fake director"
                      walletAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111"
                    }
                  }
                ]
                someDirectors: [
                  {
                    name: "fake director"
                    walletAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111"
                  }
                  {
                    name: "fake director"
                    walletAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111"
                  }
                ]
                someStatuses: [0, 1, 1, 1]
              ) {
                passedMovies {
                  id
                  title
                  status
                  director {
                    name
                    walletAddress
                  }
                }
                value1
                statuses
                director {
                  name
                  walletAddress
                }
              }
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

  it.skip('returns the correct data when calling a contract with dynamic addresses', async function () {
    // Make GraphQL request
    const client = initClient();
    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract2(addresses: $addresses) {
              getAnyMovie {
                id
                title
                status
              }
              # TODO: add other fields
            }
          }
        }
      `,
      variables: {
        chainId: MAINNET_CHAIN_ID,
        addresses: ['1', '2', '3'],
      },
    });

    expect(data).to.matchSnapshot();
  });
});
