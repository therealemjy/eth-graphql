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

  // TODO: add smaller tests for each data type (string, int, uint etc...)

  it('returns the correct data when calling a method that returns nothing', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getNothing
            }

            TestContract2(addresses: $addresses) {
              getNothing
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

  it('returns the correct data when calling a method that returns a string', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getString
            }

            TestContract2(addresses: $addresses) {
              getString
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

  it('returns the correct data when calling a method that returns a named string', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getNamedString
            }

            TestContract2(addresses: $addresses) {
              getNamedString
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

  it('returns the correct data when calling a method that returns a boolean', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getBoolean
            }

            TestContract2(addresses: $addresses) {
              getBoolean
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

  it('returns the correct data when calling a method that returns an address', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getAddress
            }

            TestContract2(addresses: $addresses) {
              getAddress
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

  it('returns the correct data when calling a method that returns bytes', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getBytes
            }

            TestContract2(addresses: $addresses) {
              getBytes
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

  it('returns the correct data when calling a method that returns a uint', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getUint
            }

            TestContract2(addresses: $addresses) {
              getUint
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

  it('returns the correct data when calling a method that returns an int', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getInt
            }

            TestContract2(addresses: $addresses) {
              getInt
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

  it('returns the correct data when calling a method that returns a tuple', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getTuple
            }

            TestContract2(addresses: $addresses) {
              getTuple
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

  it('returns the correct data when calling a method that returns multiple values', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getMultipleValues {
                value0
                value1
                value2 {
                  name
                  walletAddress
                }
              }
            }

            TestContract2(addresses: $addresses) {
              getMultipleValues {
                value0
                value1
                value2 {
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
        addresses: [TEST_CONTRACT_ADDRESS, TEST_CONTRACT_2_ADDRESS],
      },
    });

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns a struct', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getAnyMovie {
                id
                title
                status
                director {
                  name
                  walletAddress
                }
              }
            }

            TestContract2(addresses: $addresses) {
              getAnyMovie {
                id
                title
                status
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
        addresses: [TEST_CONTRACT_ADDRESS, TEST_CONTRACT_2_ADDRESS],
      },
    });

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns an array of structs', async function () {
    // Make GraphQL request
    const client = initClient();

    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              getAllMovies {
                id
                title
                status
                director {
                  name
                  walletAddress
                }
              }
            }

            TestContract2(addresses: $addresses) {
              getAllMovies {
                id
                title
                status
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

  it.skip('returns the correct data when calling MULT fields', async function () {
    // Make GraphQL request
    const client = initClient();
    const { data } = await client.query({
      query: gql`
        query ($chainId: Int!, $addresses: [String!]!) {
          contracts(chainId: $chainId) {
            TestContract {
              passInt_MULT(args: [{ someInt: 1 }, { someInt: 2 }, { someInt: 3 }])
            }

            TestContract2(addresses: $addresses) {
              passInt_MULT(args: [{ someInt: 1 }, { someInt: 2 }, { someInt: 3 }])
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
