import { gql } from '@apollo/client/core';

import client from '../client';

export async function getStaticProps() {
  const { data } = await client.query({
    query: gql`
      query GetPools {
        contracts(chainId: 97) {
          XVS {
            balanceOf(_owner: "0x11cbEA7E8FfF39942075128ee7de77C06822f4de")
          }

          PoolLens {
            getAllPools(poolRegistryAddress: "0x1aF50D1Ee859Bb972384F1f96F3cFCccfC5Ac210") {
              name
              vTokens {
                vToken
                underlyingDecimals
              }
            }

            vTokenBalances(
              vToken: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E"
              account: "0x11cbEA7E8FfF39942075128ee7de77C06822f4de"
            ) {
              vToken
            }
          }
        }
      }
    `,
  });

  return {
    props: {
      xvsBalance: '',
    },
  };
}

export default function Web() {
  return (
    <div>
      <h1>Web 1</h1>
    </div>
  );
}
