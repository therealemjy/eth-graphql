const createGraphQlTypeName = (componentInternalType: string) =>
  // TODO: add prefix to make sure type name is unique within schema (in case
  // generated schema is merged with an existing one)
  componentInternalType.replace('struct ', '').replace('[]', '').replace('.', '_');

export default createGraphQlTypeName;
