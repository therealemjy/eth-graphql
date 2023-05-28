import type { CodegenConfig } from '@graphql-codegen/cli';
import { createSchema } from 'eth-graphql';
import { printSchema } from 'graphql';

import ethGraphQlConfig from './src/ethGraphQlConfig';

const config: CodegenConfig = {
  overwrite: true,
  schema: printSchema(createSchema(ethGraphQlConfig)),
  documents: '**/*.tsx',
  generates: {
    '.gql/': {
      preset: 'client',
      plugins: [],
      config: {
        scalars: {
          BigInt: 'string',
        },
      },
    },
  },
};

export default config;
