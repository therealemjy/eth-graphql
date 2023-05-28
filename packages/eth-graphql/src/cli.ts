#!/usr/bin/env node
import { Command } from 'commander';
import { providers } from 'ethers';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import open from 'open';
import path from 'path';

import createSchema from './createSchema';

const program = new Command();

const PORT = 8008;
const GRAPHIQL_ROUTE = '/eth-call-graphiql';
const GRAPHIQL_URL = `http://localhost:${PORT}${GRAPHIQL_ROUTE}`;

program
  .requiredOption('-r, --rpc <rpcProviderUrl>', 'URL of the RPC provider to use')
  .requiredOption('-c, --config <configFilePath>', 'Path of the config file')
  .option('-m, --multicall <multicallAddress>', 'Address of the mutlicall contract to use')
  .action(() => {
    // Build schema
    const options = program.opts();
    const { rpc: rpcProviderUrl, config: configFilePath, multicall: multicallAddress } = options;

    const provider = new providers.JsonRpcProvider(rpcProviderUrl);

    // Load contracts' config
    const absoluteConfigFilePath = path.resolve(configFilePath);
    const { default: contracts } = require(absoluteConfigFilePath);

    const schema = createSchema({
      provider,
      contracts,
      multicallAddress,
    });

    // Create express server and open GraphiQL route
    const app = express();

    app.use(
      GRAPHIQL_ROUTE,
      graphqlHTTP({
        schema,
        graphiql: true,
      }),
    );

    app.listen(PORT, () => {
      console.log(`GraphiQL is running at: ${GRAPHIQL_URL}`);
    });

    // Open page in browser
    open(GRAPHIQL_URL).catch(console.error);
  });

program.parse();
