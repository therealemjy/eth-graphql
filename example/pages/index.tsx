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
