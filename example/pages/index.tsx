import { gql } from '@apollo/client/core';

import client from '../client';

export async function getStaticProps() {
  const { data } = await client.query({
    query: gql`
      query GetPools {
        contracts(chainId: 1) {
          SHIB {
            balanceOf(_owner: "0x5a52e96bacdabb82fd05763e25335261b270efcb")
          }
          ERC20(
            addresses: [
              "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              "0xdAC17F958D2ee523a2206206994597C13D831ec7"
            ]
          ) {
            name
            totalSupply
          }
        }
      }
    `,
  });

  return {
    props: {
      data,
    },
  };
}

export default function Web({ data }: { data: unknown }) {
  console.log(data);

  return (
    <div>
      <h1>Web 1</h1>
    </div>
  );
}
