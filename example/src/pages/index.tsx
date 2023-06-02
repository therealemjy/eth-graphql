import { graphql } from '../../.gql';
import { GetTokensQuery } from '../../.gql/graphql';
import client from '../client';

export async function getServerSideProps() {
  const { data } = await client.query({
    query: graphql(/* GraphQL */ `
      query GetTokens {
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
    `),
  });

  return {
    props: {
      data,
    },
  };
}

export default function Web({ data }: { data: GetTokensQuery }) {
  console.log(data);

  return (
    <div>
      <h2>Whale SHIB balance:</h2>
      <p>{data.contracts.SHIB.balanceOf}</p>

      <h2>Token supplies:</h2>
      {data.contracts.ERC20.map(token => (
        <div key={`token-${token.name}`}>
          <p>
            {token.name}: {token.totalSupply}
          </p>
        </div>
      ))}
    </div>
  );
}
