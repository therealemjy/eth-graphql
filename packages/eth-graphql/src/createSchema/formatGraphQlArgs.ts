import { ArgumentNode, Kind, ValueNode } from 'graphql';

import { SolidityValue } from '../types';

// Format each type of value node to an argument consumable by the contract
const formatValueNode = (valueNode: ValueNode): SolidityValue => {
  if (valueNode.kind === Kind.NULL || valueNode.kind === Kind.VARIABLE) {
    // TODO: throw human-friendly error
    throw new Error(
      `Incorrect valueNode type: ${valueNode.kind}. This is likely an issue with your eth-graphql config.`,
    );
  }

  if (valueNode.kind === Kind.LIST) {
    return valueNode.values.map(formatValueNode);
  }

  // Convert object to tuple
  if (valueNode.kind === Kind.OBJECT) {
    return valueNode.fields.map(field => field.value);
  }

  return valueNode.value;
};

const formatGraphQlArgs = (args: ReadonlyArray<ArgumentNode>) =>
  args.reduce<ReadonlyArray<SolidityValue>>(
    (accArguments, argument) => [...accArguments, formatValueNode(argument.value)],
    [],
  );

export default formatGraphQlArgs;
