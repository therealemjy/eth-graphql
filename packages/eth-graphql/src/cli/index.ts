#!/usr/bin/env node
import { Command } from 'commander';

import { GRAPHIQL_URL, PORT } from '../constants';
import loadFile from './loadFile';
import openGraphiQlRoute from './openGraphiQlRoute';

const program = new Command();

program.requiredOption('-c, --config <configFilePath>', 'Path to the config file').action(() => {
  // Build schema
  const options = program.opts();
  const { config: configFilePath } = options;
  const config = loadFile(configFilePath);

  openGraphiQlRoute({
    port: PORT,
    route: GRAPHIQL_URL,
    config,
  });
});

program.parse();
