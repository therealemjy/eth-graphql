const formatToGraphQlTypeName = (componentInternalType: string) =>
  componentInternalType.replace('struct ', '').replace('[]', '').replace('.', '_');

export default formatToGraphQlTypeName;
