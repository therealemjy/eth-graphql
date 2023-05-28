import { ArgumentNode, Kind, ValueNode } from 'graphql';

import EthGraphQlError from '../../EthGraphQlError';
import { SolidityValue } from '../../types';

// Format each type of value node to an argument consumable by the contract
const formatValueNode = (valueNode: ValueNode): SolidityValue => {
  if (valueNode.kind === Kind.NULL || valueNode.kind === Kind.VARIABLE) {
    throw new EthGraphQlError(
      `Incorrect valueNode kind detected: ${valueNode.kind}. There is likely an issue with an ABI inside your eth-graphql config file`,
    );
  }

  // Convert list to array
  if (valueNode.kind === Kind.LIST) {
    return valueNode.values.map(formatValueNode);
  }

  // Convert object to tuple
  if (valueNode.kind === Kind.OBJECT) {
    return valueNode.fields.map(field => formatValueNode(field.value));
  }

  return valueNode.value;
};

const formatGraphQlArgs = (args: ReadonlyArray<ArgumentNode>) =>
  args.reduce<ReadonlyArray<SolidityValue>>(
    (accArguments, argument) => [...accArguments, formatValueNode(argument.value)],
    [],
  );

export default formatGraphQlArgs;