// TODO: load from project root. Once this project made into a module, the
// lib.contract.ts will be created by the user and located at the root of their
// project
import convertAbiToGraphQlSchema from './convertAbiToGraphQlSchema';
import { gql } from '@apollo/client/core';
import { ContractConfig } from '@src/types';

type TypeDefMapping = {
  Contracts: string;
  [name: string]: string;
};

// Generate GraphQL schema from user-defined contract settings
const createGraphQLSchema = (contractConfigs: ContractConfig[]) => {
  const typeDefMapping = contractConfigs.reduce<TypeDefMapping>(
    (accTypeDefMapping, contractConfig, index) => ({
      ...accTypeDefMapping,
      [contractConfig.name]: convertAbiToGraphQlSchema(contractConfig.abi),
      Contracts:
        accTypeDefMapping.Contracts +
        `${index > 0 ? '\n' : ''}${contractConfig.name}: ${contractConfig.name}!`,
    }),
    {
      Contracts: '',
    },
  );

  const { Contracts, ...otherTypeDefs } = typeDefMapping;

  const generatedSchema = gql(`
    scalar BigInt

    ${Object.keys(otherTypeDefs)
      .map(
        typeDefName => `
          type ${typeDefName} {
            ${typeDefMapping[typeDefName]}
          }
        `,
      )
      .join('')}

    type Contracts {
      ${Contracts}
    }

    type Query {
      Contracts(chainId: Int!): Contracts!
    }
  `);

  return generatedSchema;
};

export default createGraphQLSchema;
