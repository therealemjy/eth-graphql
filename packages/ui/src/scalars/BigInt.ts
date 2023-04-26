import { GraphQLScalarType, Kind } from 'graphql';

const BigIntScalar = new GraphQLScalarType({
  name: 'BigInt',
  description: 'Custom scalar for BigInt values',

  serialize(value) {
    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'bigint'
    ) {
      throw new Error(
        'GraphQL BigInt Scalar serializer expected a string, number or BigInt object'
      );
    }

    return BigInt(value.toString());
  },

  parseValue(value) {
    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'bigint'
    ) {
      throw new Error(
        'GraphQL BigInt Scalar serializer expected a string, number or BigInt object'
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

export default BigIntScalar;
