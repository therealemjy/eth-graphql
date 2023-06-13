import { JsonFragment } from '@ethersproject/abi';

const filterAbiItems = (abiItems: JsonFragment[]) =>
  // Filter out ABI items that aren't non-mutating named functions
  abiItems.filter(
    abiItem =>
      abiItem.type === 'function' &&
      !!abiItem.name &&
      (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure'),
  );

export default filterAbiItems;
