import path from 'path';
import jiti from 'jiti';

import EthGraphQlError from './EthGraphQlError';

const loadFile = (filePath: string) => {
  const configFilePathComponents = filePath.split('.');
  const fileExtension = configFilePathComponents[configFilePathComponents.length - 1];

  if (fileExtension !== 'js' && fileExtension !== 'ts') {
    throw new EthGraphQlError(
      `Incorrect file extension for config: ${fileExtension}. Convert your config file to a .js or .ts file`,
    );
  }

  const loader = jiti('', { interopDefault: true });

  // @ts-ignore
  console.log(loader.getMockImplementation());

  const absoluteFilePath = path.resolve(filePath);
  const config = loader(absoluteFilePath);

  return config;
};

export default loadFile;
