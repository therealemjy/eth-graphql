import { gql } from '@apollo/client/core';

import client from '../client';

export async function getStaticProps() {
  const { data } = await client.query({
    query: gql`
      query GetPools {
        contracts(chainId: 97) {
          PoolLens {
            getPoolDataFromVenusPool(
              poolRegistryAddress: "0x1aF50D1Ee859Bb972384F1f96F3cFCccfC5Ac210"
              venusPool: {
                name: ""
                creator: ""
                comptroller: ""
                blockPosted: ""
                timestampPosted: ""
              }
            ) {
              name
            }
          }
        }
      }
    `,
  });

  console.log(data);

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
