const formatToGraphQlTypeName = (componentInternalType: string) =>
  componentInternalType
    .replace('struct ', '')
    // Remove square brackets and their content (e.g.: Movie[3] => Movie)
    .replace(/\[.*?\]/g, '')
    .replace('.', '_');

export default formatToGraphQlTypeName;
