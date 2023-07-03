import { JsonFragmentType } from '@ethersproject/abi';

import formatToEntityName from '../../utilities/formatToEntityName';
import { ContractCallArgs } from './types';

const formatGraphQlArgs = ({
  callArguments,
  abiItemInputs,
}: {
  callArguments: ContractCallArgs;
  abiItemInputs: readonly JsonFragmentType[];
}) =>
  // Go through ABI item to format call args and return them in the correct
  // order
  abiItemInputs.map((component, componentIndex) => {
    const argumentName = formatToEntityName({
      name: component.name,
      index: componentIndex,
      type: 'arg',
    });

    const argumentValue = callArguments[argumentName];
    return argumentValue;
  });

export default formatGraphQlArgs;
