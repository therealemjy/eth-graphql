import { JsonFragment } from '@ethersproject/abi';

import filterAbiItems from '../filterAbiItems';

describe('utilities/filterAbiItems', () => {
  it('should filter out non-function items', () => {
    const input: JsonFragment[] = [
      { type: 'function', name: 'function1', stateMutability: 'view' },
      { type: 'event', name: 'event1', stateMutability: 'pure' },
    ];

    const output = filterAbiItems(input);
    expect(output).toEqual([input[0]]);
  });

  it('should filter out items without name', () => {
    const input: JsonFragment[] = [
      { type: 'function', name: 'function1', stateMutability: 'view' },
      { type: 'function', stateMutability: 'pure' },
    ];

    const output = filterAbiItems(input);
    expect(output).toEqual([input[0]]);
  });

  it('should filter out items with stateMutability not view or pure', () => {
    const input: JsonFragment[] = [
      { type: 'function', name: 'function1', stateMutability: 'view' },
      { type: 'function', name: 'function2', stateMutability: 'nonpayable' },
      { type: 'function', name: 'function3', stateMutability: 'pure' },
    ];

    const output = filterAbiItems(input);
    expect(output).toEqual([input[0], input[2]]);
  });

  it('should return an empty array when all items are filtered out', () => {
    const input: JsonFragment[] = [
      { type: 'event', name: 'event1', stateMutability: 'nonpayable' },
      { type: 'function', stateMutability: 'nonpayable' },
    ];

    const output = filterAbiItems(input);
    expect(output).toEqual([]);
  });
});
