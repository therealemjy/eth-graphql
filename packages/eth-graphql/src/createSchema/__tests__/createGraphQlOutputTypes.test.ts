import { JsonFragment } from '@ethersproject/abi';

import createGraphQlOutputType from '../createGraphQlOutputType';
import createGraphQlType from '../createGraphQlType';
import { GraphQlVoid } from '../scalars';
import { SharedGraphQlTypes } from '../types';

jest.mock('../createGraphQlType');

describe('createSchema/createGraphQlOutputType', () => {
  const mockAbiItem: JsonFragment = {
    name: 'mockName',
    type: 'mockType',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  };

  beforeEach(() => {
    (createGraphQlType as jest.Mock).mockImplementation(() => 'MockGraphQLOutputType');
  });

  it('returns GraphQlVoid if no outputs in abiItem', () => {
    const mockedSharedGraphQlTypes: SharedGraphQlTypes = {
      inputs: {},
      outputs: {},
    };

    const result = createGraphQlOutputType({
      abiItem: mockAbiItem,
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });
    expect(result).toEqual(GraphQlVoid);
  });

  it('calls createGraphQlType with correct arguments if there is one output', () => {
    const mockedSharedGraphQlTypes: SharedGraphQlTypes = {
      inputs: {},
      outputs: {},
    };

    const singleOutputAbiItem = { ...mockAbiItem, outputs: [{ type: 'uint8' }] };

    createGraphQlOutputType({
      abiItem: singleOutputAbiItem,
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });

    expect(createGraphQlType).toBeCalledWith({
      isInput: false,
      component: singleOutputAbiItem.outputs[0],
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });
  });

  it('calls createGraphQlType with correct arguments if there are multiple outputs', () => {
    const mockedSharedGraphQlTypes: SharedGraphQlTypes = {
      inputs: {},
      outputs: {},
    };

    const multipleOutputsAbiItem = {
      ...mockAbiItem,
      outputs: [{ type: 'uint8' }, { type: 'uint8' }],
    };

    createGraphQlOutputType({
      abiItem: multipleOutputsAbiItem,
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });

    expect(createGraphQlType).toBeCalledWith({
      isInput: false,
      component: {
        ...multipleOutputsAbiItem,
        components: multipleOutputsAbiItem.outputs,
        type: 'tuple',
        internalType: `${multipleOutputsAbiItem.name}Output`,
      },
      sharedGraphQlTypes: mockedSharedGraphQlTypes,
    });
  });
});
