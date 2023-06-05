<p align="center"><img src="./doc-assets/banner.jpg" width="100%" /></p>

<h2 align="center">Query any blockchain data using GraphQL</h2>

<p align="center">eth-graphql is an Apollo link for retrieving contract data from EVM-compatible blockchains using GraphQL</p>

<p align="center"><img src="./doc-assets/screenshot-graphiql-header.png" width="100%"/></p>

## Killer features

🔄 Automatically generate GraphQL schema for invoking any blockchain contract

⚡️ Groups requests into one using multicall for optimal efficiency

🛠 Leverage all the features of GraphQL and Apollo Client tools, such as optimistic updates and cache normalization

🔬 Comprehensive TypeScript support via GraphQL Codegen

## Getting started

### Install eth-graphql and its peer dependencies

Using yarn:

```bash
yarn add eth-graphql @apollo/client@^3.x ethers@^5.x
```

or npm:

```bash
npm install eth-graphql @apollo/client@^3.x ethers@^5.x
```

### Setting up configuration File

Create a .js or .ts file (e.g.: ethGraphQlConfig.ts) which exports a `config`
object as default:

```typescript
import erc20Abi from "./abis/erc20.json";
import { Config } from "eth-graphql";
import { providers } from "ethers";

const RPC_PROVIDER_URL = "https://ethereum.publicnode.com";
const provider = new providers.JsonRpcProvider(RPC_PROVIDER_URL);

const config: Config = {
  chains: {
    1: {
      provider,
    },
  },
  contracts: [
    {
      name: "SHIB",
      address: {
        1: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
      },
      abi: erc20Abi,
    },
  ],
};

export default config;
```

_Note that if you want to use the example above, the ABI of the ERC20
contract can be found [here](example/src/abis/erc20.json)._

### Link creation and connection to Apollo Client

```typescript
import config from "./ethGraphQlConfig";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createLink } from "eth-graphql";

const link = createLink(config);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default client;
```

### Crafting your first query

You're now ready to write your first GraphQL query to fetch data from contracts
on the blockchain!

```typescript
import { gql } from "@apollo/client";

const { data } = await client.query({
  query: gql`
    query GetTokens {
      contracts(chainId: 1) {
        SHIB {
          decimals
        }
      }
    }
  `,
});

console.log(data.contracts.SHIB.decimals); // 18
```

### GraphiQL interface

To explore the generated client-side schema and experiment with your queries,
you can start a GraphiQL server using the following command:

```bash
yarn eth-graphql --config ./ethGraphQlConfig.ts
```

or with npm:

```bash
npm run eth-graphql --config ./ethGraphQlConfig.ts
```

_Note that the config option signifies the location of your config file, relative to the directory from which you're executing the command_

