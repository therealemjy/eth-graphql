#!/usr/bin/env node

import loadUserConfig from '@src/loadUserConfig';

// Script to generate the GraphQL schema from the user-defined config
// (eth-graphql.config.js)
const generateGraphQLSchema = () => {
  const contracts = loadUserConfig();
  console.log('contracts', contracts);
};

generateGraphQLSchema();

export default generateGraphQLSchema;
