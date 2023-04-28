// Because the library ethcall is a pure ESM module, it cannot be imported
// regularly in this library since it would require it to be an ESM module as
// well; limiting its compatibility with other projects that wish to use it. For
// that reason, we use this function to import it asynchronously.

type EthCall = typeof import('ethcall');

let mod: EthCall;

const getEthCall = async () => {
  if (!mod) {
    mod = await ([eval][0](`import('ethcall')`) as Promise<typeof import('ethcall')>);
  }

  return mod;
};

export default getEthCall;
