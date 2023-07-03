import { ArgumentNode, GraphQLResolveInfo, Kind, ValueNode } from 'graphql';

import { SolidityValue } from '../../types';
import { ContractCallArgs } from './types';

// Extract a node's value
const getNodeValue = ({
  valueNode,
  variableValues,
}: {
  valueNode: ValueNode;
  variableValues: GraphQLResolveInfo['variableValues'];
}): SolidityValue => {
  if (valueNode.kind === Kind.NULL) {
    return null;
  }

  // Get variable node value
  if (valueNode.kind === Kind.VARIABLE) {
    const variableName = valueNode.name.value;
    return variableValues[variableName] as SolidityValue;
  }

  // Convert list to array
  if (valueNode.kind === Kind.LIST) {
    return valueNode.values.map(node =>
      getNodeValue({
        valueNode: node,
        variableValues,
      }),
    );
  }

  // Convert object to object
  if (valueNode.kind === Kind.OBJECT) {
    return valueNode.fields.reduce(
      (accObject, field) => ({
        ...accObject,
        [field.name.value]: getNodeValue({
          valueNode: field.value,
          variableValues,
        }),
      }),
      {},
    );
  }

  return valueNode.value;
};

const formatArgumentNodes = ({
  argumentNodes,
  variableValues,
}: {
  argumentNodes: ReadonlyArray<ArgumentNode>;
  variableValues: GraphQLResolveInfo['variableValues'];
}) =>
  argumentNodes.reduce<ContractCallArgs>(
    (accArguments, argument) => ({
      ...accArguments,
      [argument.name.value]: getNodeValue({
        valueNode: argument.value,
        variableValues,
      }),
    }),
    {},
  );

export default formatArgumentNodes;
