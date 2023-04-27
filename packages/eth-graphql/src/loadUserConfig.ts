import { cosmiconfigSync } from 'cosmiconfig';

const USER_CONFIG_FILE_NAME = 'eth-graphql';

const loadUserConfig = () => {
  // TODO: check contract config is valid
  try {
    const configFile = cosmiconfigSync(USER_CONFIG_FILE_NAME).search();

    if (!configFile?.config) {
      throw new Error(`${USER_CONFIG_FILE_NAME} config file not found`);
    }

    // TODO: check config is in the right format

    return configFile.config.default;
  } catch (error) {
    console.log('error', error);
    // TODO: throw human-friendly error
    throw new Error(`${USER_CONFIG_FILE_NAME} config file not found`);
  }
};

export default loadUserConfig;
