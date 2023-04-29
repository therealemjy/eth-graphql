import { cosmiconfigSync } from 'cosmiconfig';

import { ContractConfig } from './types';

const USER_CONFIG_FILE_NAME = 'eth-graphql';

const loadUserConfig = () => {
  try {
    const configFile = cosmiconfigSync(USER_CONFIG_FILE_NAME).search();

    if (!configFile?.config) {
      throw new Error(`${USER_CONFIG_FILE_NAME} config file not found`);
    }

    // TODO: validate config Rules:
    // - each contract must have all field defined and at least one address
    //   property
    // - each contract name must be unique
    // - each contract must have the same address properties

    return configFile.config.default as ContractConfig[];
  } catch (error) {
    console.log('error', error);
    // TODO: throw human-friendly error
    throw new Error(`${USER_CONFIG_FILE_NAME} config file not found`);
  }
};

export default loadUserConfig;
