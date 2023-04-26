import { ApolloLink } from '@apollo/client/core';
import { Call } from 'ethcall';
import { JsonFragment } from 'ethers';
import * as graphql from 'graphql';
import { GraphQLResolveInfo } from 'graphql';

interface ContractConfig {
    name: string;
    address: {
        [chainId: number]: string;
    };
    abi: JsonFragment[];
}
interface Config {
    rpcProviderUrl: string;
}
interface ContractCall {
    call: Call;
    contractName: string;
}

declare const createLink: (config: Config) => ApolloLink;

interface CreateSchemaInput {
    config: Config;
    contracts: ContractConfig[];
}
declare const createSchema: ({ config, contracts }: CreateSchemaInput) => {
    typeDefs: graphql.DocumentNode;
    resolvers: {
        BigInt: graphql.GraphQLScalarType<string, bigint>;
        Query: {
            Contracts: (_obj: unknown, { chainId }: {
                chainId: number;
            }, _context: unknown, info: GraphQLResolveInfo) => Promise<{
                [contractName: string]: {
                    [methodName: string]: unknown;
                };
            }>;
        };
    };
};

export { Config, ContractCall, ContractConfig, createLink, createSchema };
