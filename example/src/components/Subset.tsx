import { useQuery } from '@apollo/client';

import { graphql } from '../../.gql';

export default function Everything() {
  const { data, loading } = useQuery(
    graphql(/* GraphQL */ `
      query Subset {
        contracts(chainId: 1) {
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
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
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
