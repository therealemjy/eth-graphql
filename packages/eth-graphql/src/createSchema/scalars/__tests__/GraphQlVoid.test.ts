import { BigNumber } from 'ethers';
import { Kind, ValueNode } from 'graphql';

import GraphQlVoid from '../GraphQlVoid';

describe('createSchema/scalars/GraphQlVoid', () => {
  it.each([BigNumber.from(1), 1, '1', BigInt(1), {}, [], undefined, null])(
    'GraphQlVoid.serialize should return passed argument without modifying it',
    value => {
      const res = GraphQlVoid.serialize(value);

      expect(res).toBe(value);
    },
  );

  it.each([BigNumber.from(1), 1, '1', BigInt(1), {}, [], undefined, null])(
    'GraphQlVoid.parseValue should return undefined',
    value => {
      const res = GraphQlVoid.parseValue(value);

      expect(res).toBe(undefined);
    },
  );

  it.each([
    { kind: Kind.STRING },
    { kind: Kind.INT },
    { kind: Kind.VARIABLE },
    { kind: Kind.FLOAT },
    { kind: Kind.FLOAT },
    { kind: Kind.BOOLEAN },
    { kind: Kind.NULL },
    { kind: Kind.ENUM },
    { kind: Kind.BOOLEAN },
    { kind: Kind.LIST },
    { kind: Kind.OBJECT },
  ] as ValueNode[])('GraphQlVoid.parseLiteral should return undefined', value => {
    const res = GraphQlVoid.parseLiteral(value);

    expect(res).toBe(undefined);
  });
});
