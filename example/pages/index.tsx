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
          ERC20(
            addresses: [
              "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4"
              "0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF"
            ]
          ) {
            name
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
