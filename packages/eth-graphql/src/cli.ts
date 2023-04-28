#!/usr/bin/env node
import { Command } from 'commander';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import open from 'open';

import createSchema from './createSchema';
import loadUserConfig from './loadUserConfig';

const program = new Command();

// Because JSON does not know how to handle BigInt values, we update the
// prototype of BigInt so it returns a string when being parsed to JSON
// @ts-ignore toJSON does exist on the prototype of BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const PORT = 8008;
const GRAPHIQL_ROUTE = '/eth-call-graphiql';

const GRAPHIQL_URL = `http://localhost:${PORT}${GRAPHIQL_ROUTE}`;

program
  .option('--rpcProviderUrl', 'URL of the RPC provider to use with GraphiQL')
  .action((_str, options) => {
    // Build schema
    const contracts = loadUserConfig();
    const schema = createSchema({
      config: {
        rpcProviderUrl: options.first,
      },
      contracts,
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
