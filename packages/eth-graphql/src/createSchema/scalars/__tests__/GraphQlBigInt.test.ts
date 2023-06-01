import { BigNumber } from 'ethers';
import { Kind, ValueNode } from 'graphql';

import EthGraphQlError from '../../../EthGraphQlError';
import GraphQlBigInt from '../GraphQlBigInt';

jest.mock('../../../EthGraphQlError');

describe('createSchema/scalars/GraphQLBigInt', () => {
  it.each([{}, [], undefined, null])(
    'GraphQlBigInt.serialize should throw an error when passing an invalid argument',
    value => {
      try {
        GraphQlBigInt.serialize(value);

        throw new Error('GraphQlBigInt.serialize should have thrown an error but did not');
      } catch (error) {
        expect(error).toBeInstanceOf(EthGraphQlError);
        expect(EthGraphQlError).toHaveBeenCalledWith(
          'GraphQL BigInt Scalar serializer expected a string, number, BigInt or BigNumber object',
        );
      }
    },
  );

  it.each([BigNumber.from(1), 1, '1', BigInt(1)])(
    'GraphQlBigInt.serialize should return string value when passing valid argument',
    value => {
      const res = GraphQlBigInt.serialize(value);

      expect(res).toBe('1');
    },
  );

  it.each([BigNumber.from(1), {}, [], undefined, null])(
    'GraphQlBigInt.parseValue should throw an error when passing an invalid argument',
    value => {
      try {
        GraphQlBigInt.parseValue(value);

        throw new Error('GraphQlBigInt.parseValue should have thrown an error but did not');
      } catch (error) {
        expect(error).toBeInstanceOf(EthGraphQlError);
        expect(EthGraphQlError).toHaveBeenCalledWith(
          'GraphQL BigInt Scalar parser expected a string, number or BigInt object',
        );
      }
    },
  );

  it.each([1, '1', BigInt(1)])(
    'GraphQlBigInt.parseValue should return string value when passing valid argument',
    value => {
      const res = GraphQlBigInt.parseValue(value);

      expect(res).toBe('1');
    },
  );

  it.each([
    { kind: Kind.VARIABLE },
    { kind: Kind.FLOAT },
    { kind: Kind.FLOAT },
    { kind: Kind.BOOLEAN },
    { kind: Kind.NULL },
    { kind: Kind.ENUM },
    { kind: Kind.BOOLEAN },
    { kind: Kind.LIST },
    { kind: Kind.OBJECT },
  ] as ValueNode[])(
    'GraphQlBigInt.parseLiteral should throw an error when passing an invalid argument',
    value => {
      try {
        GraphQlBigInt.parseLiteral(value);

        throw new Error('GraphQlBigInt.parseLiteral should have thrown an error but did not');
      } catch (error) {
        expect(error).toBeInstanceOf(EthGraphQlError);
        expect(EthGraphQlError).toHaveBeenCalledWith(
          'BigInt value needs to be a string or an integer',
        );
      }
    },
  );

  it.each([
    { kind: Kind.STRING, value: '1' },
    { kind: Kind.INT, value: 1 },
  ] as ValueNode[])(
    'GraphQlBigInt.parseLiteral should return string value when passing valid argument',
    value => {
      const res = GraphQlBigInt.parseLiteral(value);

      expect(res).toBe('1');
    },
  );
});
