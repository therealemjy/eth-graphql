import { ApolloLink, Observable } from '@apollo/client/core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { print } from 'graphql/language/printer';

import createSchema from './createSchema';
import loadUserConfig from './loadUserConfig';
import { Config } from './types';

const createLink = (config: Config) => {
  // Load user config
  const contracts = loadUserConfig();

  console.log(
    createSchema({
      config,
      contracts,
    }),
  );

  return new ApolloLink(
    operation =>
      new Observable(observer => {
        graphql({
          schema: makeExecutableSchema(
            createSchema({
              config,
              contracts,
            }),
          ),
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
