import { providers } from '@0xsequence/multicall';
import { GraphQLResolveInfo, Kind } from 'graphql';

import makeCalls, { MakeCallsInput } from '../';
import EthGraphQlError from '../../../EthGraphQlError';

jest.mock('../../../EthGraphQlError');
jest.mock('../formatGraphQlArgs');

const mockedContractName = 'TestContract';
const mockedChainId = 1;

const mockedGraphqlResolveInfo = {
  fieldName: 'contracts',
  fieldNodes: [
    {
      kind: Kind.FIELD,
      name: {
        kind: Kind.NAME,
        value: 'contracts',
      },
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: mockedContractName,
            },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: Kind.SELECTION_SET,
              selections: [
                {
                  kind: Kind.FIELD,
                  name: {
                    kind: Kind.NAME,
                    value: 'getString',
                  },
                  arguments: [],
                  directives: [],
                },
                {
                  kind: Kind.FIELD,
                  name: {
                    kind: Kind.NAME,
                    value: '__typename',
                  },
                  arguments: [],
                  directives: [],
                },
              ],
            },
          },
          {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: '__typename',
            },
            arguments: [],
            directives: [],
          },
        ],
      },
    },
  ],
  variableValues: {},
} as unknown as GraphQLResolveInfo;

const mockedMulticallProvider = {} as providers.MulticallProvider;

const mockedDefaultArgs: MakeCallsInput = {
  graphqlResolveInfo: mockedGraphqlResolveInfo,
  contractMapping: {
    [mockedContractName]: {
      address: {
        [mockedChainId]: '0xd130B43062D875a4B7aF3f8fc036Bc6e9D3E1B3E',
      },
      abi: [],
    },
  },
  fieldMapping: {
    [mockedContractName]: {
      getString: 'getString',
    },
  },
  multicallProvider: mockedMulticallProvider,
  chainId: 1,
};

describe('createSchema/makeCalls', () => {
  it('should return an empty object when "contracts" fieldNode is not found', async () => {
    const result = await makeCalls({
      ...mockedDefaultArgs,
      graphqlResolveInfo: {
        ...mockedGraphqlResolveInfo,
        fieldNodes: [],
      },
    });

    expect(result).toEqual({});
  });

  it('should throw an error when address property is missing for a contract', async () => {
    const mockedArgs: MakeCallsInput = {
      ...mockedDefaultArgs,
      contractMapping: {
        [mockedContractName]: {
          address: {},
          abi: [],
        },
      },
      graphqlResolveInfo: mockedGraphqlResolveInfo,
    };

    try {
      await makeCalls(mockedArgs);

      throw new Error('makeCalls should have thrown an error but did not');
    } catch (error) {
      expect(error).toBeInstanceOf(EthGraphQlError);
      expect(EthGraphQlError).toHaveBeenCalledWith(
        `Missing address for ${mockedContractName} contract for chain ID ${mockedChainId}`,
      );
    }
  });

  it.todo(
    'should return results in the correct shape when calling a contract with a defined address',
  );
});
