const formatToEntityName = ({
  name,
  index,
  type,
}: {
  name?: string;
  index: number;
  type: 'arg' | 'value';
}) =>
  // Generate automatic entity name based on its type and index if its name is
  // undefined
  name || `${type}${index}`;

export default formatToEntityName;
