import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createLink } from 'eth-graphql';
import { providers } from 'ethers';

import contracts from './contracts';

const RPC_PROVIDER_URL = 'https://ethereum.publicnode.com';
const ethereumMainnetProvider = new providers.JsonRpcProvider(RPC_PROVIDER_URL);

const link = createLink({
  chains: {
    1: {
      provider: ethereumMainnetProvider,
    },
  },
  contracts: contracts.default,
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default client;
