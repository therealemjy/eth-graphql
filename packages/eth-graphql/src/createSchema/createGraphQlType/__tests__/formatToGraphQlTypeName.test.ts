import { expect } from '@jest/globals';

import formatToGraphQlTypeName from '../formatToGraphQlTypeName';

describe('createSchema/createGraphQlType/formatToGraphQlTypeName', () => {
  it('removes "struct "', () => {
    const result = formatToGraphQlTypeName('struct FakeStruct');
    expect(result).toMatchInlineSnapshot(`"FakeStruct"`);
  });

  it('replaces square brackets and their content', () => {
    const result = formatToGraphQlTypeName('string[3]');
    expect(result).toMatchInlineSnapshot(`"string"`);
  });

  it('replaces dots with underscores', () => {
    const result = formatToGraphQlTypeName('FakeContract.FakeStruct');
    expect(result).toMatchInlineSnapshot(`"FakeContract_FakeStruct"`);
  });

  it('formats argument to a valid GraphQL type name', () => {
    const result = formatToGraphQlTypeName('struct FakeContract.FakeStruct[19]');
    expect(result).toMatchInlineSnapshot(`"FakeContract_FakeStruct"`);
  });
});
