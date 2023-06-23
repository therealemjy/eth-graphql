import { JsonFragment } from '@ethersproject/abi';

import formatToEntityName from '../../../../utilities/formatToEntityName';
import formatResult, { FormatResultInput } from '../formatResult';

jest.mock('../../../../utilities/formatToEntityName');

describe('createSchema/makeCalls/formatMulticallResults/formatResult', () => {
  it('should return undefined if abiItemOutputs is empty', () => {
    const input: FormatResultInput = {
      result: 'dummy',
      abiItem: { outputs: [] } as JsonFragment,
    };

    const output = formatResult(input);
    expect(output).toBeUndefined();
  });

  it('should return result directly if abiItemOutputs length is 1 or result is not array', () => {
    const input1: FormatResultInput = {
      result: 'dummy',
      abiItem: { outputs: ['output1'] } as JsonFragment,
    };

    const output1 = formatResult(input1);
    expect(output1).toBe(input1.result);

    const input2: FormatResultInput = {
      result: 'dummy',
      abiItem: { outputs: ['output1', 'output2'] } as JsonFragment,
    };

    const output2 = formatResult(input2);
    expect(output2).toBe(input2.result);
  });

  it('should return object mapped with formatToEntityName and result array if abiItemOutputs length is more than 1 and result is array', () => {
    const input: FormatResultInput = {
      result: ['result1', 'result2'],
      abiItem: {
        outputs: [{ name: 'output1' }, { name: 'output2' }],
      } as JsonFragment,
    };

    const entityName1 = 'Entity1';
    const entityName2 = 'Entity2';

    (formatToEntityName as jest.MockedFunction<typeof formatToEntityName>)
      .mockReturnValueOnce(entityName1)
      .mockReturnValueOnce(entityName2);

    const output = formatResult(input);

    expect(output).toEqual({
      [entityName1]: input.result && Array.isArray(input.result) && input.result[0],
      [entityName2]: input.result && Array.isArray(input.result) && input.result[1],
    });
    expect(formatToEntityName).toHaveBeenCalledTimes(2);
    expect(formatToEntityName).toHaveBeenNthCalledWith(1, {
      name: 'output1',
      index: 0,
      type: 'value',
    });
    expect(formatToEntityName).toHaveBeenNthCalledWith(2, {
      name: 'output2',
      index: 1,
      type: 'value',
    });
  });
});
