import jiti from 'jiti';
import path from 'path';

import EthGraphQlError from '../../EthGraphQlError';
import loadFile from '../loadFile';

jest.mock('jiti');
jest.mock('path');
jest.mock('../../EthGraphQlError');

describe('cli/loadFile', () => {
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

  test('should return config object when given a valid .js or .ts file', () => {
    const fakeFileContent = 'mocked file content';
    const fakeFilePath = 'test.js';
    const fakeAbsoluteFilePath = '/fake/file/path/test.js';

    const mockedLoader = jest.fn(() => fakeFileContent);
    const mockedJiti = jest.fn(() => mockedLoader);
    const mockedPathResolve = jest.fn(() => fakeAbsoluteFilePath);

    (jiti as jest.Mock).mockImplementation(mockedJiti);
    (path.resolve as jest.Mock).mockImplementation(mockedPathResolve);

    const config = loadFile(fakeFilePath);

    expect(mockedJiti).toHaveBeenCalledTimes(1);
    expect(mockedPathResolve).toHaveBeenCalledTimes(1);
    expect(mockedPathResolve).toHaveBeenCalledWith(fakeFilePath);
    expect(mockedLoader).toHaveBeenCalledTimes(1);
    expect(mockedLoader).toHaveBeenCalledWith(fakeAbsoluteFilePath);
    expect(config).toEqual(fakeFileContent);
  });
});
