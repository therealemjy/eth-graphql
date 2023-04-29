#!/usr/bin/env node
import { ContractConfig } from '@src/types';

import convertAbiToGraphQlSchema from './convertAbiToGraphQlSchema';

type TypeDefMapping = {
  Contracts: string;
  [name: string]: string;
};

const generateGraphQLSchema = (contracts: ContractConfig[]) => {
  const typeDefMapping = contracts.reduce<TypeDefMapping>(
    (accTypeDefMapping, contractConfig, index) => ({
      ...accTypeDefMapping,
      [contractConfig.name]: convertAbiToGraphQlSchema(contractConfig.abi),
      Contracts:
        accTypeDefMapping.Contracts +
        `${index > 0 ? '\n  ' : ''}${contractConfig.name}: ${contractConfig.name}!`,
    }),
    {
      Contracts: '',
    },
  );

  const { Contracts, ...otherTypeDefs } = typeDefMapping;

  const generatedGraphQlSchema = `scalar BigInt

${Object.keys(otherTypeDefs)
  .map(
    typeDefName => `type ${typeDefName} {
  ${typeDefMapping[typeDefName]}
}
`,
  )
  .join('\n')}
type Contracts {
  ${Contracts}
}

type Query {
  Contracts(chainId: Int!): Contracts!
}
`;

  console.log(generatedGraphQlSchema);

  return generatedGraphQlSchema;
};

export default generateGraphQLSchema;
