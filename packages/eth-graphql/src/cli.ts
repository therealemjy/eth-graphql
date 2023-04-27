#!/usr/bin/env node
import createSchema from './createSchema';
import loadUserConfig from './loadUserConfig';

const createGraphiQlRoute = () => {
  const contracts = loadUserConfig();
  const schema = createSchema({
    config: {
      rpcProviderUrl: '', // TODO: get from command arguments
    },
    contracts,
  });

  console.log('ROUTE CREATED', schema);
};

createGraphiQlRoute();

export default createGraphiQlRoute;
