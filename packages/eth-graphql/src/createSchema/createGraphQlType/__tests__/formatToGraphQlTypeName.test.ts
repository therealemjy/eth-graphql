import formatToGraphQlTypeName, { FormatToGraphQlTypeNameInput } from '../formatToGraphQlTypeName';

describe('createSchema/createGraphQlType/formatToGraphQlTypeName', () => {
  it('should format type name correctly when isInput is false and type is not a struct', () => {
    const params: FormatToGraphQlTypeNameInput = {
      componentInternalType: 'Movie[3]',
      contractName: 'ContractA',
      isInput: false,
    };

    const result = formatToGraphQlTypeName(params);
    expect(result).toEqual('ContractA_MovieOutput');
  });

  it('should format type name correctly when isInput is true and type is not a struct', () => {
    const params: FormatToGraphQlTypeNameInput = {
      componentInternalType: 'Movie[3]',
      contractName: 'ContractA',
      isInput: true,
    };

    const result = formatToGraphQlTypeName(params);
    expect(result).toEqual('ContractA_MovieInput');
  });

  it('should format type name correctly when type is a struct and isInput is false', () => {
    const params: FormatToGraphQlTypeNameInput = {
      componentInternalType: 'struct ContractA.Movie[3]',
      contractName: 'ContractA',
      isInput: false,
    };

    const result = formatToGraphQlTypeName(params);
    expect(result).toEqual('ContractA_Movie');
  });

  it('should format type name correctly when type is a struct and isInput is true', () => {
    const params: FormatToGraphQlTypeNameInput = {
      componentInternalType: 'struct ContractA.Movie[3]',
      contractName: 'ContractA',
      isInput: true,
    };

    const result = formatToGraphQlTypeName(params);
    expect(result).toEqual('ContractA_MovieInput');
  });

  it('should handle type without special characters correctly', () => {
    const params: FormatToGraphQlTypeNameInput = {
      componentInternalType: 'Movie',
      contractName: 'ContractA',
      isInput: false,
    };

    const result = formatToGraphQlTypeName(params);
    expect(result).toEqual('ContractA_MovieOutput');
  });
});
