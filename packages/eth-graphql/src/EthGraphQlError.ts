const ERROR_MESSAGE_PREFIX = '[eth-graphql] ';

class EthGraphQlError extends Error {
  constructor(message: string) {
    super(message);
    this.message = `${ERROR_MESSAGE_PREFIX}${message}`;
  }
}

export default EthGraphQlError;
