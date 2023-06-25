import { GraphQLInt, GraphQLList, GraphQLNonNull } from 'graphql';

import createGraphQlMultOutputType from '../createGraphQlMultOutputType';
import { SharedGraphQlTypes } from '../types';

describe('createSchema/createGraphQlMultOutputType', () => {
  it('should correctly create a new output type', () => {
    const sharedGraphQlTypes: SharedGraphQlTypes = { inputs: {}, outputs: {} };
    const outputType = GraphQLInt;
    const contractFieldName = 'testField';

    const result = createGraphQlMultOutputType({
      outputType,
      contractFieldName,
      sharedGraphQlTypes,
    });

    expect(sharedGraphQlTypes.outputs[contractFieldName]).toBe(result);
  });

  it('should return the existing output type if it already exists', () => {
    const outputType = GraphQLInt;
    const contractFieldName = 'testField';
    const existingOutputType = new GraphQLNonNull(new GraphQLList(outputType));
    const sharedGraphQlTypes: SharedGraphQlTypes = {
      inputs: {},
      outputs: { [contractFieldName]: existingOutputType },
    };

    const result = createGraphQlMultOutputType({
      outputType,
      contractFieldName,
      sharedGraphQlTypes,
    });

    expect(result).toBe(existingOutputType);
    expect(sharedGraphQlTypes.outputs[contractFieldName]).toBe(existingOutputType);
  });
});
