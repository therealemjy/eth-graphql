import type { JsonFragment } from 'ethers';

const formatToFieldName = ({
  name,
  abi,
  index,
}: {
  name: string;
  abi: JsonFragment[];
  index: number;
}) => {
  // Support function overloading by adding each function
  // signature to the schema, appending their name with their
  // index in the ABI relative to the first function with that
  // same signature. As an example, if a contract contains the
  // next overloaded function:
  // - myFn()
  // - myFn(address: address)
  // Then the resulting GraphQL schema will contain the next fields:
  // - myFn0()
  // - myFn1(address: String!)
  let fieldName = name;

  const overloadedFnIndexes = abi.reduce<number[]>(
    (accOverloadedFnIndexes, abiItem, abiItemIndex) =>
      abiItem.name === name ? [...accOverloadedFnIndexes, abiItemIndex] : accOverloadedFnIndexes,
    [],
  );

  const isOverloadedFn = overloadedFnIndexes.length > 1;

  if (isOverloadedFn) {
    const relativeIndex = index - overloadedFnIndexes[0];
    fieldName += relativeIndex;
  }

  return fieldName;
};

export default formatToFieldName;
