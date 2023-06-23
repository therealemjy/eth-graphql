import { ContractCall, ContractData } from '../types';
import formatResult from './formatResult';
import handleMultFields from './handleMultFields';

export interface FormatMulticallResultsInput {
  multicallResults: any[];
  contractCalls: ContractCall[];
}

const formatMulticallResults = ({ multicallResults, contractCalls }: FormatMulticallResultsInput) =>
  multicallResults.reduce<{
    [contractName: string]: ContractData | ContractData[];
  }>((accResults, result, index) => {
    const contractCall = contractCalls[index];
    const formattedResult = formatResult({
      result,
      abiItem: contractCall.abiItem,
    });

    // Handle results from calls made to contracts with defined addresses
    if (contractCall.indexInResultArray === undefined) {
      const fieldData = contractCall.isMult
        ? handleMultFields({
            existingData: (accResults[contractCall.contractName] as ContractData) || {},
            fieldName: contractCall.fieldName,
            formattedResult,
          })
        : formattedResult;

      return {
        ...accResults,
        [contractCall.contractName]: {
          ...(accResults[contractCall.contractName] || {}),
          [contractCall.fieldName]: fieldData,
        },
      };
    }

    // Map results from contract calls with dynamic addresses to an array
    const contractData = (accResults[contractCall.contractName] as ContractData[]) || [];
    contractData[contractCall.indexInResultArray] =
      contractData[contractCall.indexInResultArray] || {};

    const fieldData = contractCall.isMult
      ? handleMultFields({
          existingData: contractData[contractCall.indexInResultArray],
          fieldName: contractCall.fieldName,
          formattedResult,
        })
      : formattedResult;

    contractData[contractCall.indexInResultArray] = {
      ...contractData[contractCall.indexInResultArray],
      [contractCall.fieldName]: fieldData,
    };

    return {
      ...accResults,
      [contractCall.contractName]: contractData,
    };
  }, {});

export default formatMulticallResults;
