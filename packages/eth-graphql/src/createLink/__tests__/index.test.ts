import { ApolloLink } from '@apollo/client/core';
import { providers } from 'ethers';

import createLink from '../';
import { Config } from '../../types';

jest.mock('../../createSchema');

describe('createLink', () => {
  it('should create a valid link configuration', () => {
    const config: Config = {
      chains: {
        1: {
          multicallAddress: '',
          provider: {} as providers.Provider,
        },
      },
      contracts: [
        {
          name: 'FakeContract',
          abi: [],
        },
      ],
    };

    const link = createLink(config);

    expect(link).toBeInstanceOf(ApolloLink);
  });
});