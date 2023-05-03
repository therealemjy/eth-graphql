// Fallback to using a component's index if it is undefined
const formatToFieldName = ({ name, index }: { name: string | undefined; index: number }) =>
  name || `value${index}`;

export default formatToFieldName;
