import { expect } from '@jest/globals';

import formatToEntityName from '../formatToEntityName';

const fakeName = 'FakeName';

describe('createSchema/formatToEntityName', () => {
  it('return name if it is defined', () => {
    const result = formatToEntityName({
      name: fakeName,
      index: 0,
      type: 'value',
    });

    expect(result).toEqual(fakeName);
  });

  it('return generated name if provided name is undefined', () => {
    const result = formatToEntityName({
      name: undefined,
      index: 0,
      type: 'value',
    });

    expect(result).toEqual('value0');
  });
});
