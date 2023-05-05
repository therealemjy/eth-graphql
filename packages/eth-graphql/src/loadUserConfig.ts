import { cosmiconfigSync } from 'cosmiconfig';

import { ContractConfig } from './types';

const USER_CONFIG_FILE_NAME = 'eth-graphql';
const ERROR_CONFIG_FILE_NOT_FOUND = `${USER_CONFIG_FILE_NAME} config file not found. Make sure to create a config file for eth-graphql and to place it at the root of your project.`;

const loadUserConfig = () => {
  const configFile = cosmiconfigSync(USER_CONFIG_FILE_NAME).search();

  if (!configFile?.config) {
    throw new Error(ERROR_CONFIG_FILE_NOT_FOUND);
  }

  // TODO: validate config Rules:
  // - each contract must have all field defined and at least one address
  //   property
  // - each contract name must be unique
  // - each contract must have the same address properties

  return configFile.config.default as ContractConfig[];
};

export default loadUserConfig;