The command will automatically open
[http://localhost:8008/eth-call-graphiql](http://localhost:8008/eth-call-graphiql)
in your browser.

<p align="center"><img src="./doc-assets/screenshot-graphiql-example.png" width="100%"/></p>

## Multi-chain support

In the previous example, we've configured only one chain. However, the
configuration can be adapted to support contract calls on multiple chains:

```typescript
import erc20Abi from "./abis/erc20.json";
import { Config } from "eth-graphql";
import { providers } from "ethers";

const MAINNET_RPC_PROVIDER_URL = "https://ethereum.publicnode.com";
const mainnetProvider = new providers.JsonRpcProvider(MAINNET_RPC_PROVIDER_URL);

const TESTNET_RPC_PROVIDER_URL = "https://ethereum-goerli.publicnode.com";
const testnetProvider = new providers.JsonRpcProvider(TESTNET_RPC_PROVIDER_URL);

const config: Config = {
  chains: {
    1: {
      provider: mainnetProvider,
    },
    5: {
      provider: testnetProvider,
    },
  },
  contracts: [
    {
      name: "SHIB",
      address: {
        1: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
        2: "0x058d6Fb2828608C0422BB6C89F77CCaA9ea7A9b4",
      },
      abi: erc20Abi,
    },
  ],
};

export default config;
```

You can then select which chain to fetch data from when making your query:

```typescript
import { gql } from "@apollo/client";

const { data: mainnetData } = await client.query({
  query: gql`
    query GetTokens {
      contracts(chainId: 1) {
        SHIB {
          decimals
        }
      }
    }
  `,
});

const { data: testnetData } = await client.query({
  query: gql`
    query GetTokens {
      contracts(chainId: 2) {
        SHIB {
          decimals
        }
      }
    }
  `,
});
```

## Calling contracts using dynamic addresses

You can omit to set an `address` property for a contract:

```typescript
import { Config } from 'eth-graphql';
import { providers } from 'ethers';

import erc20Abi from './abis/erc20.json';

const RPC_PROVIDER_URL = 'https://ethereum.publicnode.com';
const provider = new providers.JsonRpcProvider(RPC_PROVIDER_URL);

const config: Config = {
  ...
  contracts: [
    {
      name: 'ERC20',
      abi: erc20Abi,
    },
  ],
};

export default config;
```

In which case you will be able to pass an array of contract addresses to fetch
when making your query. Results will be returned as an array of outputs, sorted
in the same order as the input addresses:

```typescript
import { gql } from "@apollo/client";

const { data } = await client.query({
  query: gql`
    query GetTokens {
      contracts(chainId: 1) {
        ERC20(
          addresses: [
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
          ]
        ) {
          name
        }
      }
    }
  `,
});

console.log(data.contracts.ERC20);
/* 
[{
  name: 'USD Coin'
}, {
  name: 'Uniswap'
}]
*/
```

## Using custom multicall addresses

eth-graphql uses the multicall contract from
[0xsequence](https://github.com/0xsequence/sequence.js/tree/master/packages/multicall)
to batch all the calls of a query into one. You can find the list of supported
networks
[here](https://github.com/0xsequence/sequence.js/tree/master/packages/multicall#supported-networks).

In case you want to interact with contracts on an unsupported network, or prefer
to use your own multicall contract, you can deploy 0xsequence's multicall
contract. The code can be found
[here](https://github.com/0xsequence/wallet-contracts/blob/master/src/contracts/modules/utils/MultiCallUtils.sol).
Once deployed, include the contract's address in your configuration as follows:

```typescript
import { Config } from 'eth-graphql';
import { providers } from 'ethers';

import erc20Abi from './abis/erc20.json';

const RPC_PROVIDER_URL = 'https://ethereum.publicnode.com';
const provider = new providers.JsonRpcProvider(RPC_PROVIDER_URL);

const config: Config = {
  chains: {
    1: {
      provider,
      multicallAddress: '0x' // Add multicall contract address here
    },
  },
  ...
};

export default config;
```

## Automatically generating types for queries with graphql-codegen

You can automatically generate TypeScript types for your queries using [graphql-codegen](https://the-guild.dev/graphql/codegen) and the `createSchema`
method from eth-graphql:

```typescript
// codegenConfig.ts
import ethGraphQlConfig from "./ethGraphQlConfig";
import type { CodegenConfig } from "@graphql-codegen/cli";
import { createSchema } from "eth-graphql";
import { printSchema } from "graphql";

const config: CodegenConfig = {
  overwrite: true,
  schema: printSchema(createSchema(ethGraphQlConfig)),
  documents: "**/*.tsx",
  generates: {
    ".gql/": {
      preset: "client",
      plugins: [],
      config: {
        scalars: {
          BigInt: "string",
        },
      },
    },
  },
};

export default config;
```

Visit graphql-codegen's
[documentation](https://the-guild.dev/graphql/codegen/docs/getting-started/installation)
to see how to install it on your project and automatically generate TypeScript
types for all your queries.

## Choices taken

This library is opinionated and choices were taken in order to make the GraphQL
query language work with any contract ABI.

### Uint and Int

Mapped to the custom scalar `BigInt`. It accepts an integer or a string as input
and always returns a string in the GraphQL schema.

e.g. ABI:

```json
[
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
```

Generated GraphQL:

```graphql
type ContractName {
  totalSupply: BigInt!
}
```

### Bytes, string, address

Mapped to a string.

e.g. ABI:

```json
[
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
```

Generated GraphQL:

```graphql
type ContractName {
  name: String!
}
```

### Struct

Mapped to an object using a generated GraphQL type (input or output).

e.g. ABI:

```json
[
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "internalType": "struct ContractName.Category",
        "name": "",
        "type": "tuple"
      }
    ],
    "name": "getMovie",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          }
        ],
        "internalType": "struct ContractName.Movie",
        "name": "",
        "type": "tuple"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
```

Generated GraphQL:

```graphql
type ContractName {
  getMovie(category: ContractName_CategoryInput!): ContractName_Movie!
}

input ContractName_CategoryInput {
  id: BigInt!
  name: String!
}

type ContractName_Movie {
  id: BigInt!
  title: String!
}
```

### Void output

Non-mutating functions that return nothing will return the custom scalar `Void`,
which returns `null` in the GraphQL schema.

e.g. ABI:

```json
[
  {
    "inputs": [],
    "name": "getNothing",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  }
]
```

Generated GraphQL:

```graphql
type ContractName {
  getNothing: Void
}
```

### Tuples (input and output)

GraphQL lacks the capability to assign a fixed length to arrays, whether they're
used as input or output. Hence, tuples are represented as arrays with
unspecified length in the GraphQL schema. However, supplying an array with an
incorrect length, as defined by the respective contract ABI, will trigger an
error.

e.g. ABI:

```json
[
  {
    "inputs": [
      {
        "internalType": "string[3]",
        "name": "someTuple",
        "type": "string[3]"
      }
    ],
    "name": "getTuple",
    "outputs": [
      {
        "internalType": "string[3]",
        "name": "",
        "type": "string[3]"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
]
```

Generated GraphQL:

```graphql
type ContractName {
  getTuple(someTuple: [String!]!): [String!]!
}
```

### Unnamed input arguments

In the GraphQL schema, unnamed input arguments are assigned a generated name
following the pattern: `argX`, where `X` represents the argument's position
within the function arguments.

e.g. ABI:

```json
[
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "passUnnamedString",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
]

```

Generated GraphQL:

```graphql
type ContractName {
  passUnnamedString(arg0: String!, arg1: BigInt!): String!
}
```

### Unnamed output properties

In the GraphQL schema, unnamed output properties are assigned a generated name
following the the pattern: `valueX`, where `X` represents the property's
position within the function output.

e.g. ABI:

```json
[
  {
    "inputs": [],
    "name": "getUnnamedValues",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```

Generated GraphQL:

```graphql
type ContractName {
  getUnnamedValues: getUnnamedValuesOutput!
}

type getUnnamedValuesOutput {
  value0: String!
  value1: BigInt!
}
```

### Overloaded functions

Overloaded functions are treated as separate functions, differentiated by their
names suffixed with their respective index within the ABI.

e.g. ABI:

```json
[
  {
    "inputs": [],
    "name": "overloadedFn",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "name": "overloadedFn",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
]
```

Generated GraphQL:

```graphql
type ContractName {
  overloadedFn0: overloadedFnOutput!
  overloadedFn1(arg0: BigInt!): overloadedFnOutput!
}

type overloadedFnOutput {
  id: BigInt!
}
```
