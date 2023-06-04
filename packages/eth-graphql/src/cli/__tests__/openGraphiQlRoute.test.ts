import createSchema from '../../createSchema';
import { Config } from '../../types';
import openGraphiQlRoute from '../openGraphiQlRoute';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema } from 'graphql';
import open from 'open';

jest.mock('open');
jest.mock('express');
jest.mock('express-graphql');
jest.mock('../../createSchema');

describe('cli/openGraphiQlRoute', () => {
  test('should open a GraphiQL route', async () => {
    const fakeConfig = {} as Config;
    const fakeSchema = {} as GraphQLSchema;

    (createSchema as jest.Mock).mockImplementation(() => fakeSchema);

    const mockedUse = jest.fn();
    const mockedListen = jest.fn((_route, callback) => callback());
    (express as unknown as jest.Mock).mockImplementation(() => ({
      use: mockedUse,
      listen: mockedListen,
    }));

    (open as unknown as jest.Mock).mockImplementation(() => ({
      catch: jest.fn(),
    }));

    const fakeRoute = '/fake-route';
    const fakePort = 1001;

    openGraphiQlRoute({
      port: fakePort,
      route: fakeRoute,
      config: fakeConfig,
    });

    expect(createSchema).toHaveBeenCalledTimes(1);
    expect(createSchema).toHaveBeenCalledWith(fakeSchema);

    expect(express).toHaveBeenCalledTimes(1);

    expect(mockedUse).toHaveBeenCalledTimes(1);
    expect(mockedUse).toHaveBeenCalledWith(fakeRoute, undefined);

    expect(mockedListen).toHaveBeenCalledTimes(1);
    expect(mockedListen).toHaveBeenCalledWith(fakePort, expect.any(Function));

    expect(graphqlHTTP).toHaveBeenCalledTimes(1);
    expect(graphqlHTTP).toHaveBeenCalledWith({
      schema: fakeSchema,
      graphiql: true,
    });

    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(`http://localhost:${fakePort}${fakeRoute}`);
  });
});
