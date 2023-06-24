import multiCallUtilsContractInfo from '@0xsequence/wallet-contracts/artifacts/contracts/modules/utils/MultiCallUtils.sol/MultiCallUtils.json';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { expect } from 'chai';
import chai from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import { createLink } from 'eth-graphql';
import { ethers } from 'hardhat';

import { MAINNET_CHAIN_ID, TEST_CONTRACT_2_ADDRESS, TEST_CONTRACT_ADDRESS } from '../constants';
import config from '../ethGraphQlConfig';
import { FINAL_BOSS_CALL_FRAGMENT } from './finalBossCallFragment';

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

const makeQuery = async (fields: string) => {
  const client = initClient();

  const { data } = await client.query({
    query: gql`
      query ($chainId: Int!, $addresses: [String!]!) {
        contracts(chainId: $chainId) {
          TestContract {
            ${fields}
          }

          TestContract2(addresses: $addresses) {
            ${fields}
          }
        }
      }
    `,
    variables: {
      chainId: MAINNET_CHAIN_ID,
      addresses: [TEST_CONTRACT_ADDRESS, TEST_CONTRACT_2_ADDRESS],
    },
  });

  return data;
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

  it('returns the correct data when calling a method that returns nothing', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getNothing
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns a string', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getString
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns a named string', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getNamedString
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns a boolean', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getBoolean
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns an address', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getAddress
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns bytes', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getBytes
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns a uint', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getUint
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns an int', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getInt
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns a tuple', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getTuple
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns multiple values', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getMultipleValues {
        value0
        value1
        value2 {
          name
          walletAddress
        }
      }
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns a struct', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getAnyMovie {
        id
        title
        status
        director {
          name
          walletAddress
        }
      }
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that returns an array of structs', async function () {
    const data = await makeQuery(/* GraphQL */ `
      getAllMovies {
        id
        title
        status
        director {
          name
          walletAddress
        }
      }
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns an unnamed string', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passUnnamedString(arg0: "some string")
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns a string', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passString(someString: "some string")
      passString_MULT(
        args: [{ someString: "some string 0" }, { someString: "some string 1" }]
      )
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns a boolean', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passBoolean(someBoolean: true)
      passBoolean_MULT(args: [{ someBoolean: true }, { someBoolean: false }])
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns an address', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passAddress(someAddress: "0xD2547e4AA4f5a2b0a512BFd45C9E3360FeEa48Df")
      passAddress_MULT(
        args: [
          { someAddress: "0xD2547e4AA4f5a2b0a512BFd45C9E3360FeEa48Df" }
          { someAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111" }
        ]
      )
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns bytes', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passBytes(
        someBytes: "0xed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd"
      )
      passBytes_MULT(
        args: [
          {
            someBytes: "0xed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd"
          }
          {
            someBytes: "0xed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd"
          }
        ]
      )
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns a uint', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passUint(someUint: "128738121231267831231323")
      passUint_MULT(
        args: [{ someUint: "128738121231267831231323" }, { someUint: "1678238" }]
      )
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns an int', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passInt(someInt: 1265341)
      passInt_MULT(args: [{ someInt: 1265341 }, { someInt: 9871 }])
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns a tuple', async function () {
    const data = await makeQuery(/* GraphQL */ `
      passTuple(someTuple: ["0", "1", "2"])
      passTuple_MULT(
        args: [{ someTuple: ["0", "1", "2"] }, { someTuple: ["1", "0", "1"] }]
      )
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling overloaded methods', async function () {
    const data = await makeQuery(/* GraphQL */ `
      overloadedFn0(arg0: 10) {
        value0
        value1
      }
      overloadedFn0_MULT(args: [{ arg0: 10 }, { arg0: 6 }]) {
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
      overloadedFn2_MULT(
        args: [
          { arg0: "some-string-0", arg1: "10000000000000000000", arg2: "1" }
          { arg0: "some-string-1", arg1: "20000000000000000000", arg2: "8" }
        ]
      ) {
        value0
        value1
      }
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling a method that takes and returns a struct', async function () {
    const data = await makeQuery(/* GraphQL */ `
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
      passMovie_MULT(
        args: [
          {
            someMovie: {
              id: "0"
              title: "fake movie 0"
              status: "1"
              director: {
                name: "fake director 0"
                walletAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111"
              }
            }
          }
          {
            someMovie: {
              id: "1"
              title: "fake movie 1"
              status: "0"
              director: {
                name: "fake director 1"
                walletAddress: "0xA5ae0b2386De51Aba852551A1EE828BfD598E111"
              }
            }
          }
        ]
      ) {
        id
        title
        status
        director {
          name
          walletAddress
        }
      }
    `);

    expect(data).to.matchSnapshot();
  });

  it('returns the correct data when calling multiple contracts with either a defined address of dynamic addresses', async function () {
    const data = await makeQuery(FINAL_BOSS_CALL_FRAGMENT);

    expect(data).to.matchSnapshot();
  });
});
