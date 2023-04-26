"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createLink: () => createLink_default,
  createSchema: () => createSchema_default
});
module.exports = __toCommonJS(src_exports);

// src/createLink.ts
var import_core2 = require("@apollo/client/core");
var import_graphql3 = require("graphql");
var import_printer = require("graphql/language/printer");
var import_schema = require("@graphql-tools/schema");

// src/loadContracts.ts
var import_cosmiconfig = require("cosmiconfig");
var loadContracts = () => {
  try {
    const configFile = (0, import_cosmiconfig.cosmiconfigSync)("unnamed-library").search();
    if (!(configFile == null ? void 0 : configFile.config)) {
      throw new Error("unnamed-library.config.js config file not found");
    }
    return configFile.config.default;
  } catch (error) {
    console.log("error", error);
    throw new Error("unnamed-library.config.js config file not found");
  }
};
var loadContracts_default = loadContracts;

// src/createSchema.ts
var import_ethers = require("ethers");
var import_ethcall = require("ethcall");
var import_graphql2 = require("graphql");

// src/scalars/BigInt.ts
var import_graphql = require("graphql");
var BigIntScalar = new import_graphql.GraphQLScalarType({
  name: "BigInt",
  description: "Custom scalar for BigInt values",
  serialize(value) {
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint") {
      throw new Error(
        "GraphQL BigInt Scalar serializer expected a string, number or BigInt object"
      );
    }
    return BigInt(value.toString());
  },
  parseValue(value) {
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint") {
      throw new Error(
        "GraphQL BigInt Scalar serializer expected a string, number or BigInt object"
      );
    }
    return value.toString();
  },
  parseLiteral(ast) {
    if (ast.kind !== import_graphql.Kind.STRING && ast.kind !== import_graphql.Kind.INT) {
      throw new Error("BigInt value needs to tbe a string or an integer");
    }
    return ast.value.toString();
  }
});
var BigInt_default = BigIntScalar;

// src/createGraphQLSchema/convertAbiToGraphQlSchema.ts
var getGraphQlInputType = (item) => {
  const inputTypeDef = (item.inputs || []).map((input) => {
    const type = "String!";
    return `${input.name}: ${type}`;
  }).join(", ");
  return inputTypeDef && `(${inputTypeDef})`;
};
var getGraphQlOutputType = () => "BigInt!";
var convertAbiToGraphQlSchema = (abi) => {
  const schemaTypeDef = abi.reduce((acc, abiItem) => {
    if (abiItem.type !== "function" || !abiItem.name) {
      return acc;
    }
    const inputTypeDef = getGraphQlInputType(abiItem);
    const outputTypeDef = getGraphQlOutputType();
    const methodTypeDef = `${abiItem.name}${inputTypeDef}: ${outputTypeDef}`;
    return [...acc, methodTypeDef];
  }, []).join("\n");
  return schemaTypeDef;
};
var convertAbiToGraphQlSchema_default = convertAbiToGraphQlSchema;

// src/createGraphQLSchema/index.ts
var import_core = require("@apollo/client/core");
var createGraphQLSchema = (contractConfigs) => {
  const typeDefMapping = contractConfigs.reduce(
    (accTypeDefMapping, contractConfig, index) => __spreadProps(__spreadValues({}, accTypeDefMapping), {
      [contractConfig.name]: convertAbiToGraphQlSchema_default(contractConfig.abi),
      Contracts: accTypeDefMapping.Contracts + `${index > 0 ? "\n" : ""}${contractConfig.name}: ${contractConfig.name}!`
    }),
    {
      Contracts: ""
    }
  );
  const _a = typeDefMapping, { Contracts } = _a, otherTypeDefs = __objRest(_a, ["Contracts"]);
  const generatedSchema = (0, import_core.gql)(`
    scalar BigInt

    ${Object.keys(otherTypeDefs).map(
    (typeDefName) => `
          type ${typeDefName} {
            ${typeDefMapping[typeDefName]}
          }
        `
  ).join("")}

    type Contracts {
      ${Contracts}
    }

    type Query {
      Contracts(chainId: Int!): Contracts!
    }
  `);
  return generatedSchema;
};
var createGraphQLSchema_default = createGraphQLSchema;

// src/createSchema.ts
var createSchema = ({ config, contracts }) => {
  const contractMapping = contracts.reduce(
    (contractsAcc, { name, address, abi }) => __spreadProps(__spreadValues({}, contractsAcc), {
      [name]: Object.keys(address).reduce(
        (chainIdsAcc, chainId) => __spreadProps(__spreadValues({}, chainIdsAcc), {
          [chainId]: new import_ethcall.Contract(address[Number(chainId)], abi)
        }),
        {}
      )
    }),
    {}
  );
  const provider = new import_ethers.JsonRpcProvider(config.rpcProviderUrl);
  const resolvers = {
    BigInt: BigInt_default,
    Query: {
      Contracts: (_0, _1, _2, _3) => __async(void 0, [_0, _1, _2, _3], function* (_obj, { chainId }, _context, info) {
        const fieldNodes = info.fieldNodes.filter(
          (fieldNode2) => fieldNode2.name.value === info.fieldName
        );
        if (fieldNodes.length > 1) {
          throw new Error("Only one Contracts query is supported");
        }
        const fieldNode = fieldNodes[0];
        const calls = fieldNode.selectionSet.selections.reduce(
          (accCalls, contractSelection) => {
            if (contractSelection.kind !== import_graphql2.Kind.FIELD || contractSelection.name.value === "__typename") {
              return accCalls;
            }
            const contractName = contractSelection.name.value;
            const contract = contractMapping[contractName][chainId];
            const contractCalls = contractSelection.selectionSet.selections.reduce(
              (accContractCalls, callSelection) => {
                if (callSelection.kind !== import_graphql2.Kind.FIELD || callSelection.name.value === "__typename") {
                  return accContractCalls;
                }
                const contractCallArguments = (callSelection.arguments || []).reduce(
                  (accArguments, argument) => "value" in argument.value ? [...accArguments, argument.value.value] : accArguments,
                  []
                );
                const contractCall = {
                  contractName,
                  call: contract[callSelection.name.value](
                    ...contractCallArguments
                  )
                };
                return [...accContractCalls, contractCall];
              },
              []
            );
            return accCalls.concat(contractCalls);
          },
          []
        );
        const ethCallProvider = new import_ethcall.Provider(chainId, provider);
        const multicallResults = yield ethCallProvider.all(
          calls.map(({ call }) => call)
        );
        return multicallResults.reduce((accResults, result, index) => {
          const contractCall = calls[index];
          const contractName = contractCall.contractName;
          return __spreadProps(__spreadValues({}, accResults), {
            [contractName]: __spreadProps(__spreadValues({}, accResults[contractName] || {}), {
              [contractCall.call.name]: result
            })
          });
        }, {});
      })
    }
  };
  return {
    typeDefs: createGraphQLSchema_default(contracts),
    resolvers
  };
};
var createSchema_default = createSchema;

// src/createLink.ts
var createLink = (config) => {
  const contracts = loadContracts_default();
  console.log(
    createSchema_default({
      config,
      contracts
    })
  );
  return new import_core2.ApolloLink(
    (operation) => new import_core2.Observable((observer) => {
      (0, import_graphql3.graphql)({
        schema: (0, import_schema.makeExecutableSchema)(
          createSchema_default({
            config,
            contracts
          })
        ),
        source: (0, import_printer.print)(operation.query),
        variableValues: operation.variables
      }).then((result) => {
        observer.next(result);
        observer.complete();
      });
    })
  );
};
var createLink_default = createLink;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createLink,
  createSchema
});
