import { GraphQLScalarType } from 'graphql';

const GraphQLBigInt = new GraphQLScalarType({
  name: 'Void',
  description: 'The `Void` scalar type represents undefined values.',

  serialize(value) {
    return value;
  },

  parseValue() {
    return undefined;
  },

  parseLiteral() {
    return undefined;
  },
});

export default GraphQLBigInt;
