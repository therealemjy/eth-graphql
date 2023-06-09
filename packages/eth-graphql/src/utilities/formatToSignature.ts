import { JsonFragment } from '@ethersproject/abi';
import { Fragment } from 'ethers/lib/utils.js';

const formatToSignature = (abiItem: JsonFragment) => {
  const fragment = Fragment.from(abiItem);
  return fragment.format();
};

export default formatToSignature;
