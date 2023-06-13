import { JsonFragmentType } from '@ethersproject/abi';
import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

import formatToEntityName from '../../utilities/formatToEntityName';
import createGraphQlInputTypes from '../createGraphQlInputTypes';
import createGraphQlType from '../createGraphQlType';
import { SharedGraphQlTypes } from '../types';

jest.mock('../createGraphQlType');
jest.mock('../../utilities/formatToEntityName');

describe('createSchema/createGraphQlInputTypes', () => {
  const mockComponents: ReadonlyArray<JsonFragmentType> = [
    { name: 'mockName1', type: 'string' },
    { name: 'mockName2', type: 'number' },
  ];

  beforeEach(() => {
    (createGraphQlType as jest.Mock).mockImplementation(
      () =>
        new GraphQLNonNull(
          new GraphQLInputObjectType({
            name: 'fake_name',
            fields: {},
          }),
        ),
    );
    (formatToEntityName as jest.Mock).mockImplementation(({ name, index }) => `${name}${index}`);
  });

  it('creates GraphQL input types', () => {
    const mockedSharedGraphQlTypes: SharedGraphQlTypes = {
      inputs: {},
      outputs: {},
    };

    const result = createGraphQlInputTypes({
      components: mockComponents,
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "mockName10": {
          "type": "fake_name!",
        },
        "mockName21": {
          "type": "fake_name!",
        },
      }
    `);
  });

  it('calls formatToEntityName and createGraphQlType with correct arguments', () => {
    const mockedSharedGraphQlTypes: SharedGraphQlTypes = {
      inputs: {},
      outputs: {},
    };

    createGraphQlInputTypes({
      components: mockComponents,
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });

    expect(createGraphQlType).toBeCalledWith({
      isInput: true,
      component: mockComponents[0],
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });

    expect(createGraphQlType).toBeCalledWith({
      isInput: true,
      component: mockComponents[1],
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });

    expect(formatToEntityName).toBeCalledWith({
      name: mockComponents[0].name,
      index: 0,
      type: 'arg',
    });

    expect(formatToEntityName).toBeCalledWith({
      name: mockComponents[1].name,
      index: 1,
      type: 'arg',
    });
  });
});
