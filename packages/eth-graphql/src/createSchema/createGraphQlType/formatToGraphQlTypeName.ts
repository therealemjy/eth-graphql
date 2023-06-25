export interface FormatToGraphQlTypeNameInput {
  componentInternalType: string;
  contractName: string;
  isInput: boolean;
}

const formatToGraphQlTypeName = ({
  componentInternalType,
  contractName,
  isInput,
}: FormatToGraphQlTypeNameInput) => {
  let graphQlTypeName = componentInternalType
    // Remove square brackets and their content (e.g.: Movie[3] -> Movie)
    .replace(/\[.*?\]/g, '');

  const isStruct = componentInternalType.indexOf('struct') > -1;

  if (isStruct) {
    const dotIndex = graphQlTypeName.indexOf('.');
    graphQlTypeName = graphQlTypeName.substring(dotIndex + 1);
  }

  if (!isStruct || isInput) {
    graphQlTypeName += isInput ? 'Input' : 'Output';
  }

  // Prefix with contract name
  graphQlTypeName = `${contractName}_${graphQlTypeName}`;
  return graphQlTypeName;
};

export default formatToGraphQlTypeName;
