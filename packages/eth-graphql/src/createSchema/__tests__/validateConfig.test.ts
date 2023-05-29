import { providers } from 'ethers';

import { Config } from '../../types';
import validateConfig from '../validateConfig';

const defaultFakeConfig: Config = {
  chains: {
    1: {
      provider: {} as providers.Provider,
    },
  },
  contracts: [],
};

describe('validateConfig', () => {
  it('validates correctly when contract names only contain letters, numbers, and underscores', () => {
    const mockConfig: Config = {
      ...defaultFakeConfig,
      contracts: [
        { abi: [], name: 'Contract1' },
        { abi: [], name: 'Contract_2' },
        { abi: [], name: 'Contract3' },
      ],
    };

    const result = validateConfig(mockConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "isValid": true,
      }
    `);
  });

  it('returns an error when contract names contain invalid characters', () => {
    const mockConfig: Config = {
      ...defaultFakeConfig,
      contracts: [
        { abi: [], name: 'Contract$' },
        { abi: [], name: 'Contract_2' },
        { abi: [], name: 'Contract3' },
      ],
    };

    const result = validateConfig(mockConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "error": "Errors found in config: 
       - "name" property value of contracts must only contain numbers, letters and underscores. Invalid contract names found: Contract$. Update the names of the listed contracts so they only contain numbers, letters and underscores.",
        "isValid": false,
      }
    `);
  });

  it('returns an error when contract names are duplicated', () => {
    const mockConfig: Config = {
      ...defaultFakeConfig,
      contracts: [
        { abi: [], name: 'Contract' },
        { abi: [], name: 'Contract' },
        { abi: [], name: 'Contract3' },
      ],
    };

    const result = validateConfig(mockConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "error": "Errors found in config: 
       - "name" property value of contracts must be unique. Duplicated contract names found: Contract. Update the names of the listed contracts to make them unique.",
        "isValid": false,
      }
    `);
  });

  it('returns multiple errors when multiple issues are found', () => {
    const mockConfig: Config = {
      ...defaultFakeConfig,
      contracts: [
        { abi: [], name: 'Contract$' },
        { abi: [], name: 'Contract$' },
        { abi: [], name: 'Contract3' },
      ],
    };

    const result = validateConfig(mockConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "error": "Errors found in config: 
       - "name" property value of contracts must only contain numbers, letters and underscores. Invalid contract names found: Contract$, Contract$. Update the names of the listed contracts so they only contain numbers, letters and underscores.
       - "name" property value of contracts must be unique. Duplicated contract names found: Contract$. Update the names of the listed contracts to make them unique.",
        "isValid": false,
      }
    `);
  });
});
