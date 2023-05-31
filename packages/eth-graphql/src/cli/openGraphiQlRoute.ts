import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import open from 'open';

import createSchema from '../createSchema';
import { Config } from '../types';

export interface openGraphiQlRouteInput {
  port: number;
  route: string;
  config: Config;
}

const openGraphiQlRoute = ({ route, port, config }: openGraphiQlRouteInput) => {
  // Load config and create schema
  const schema = createSchema(config);

  // Create express server and open GraphiQL route
  const app = express();

  app.use(
    route,
    graphqlHTTP({
      schema,
      graphiql: true,
    }),
  );

  app.listen(port, () => {
    console.log(`GraphiQL is running at: ${route}`);
  });

  // Open page in browser
  open(route).catch(console.error);
};

export default openGraphiQlRoute;
