import { expect } from '@jest/globals';
import type { providers } from 'ethers';

import { Config } from '../../types';
import validateConfig from '../validateConfig';

describe('createLink/validateConfig', () => {
  it('returns error related to duplicated contract names correctly', () => {
    const duplicatedContractName0 = 'duplicatedContractName0';
    const duplicatedContractName1 = 'duplicatedContractName1';

    const fakeConfig: Config = {
      provider: {} as providers.Provider,
      contracts: [
        {
          abi: [],
          name: 'fakeContractName1',
        },
        {
          abi: [],
          name: duplicatedContractName0,
        },
        {
          abi: [],
          name: duplicatedContractName0,
        },
        {
          abi: [],
          name: 'fakeContractName2',
        },
        {
          abi: [],
          name: duplicatedContractName1,
        },
        {
          abi: [],
          name: duplicatedContractName1,
        },
      ],
    };

    const result = validateConfig(fakeConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "error": "Errors found in config: 
       - "name" property value of contracts must be unique. Duplicated contract names found: duplicatedContractName0, duplicatedContractName1. Update the names of the listed contracts to make them unique.",
        "isValid": false,
      }
    `);
  });

  it('returns error related to invalid contract names correctly', () => {
    const invalidContractName = 'invalid contract-name';

    const fakeConfig: Config = {
      provider: {} as providers.Provider,
      contracts: [
        {
          abi: [],
          name: 'fakeContractName 1',
        },
        {
          abi: [],
          name: invalidContractName,
        },
      ],
    };

    const result = validateConfig(fakeConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "error": "Errors found in config: 
       - "name" property value of contracts must only contain numbers, letters and underscores. Invalid contract names found: fakeContractName 1, invalid contract-name. Update the names of the listed contracts so they only contain numbers, letters and underscores.",
        "isValid": false,
      }
    `);
  });

  it('lists multiples errors correctly', () => {
    const invalidContractName = 'invalid contract-name';
    const duplicatedContractName = 'duplicatedContractName0';

    const fakeConfig: Config = {
      provider: {} as providers.Provider,
      contracts: [
        {
          abi: [],
          name: invalidContractName,
        },
        {
          abi: [],
          name: duplicatedContractName,
        },
        {
          abi: [],
          name: duplicatedContractName,
        },
      ],
    };

    const result = validateConfig(fakeConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "error": "Errors found in config: 
       - "name" property value of contracts must only contain numbers, letters and underscores. Invalid contract names found: invalid contract-name. Update the names of the listed contracts so they only contain numbers, letters and underscores.
       - "name" property value of contracts must be unique. Duplicated contract names found: duplicatedContractName0. Update the names of the listed contracts to make them unique.",
        "isValid": false,
      }
    `);
  });

  it('returns valid output when provided config is valid', () => {
    const fakeConfig: Config = {
      provider: {} as providers.Provider,
      contracts: [
        {
          abi: [],
          name: 'fakeContractName1',
        },
        {
          abi: [],
          name: 'fakeContractName2',
        },
      ],
    };

    const result = validateConfig(fakeConfig);

    expect(result).toMatchInlineSnapshot(`
      {
        "isValid": true,
      }
    `);
  });
});
