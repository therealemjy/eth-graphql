import { GraphQLBoolean, GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import createGraphQlMultInputTypes from '../createGraphQlMultInputTypes';
import { SharedGraphQlTypes } from '../types';

describe('createSchema/createGraphQlMultInputTypes', () => {
  it('creates a new type if one does not exist', () => {
    const sharedGraphQlTypes: SharedGraphQlTypes = { inputs: {}, outputs: {} };
    const inputTypes = {
      someInput: { type: new GraphQLNonNull(GraphQLBoolean) },
    };

    const result = createGraphQlMultInputTypes({
      inputTypes,
      contractFieldName: 'testContract',
      sharedGraphQlTypes,
    });

    const expectedTypeName = 'testContractInput';
    expect(sharedGraphQlTypes.inputs[expectedTypeName]).toBeDefined();
    expect(result).toEqual({ args: { type: sharedGraphQlTypes.inputs[expectedTypeName] } });
  });

  it('does not create a new type if one already exists', () => {
    const existingType = new GraphQLNonNull(
      new GraphQLList(
        new GraphQLNonNull(
          new GraphQLInputObjectType({
            name: 'existingTypeInput',
            fields: {},
          }),
        ),
      ),
    );

    const sharedGraphQlTypes: SharedGraphQlTypes = {
      inputs: { existingTypeInput: existingType },
      outputs: {},
    };
    const inputTypes = {};

    const result = createGraphQlMultInputTypes({
      inputTypes,
      contractFieldName: 'existingType',
      sharedGraphQlTypes,
    });

    expect(sharedGraphQlTypes.inputs.existingTypeInput).toBe(existingType);
    expect(result).toEqual({ args: { type: existingType } });
  });
});
