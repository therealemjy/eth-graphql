import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createLink } from 'eth-graphql';

import config from './ethGraphQlConfig';

const link = createLink(config.default);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default client;
