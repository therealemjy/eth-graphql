import { JsonFragment } from '@ethersproject/abi';

const formatToSignature = (abiItem: JsonFragment) => {
  const args = (abiItem.inputs || []).map(input => input.type).join(',');
  return `${abiItem.name}(${args})`;
};

export default formatToSignature;
