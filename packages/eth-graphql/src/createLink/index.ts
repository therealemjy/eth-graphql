import { ApolloLink, Observable } from '@apollo/client/core';
import { graphql } from 'graphql';
import { print } from 'graphql/language/printer';

import EthGraphQlError from '../EthGraphQlError';
import createSchema from '../createSchema';
import { Config } from '../types';
import validateConfig from './validateConfig';

const createLink = (config: Config) => {
  // Validate user config
  const configValidation = validateConfig(config);

  if (!configValidation.isValid) {
    throw new EthGraphQlError(configValidation.error);
  }

  return new ApolloLink(
    operation =>
      new Observable(observer => {
        graphql({
          schema: createSchema(config),
          source: print(operation.query),
          variableValues: operation.variables,
        }).then(result => {
          observer.next(result);
          observer.complete();
        });
      }),
  );
};

export default createLink;
