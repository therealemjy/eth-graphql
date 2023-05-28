import { Config } from '../types';

interface ValidOutput {
  isValid: true;
}

interface InvalidOutput {
  isValid: false;
  error: string;
}

const validateConfig = (config: Config) => {
  const errors: string[] = [];

  // Validate contracts
  const contractNames = config.contracts.map(contract => contract.name);

  // Contract names can only contain letters, numbers and underscores to follow
  // GraphQL's naming restrictions
  const invalidContractNames = contractNames.filter(
    contractName => !/^[a-zA-Z0-9_]*$/.test(contractName),
  );

  if (invalidContractNames.length > 0) {
    errors.push(
      `"name" property value of contracts must only contain numbers, letters and underscores. Invalid contract names found: ${invalidContractNames.join(
        ', ',
      )}. Update the names of the listed contracts so they only contain numbers, letters and underscores.`,
    );
  }

  const duplicatedContractNames = contractNames.filter(
    (contractName, index) => contractNames.indexOf(contractName) !== index,
  );

  if (duplicatedContractNames.length > 0) {
    errors.push(
      `"name" property value of contracts must be unique. Duplicated contract names found: ${duplicatedContractNames.join(
        ', ',
      )}. Update the names of the listed contracts to make them unique.`,
    );
  }

  if (errors.length > 0) {
    // List errors
    const formattedError = `Errors found in config: \n - ${errors.join('\n - ')}`;

    const output: InvalidOutput = {
      isValid: false,
      error: formattedError,
    };

    return output;
  }

  const output: ValidOutput = {
    isValid: true,
  };

  return output;
};

export default validateConfig;
