import type { JsonFragment, JsonFragmentType } from 'ethers';

// const formatType = ({ type, isArray }: { type: string; isArray: boolean }) => {
//   if (isArray) {
//     return `[${type}!]!`;
//   }

//   return `${type}!`;
// };

const formatAbiTypeToGraphQl = (abiItemType: JsonFragmentType) => {
  let graphQlType = 'String!';

  if (!abiItemType.type) {
    return graphQlType;
  }

  const abiType = abiItemType.type.split('[]')[0];
  const isArray = abiType.slice(-2) === '[]';

  if (abiType === 'bool') {
    graphQlType = 'Boolean!';
  } else if (abiType === 'tuple') {
    graphQlType = 'String!'; // TODO: get tuple name
  }

  return isArray ? `[${graphQlType}]!` : graphQlType;
};

const getGraphQlInputTypes = (abiItem: JsonFragment) => {
  const inputTypeDef = (abiItem.inputs || [])
    .map(input => `${input.name}: ${formatAbiTypeToGraphQl(input)}`)
    .join(', ');

  // Wrap input type in parenthesis if it contains at least one parameter,
  // otherwise return an empty string
  return inputTypeDef && `(${inputTypeDef})`;
};

const getGraphQlOutputTypes = (_abiItem: JsonFragment) => 'BigInt!'; // TODO: handle all input types, including custom types and scalars

const convertAbiToGraphQlSchema = (abi: ReadonlyArray<JsonFragment>) => {
  const schemaTypeDef = abi
    .reduce<string[]>((acc, abiItem) => {
      // Only handle functions
      // TODO: check if abiItem.name can really be empty/undefined
      if (abiItem.type !== 'function' || !abiItem.name) {
        return acc;
      }

      // TODO: handle events

      // TODO: handle function overloading

      const inputTypeDef = getGraphQlInputTypes(abiItem);
      const outputTypeDef = getGraphQlOutputTypes(abiItem);

      const methodTypeDef = `${abiItem.name}${inputTypeDef}: ${outputTypeDef}`;

      return [...acc, methodTypeDef];
    }, [])
    .join('\n  ');

  return schemaTypeDef;
};

export default convertAbiToGraphQlSchema;
