import { JsonFragment } from '@ethersproject/abi';

import { SolidityValue } from '../../types';
import formatToEntityName from '../../utilities/formatToEntityName';

interface FormatResultInput {
  result: SolidityValue;
  abiItem: JsonFragment;
}

// TODO: write tests

const formatResult = ({ result, abiItem }: FormatResultInput) => {
  const abiItemOutputs = abiItem.outputs || [];
  const data = result;

  // Handle functions that return nothing
  if (abiItemOutputs.length === 0) {
    return undefined;
  }

  // Handle functions that return only one value
  if (abiItemOutputs.length === 1 || !Array.isArray(data)) {
    return data;
  }

  // If the output in the ABI contains multiple components, we map them to an
  // object, similarly to how they are mapped in the GraphQL schema
  return abiItemOutputs.reduce<{
    [key: string]: SolidityValue;
  }>(
    (accFormattedData, outputComponent, outputComponentIndex) => ({
      ...accFormattedData,
      [formatToEntityName({
        name: outputComponent.name,
        index: outputComponentIndex,
        type: 'value',
      })]: data[outputComponentIndex],
    }),
    {},
  );
};

export default formatResult;
