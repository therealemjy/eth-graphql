import { JsonFragment } from '@ethersproject/abi';
import { expect } from '@jest/globals';

import formatToSignature from '../formatToSignature';

const testJsonFragment: JsonFragment = {
  inputs: [
    {
      internalType: 'string',
      name: '',
      type: 'string',
    },
    {
      internalType: 'uint256',
      name: 'someUint',
      type: 'uint256',
    },
    {
      internalType: 'int256[2]',
      name: '',
      type: 'int256[2]',
    },
    {
      components: [
        {
          internalType: 'uint256',
          name: 'id',
          type: 'uint256',
        },
        {
          internalType: 'string',
          name: 'title',
          type: 'string',
        },
        {
          internalType: 'enum TestContract.Status',
          name: 'status',
          type: 'uint8',
        },
        {
          components: [
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              internalType: 'address',
              name: 'walletAddress',
              type: 'address',
            },
          ],
          internalType: 'struct TestContract.Director',
          name: 'director',
          type: 'tuple',
        },
      ],
      internalType: 'struct TestContract.Movie[]',
      name: 'someMovies',
      type: 'tuple[]',
    },
    {
      components: [
        {
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
        {
          internalType: 'address',
          name: 'walletAddress',
          type: 'address',
        },
      ],
      internalType: 'struct TestContract.Director[2]',
      name: 'someDirectors',
      type: 'tuple[2]',
    },
    {
      internalType: 'enum TestContract.Status[4]',
      name: 'someStatuses',
      type: 'uint8[4]',
    },
  ],
  name: 'mayhem',
  outputs: [
    {
      components: [
        {
          internalType: 'uint256',
          name: 'id',
          type: 'uint256',
        },
        {
          internalType: 'string',
          name: 'title',
          type: 'string',
        },
        {
          internalType: 'enum TestContract.Status',
          name: 'status',
          type: 'uint8',
        },
        {
          components: [
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              internalType: 'address',
              name: 'walletAddress',
              type: 'address',
            },
          ],
          internalType: 'struct TestContract.Director',
          name: 'director',
          type: 'tuple',
        },
      ],
      internalType: 'struct TestContract.Movie[]',
      name: 'passedMovies',
      type: 'tuple[]',
    },
    {
      internalType: 'uint256',
      name: '',
      type: 'uint256',
    },
    {
      internalType: 'enum TestContract.Status[4]',
      name: 'statuses',
      type: 'uint8[4]',
    },
    {
      components: [
        {
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
        {
          internalType: 'address',
          name: 'walletAddress',
          type: 'address',
        },
      ],
      internalType: 'struct TestContract.Director',
      name: 'director',
      type: 'tuple',
    },
  ],
  stateMutability: 'pure',
  type: 'function',
};

describe('createSchema/formatToSignature', () => {
  it('formats function ABI to signature', () => {
    const result = formatToSignature(testJsonFragment);

    expect(result).toMatchInlineSnapshot(
      `"mayhem(string,uint256,int256[2],(uint256,string,uint8,(string,address))[],(string,address)[2],uint8[4])"`,
    );
  });
});
