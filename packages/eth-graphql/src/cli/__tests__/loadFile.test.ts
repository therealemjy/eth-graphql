import EthGraphQlError from '../../EthGraphQlError';
import loadFile from '../loadFile';

jest.mock('../../EthGraphQlError');

describe('loadFile', () => {
  test('should throw EthGraphQlError when given an invalid file extension', async () => {
    const invalidFileExtension = 'invalid';
    const filePath = `test.${invalidFileExtension}`;

    try {
      loadFile(filePath);

      throw new Error('loadFile should have thrown an error but did not');
    } catch (error) {
      expect(error).toBeInstanceOf(EthGraphQlError);
      expect(EthGraphQlError).toHaveBeenCalledTimes(1);
      expect(EthGraphQlError).toHaveBeenCalledWith(
        `Incorrect file extension for config: ${invalidFileExtension}. Convert your config file to a .js or .ts file`,
      );
    }
  });

  test('should load of .js file', async () => {
    const config = loadFile('./src/cli/__tests__/fakeConfig.js');

    expect(config).toEqual({
      foo: 'bar',
    });
  });

  test('should load of .ts file', async () => {
    const config = loadFile('./src/cli/__tests__/fakeConfig.ts');

    expect(config).toEqual({
      foo: 'bar',
    });
  });
});
