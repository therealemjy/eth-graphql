import { JsonRpcProvider } from 'ethers';
import { Contract, Provider } from 'ethcall';
import { GraphQLResolveInfo, Kind } from 'graphql';

import BigIntScalar from './scalars/BigInt';

import { ContractCall, Config, ContractConfig } from './types';
import createGraphQLSchema from './createGraphQLSchema';

interface CreateSchemaInput {
  config: Config;
  contracts: ContractConfig[];
}

const createSchema = ({ config, contracts }: CreateSchemaInput) => {
  // Generate contract mapping. An instance of each contract is created for each
  // chain supported and mapped to the corresponding chain id
  const contractMapping = contracts.reduce<{
    [contractName: string]: {
      [chainId: number]: Contract;
    };
  }>(
    (contractsAcc, { name, address, abi }) => ({
      ...contractsAcc,
      [name]: Object.keys(address).reduce<{
        [chainId: number]: Contract;
      }>(
        (chainIdsAcc, chainId) => ({
          ...chainIdsAcc,
          [chainId]: new Contract(address[Number(chainId)], abi),
        }),
        {},
      ),
    }),
    {},
  );

  const provider = new JsonRpcProvider(config.rpcProviderUrl);

  // Generate resolvers
  const resolvers = {
    BigInt: BigIntScalar,

    Query: {
      Contracts: async (
        _obj: unknown,
        { chainId }: { chainId: number },
        _context: unknown,
        info: GraphQLResolveInfo,
      ) => {
        // Find Contracts node
        const fieldNodes = info.fieldNodes.filter(
          fieldNode => fieldNode.name.value === info.fieldName,
        );

        // Ensure there's only one Contracts node
        if (fieldNodes.length > 1) {
          // TODO: set human-friendlier error
          throw new Error('Only one Contracts query is supported');
        }

        const fieldNode = fieldNodes[0];

        // Go through Contracts node to extract requests to make
        const calls = fieldNode.selectionSet!.selections.reduce<ContractCall[]>(
          (accCalls, contractSelection) => {
            // Ignore __typename and non-field selections
            if (
              contractSelection.kind !== Kind.FIELD ||
              contractSelection.name.value === '__typename'
            ) {
              return accCalls;
            }

            const contractName = contractSelection.name.value;
            const contract = contractMapping[contractName][chainId];

            // Go through call nodes
            const contractCalls = contractSelection.selectionSet!.selections.reduce<ContractCall[]>(
              (accContractCalls, callSelection) => {
                // Ignore __typename and non-field selections
                if (
                  callSelection.kind !== Kind.FIELD ||
                  callSelection.name.value === '__typename'
                ) {
                  return accContractCalls;
                }

                // Extract arguments
                const contractCallArguments = (callSelection.arguments || []).reduce<
                  ReadonlyArray<string | boolean>
                >(
                  (accArguments, argument) =>
                    'value' in argument.value
                      ? [...accArguments, argument.value.value]
                      : accArguments,
                  [],
                );

                // Shape call
                const contractCall: ContractCall = {
                  contractName: contractName,
                  call: contract[callSelection.name.value](...contractCallArguments),
                };

                return [...accContractCalls, contractCall];
              },
              [],
            );

            return accCalls.concat(contractCalls);
          },
          [],
        );

        const ethCallProvider = new Provider(chainId, provider);
        const multicallResults = await ethCallProvider.all(calls.map(({ call }) => call));

        // Shape and return results
        return multicallResults.reduce<{
          [contractName: string]: {
            [methodName: string]: unknown;
          };
        }>((accResults, result, index) => {
          const contractCall = calls[index];
          const contractName = contractCall.contractName;

          return {
            ...accResults,
            [contractName]: {
              ...(accResults[contractName] || {}),
              [contractCall.call.name]: result,
            },
          };
        }, {});
      },
    },
  };

  return {
    typeDefs: createGraphQLSchema(contracts),
    resolvers,
  };
};

export default createSchema;
