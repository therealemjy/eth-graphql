import { SolidityValue } from '../../../types';
import { ContractData } from '../types';

export interface HandleMultFieldsInput {
  existingData: ContractData;
  fieldName: string;
  formattedResult: SolidityValue;
}

const handleMultFields = ({ existingData, fieldName, formattedResult }: HandleMultFieldsInput) => {
  const currentFieldData = (existingData[fieldName] as SolidityValue[]) || [];
  return [...currentFieldData, formattedResult];
};

export default handleMultFields;
