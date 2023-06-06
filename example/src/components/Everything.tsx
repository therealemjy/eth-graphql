import { useQuery } from '@apollo/client';

import { graphql } from '../../.gql';

export default function Everything() {
  const { data, loading } = useQuery(
    graphql(/* GraphQL */ `
      query GetEverything {
        contracts(chainId: 1) {
          SHIB {
            balanceOf(_owner: "0x5a52e96bacdabb82fd05763e25335261b270efcb")
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
      <h2>Whale SHIB balance:</h2>
      <p>{data.contracts.SHIB.balanceOf}</p>
    </div>
  );
}
