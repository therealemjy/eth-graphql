import { ApolloLink, Observable } from '@apollo/client/core';
import { graphql } from 'graphql';
import { print } from 'graphql/language/printer';

import createSchema from './createSchema';
import { Config } from './types';

const createLink = (config: Config) =>
  new ApolloLink(
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

export default createLink;
