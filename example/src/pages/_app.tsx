import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';

import client from '../client';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
