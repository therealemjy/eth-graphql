import type { JsonFragment } from 'ethers';

const getGraphQlInputType = (item: JsonFragment) => {
  const inputTypeDef = (item.inputs || [])
    .map(input => {
      const type = 'String!'; // TODO: handle all input types, including tuples, arrays etc.
      return `${input.name}: ${type}`;
    })
    .join(', ');

  // Wrap input type in parenthesis if it contains at least one parameter,
  // otherwise return an empty string
  return inputTypeDef && `(${inputTypeDef})`;
};

const getGraphQlOutputType = () => 'BigInt!'; // TODO: handle all input types, including custom types and scalars

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

      const inputTypeDef = getGraphQlInputType(abiItem);
      const outputTypeDef = getGraphQlOutputType();

      const methodTypeDef = `${abiItem.name}${inputTypeDef}: ${outputTypeDef}`;

      return [...acc, methodTypeDef];
    }, [])
    .join('\n');

  return schemaTypeDef;
};

export default convertAbiToGraphQlSchema;
