import commander from 'commander';

import { GRAPHIQL_ROUTE, PORT } from '../../constants';
import { Config } from '../../types';
import loadFile from '../loadFile';
import openGraphiQlRoute from '../openGraphiQlRoute';

jest.mock('commander');
jest.mock('../loadFile');
jest.mock('../openGraphiQlRoute');

describe('cli', () => {
  test('should call commander and openGraphiQlRoute correctly', async () => {
    const mockedParse = jest.fn();
    const mockedAction = jest.fn(callback => callback());
    const mockedRequiredOption = jest.fn(() => ({
      action: mockedAction,
    }));

    const fakeConfigFilePath = 'fake/file/path';
    const mockedOpts = jest.fn(() => ({
      config: fakeConfigFilePath,
    }));

    (commander.Command as jest.Mock).mockImplementation(() => ({
      opts: mockedOpts,
      parse: mockedParse,
      requiredOption: mockedRequiredOption,
    }));

    const fakeConfig = {} as Config;
    (loadFile as jest.Mock).mockImplementation(() => fakeConfig);

    await import('..');

    expect(mockedRequiredOption).toHaveBeenCalledTimes(1);

    expect(mockedAction).toHaveBeenCalledTimes(1);

    expect(mockedParse).toHaveBeenCalledTimes(1);
    expect(mockedOpts).toHaveBeenCalledTimes(1);

    expect(loadFile).toHaveBeenCalledTimes(1);
    expect(loadFile).toHaveBeenCalledWith(fakeConfigFilePath);

    expect(openGraphiQlRoute).toHaveBeenCalledTimes(1);
    expect(openGraphiQlRoute).toHaveBeenCalledWith({
      port: PORT,
      route: GRAPHIQL_ROUTE,
      config: fakeConfig,
    });
  });
});
