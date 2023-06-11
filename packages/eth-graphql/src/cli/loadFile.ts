import path from 'path';

import EthGraphQlError from '../EthGraphQlError';

require('tsconfig-paths/register');

// Programmatically set up ts-node so it transpiles TS files to JS at run time
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

const loadFile = (filePath: string) => {
  const configFilePathComponents = filePath.split('.');
  const fileExtension = configFilePathComponents[configFilePathComponents.length - 1];

  if (fileExtension !== 'js' && fileExtension !== 'ts') {
    throw new EthGraphQlError(
      `Incorrect file extension for config: ${fileExtension}. Convert your config file to a .js or .ts file`,
    );
  }

  const absoluteFilePath = path.resolve(filePath);
  const config = require(absoluteFilePath).default;

  return config;
};

export default loadFile;
