import EthGraphQlError from '../EthGraphQlError';

describe('EthGraphQlError', () => {
  test('should wrap message with prefix', async () => {
    const error = new EthGraphQlError('fake error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchInlineSnapshot(`[Error: [eth-graphql] fake error]`);
  });
});
