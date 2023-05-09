import { JsonFragment } from '@ethersproject/abi';
import { expect } from '@jest/globals';

import formatToFieldName from '../formatToFieldName';

const testAbi: JsonFragment[] = [
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    name: 'uniqueFn',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    name: 'overloadedFn',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'overloadedFn',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'overloadedFn',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
];

describe('createSchema/formatToFieldName', () => {
  it('returns name property unchanged if it is unique within passed ABI', () => {
    const fakeName = 'uniqueFn';

    const result = formatToFieldName({
      name: fakeName,
      indexInAbi: 0,
      abi: testAbi,
    });

    expect(result).toEqual(fakeName);
  });

  it('returns name property with a relative index appended to it if it is overloaded within the provided ABI', () => {
    const fakeName = 'overloadedFn';

    const result = formatToFieldName({
      name: fakeName,
      indexInAbi: 1,
      abi: testAbi,
    });

    expect(result).toEqual(`${fakeName}0`);
  });
});
