import { GraphQLScalarType } from 'graphql';

const GraphQLBigInt = new GraphQLScalarType({
  name: 'Void',
  description:
    'The `Void` scalar type represents undefined values. Because GraphQL does not allow returning an undefined value for a field, Void is serialized to null.',

  serialize() {
    return null;
  },

  parseValue() {
    return undefined;
  },

  parseLiteral() {
    return undefined;
  },
});

export default GraphQLBigInt;
