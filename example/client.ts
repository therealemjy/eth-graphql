import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createLink } from "unnamed-library";

const RPC_PROVIDER_URL =
  "https://bsc-testnet.nodereal.io/v1/f9777f42cc9243f0a766937df1c6a5f3";

const link = createLink({
  rpcProviderUrl: RPC_PROVIDER_URL,
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default client;
