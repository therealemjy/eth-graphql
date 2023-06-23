import handleMultFields, { HandleMultFieldsInput } from '../handleMultFields';

describe('createSchema/makeCalls/formatMulticallResults/handleMultFields', () => {
  const input: HandleMultFieldsInput = {
    fieldName: 'field1',
    existingData: { field1: ['existingValue1', 'existingValue2'] },
    formattedResult: 'newValue',
  };

  it('should add new value to existing array', () => {
    const result = handleMultFields(input);

    expect(result).toEqual(['existingValue1', 'existingValue2', 'newValue']);
  });

  it('should create new array with new value if field does not exist', () => {
    const result = handleMultFields({
      ...input,
      fieldName: 'field2',
    });

    expect(result).toEqual(['newValue']);
  });
});
