import { BigNumber } from 'ethers';
import { GraphQLScalarType, Kind } from 'graphql';

// TODO: check GraphQLBigInt from graphql-scalars to improve
const GraphQLBigInt = new GraphQLScalarType({
  // TODO: update meta data
  name: 'BigInt',
  description: 'Custom scalar for BigInt values',

  serialize(value) {
    if (
      !(value instanceof BigNumber) &&
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'bigint'
    ) {
      throw new Error(
        'GraphQL BigInt Scalar serializer expected a string, number, BigInt or BigNumber object',
      );
    }

    return value.toString();
  },

  parseValue(value) {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint') {
      throw new Error(
        'GraphQL BigInt Scalar serializer expected a string, number or BigInt object',
      );
    }

    return value.toString();
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
      throw new Error('BigInt value needs to tbe a string or an integer');
    }

    return ast.value.toString();
  },
});

export default GraphQLBigInt;
