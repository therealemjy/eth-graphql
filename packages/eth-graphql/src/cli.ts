#!/usr/bin/env node
import { Command } from 'commander';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import open from 'open';
import path from 'path';

import createSchema from './createSchema';

const program = new Command();

const PORT = 8008;
const GRAPHIQL_ROUTE = '/eth-call-graphiql';
const GRAPHIQL_URL = `http://localhost:${PORT}${GRAPHIQL_ROUTE}`;

program.requiredOption('-c, --config <configFilePath>', 'Path to the config file').action(() => {
  // Build schema
  const options = program.opts();
  const { config: configFilePath } = options;

  // Load contracts' config
  const absoluteConfigFilePath = path.resolve(configFilePath);
  const { default: config } = require(absoluteConfigFilePath);

  const schema = createSchema(config);

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
