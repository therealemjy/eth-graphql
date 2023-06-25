import { GraphQLResolveInfo } from 'graphql';

import { SolidityValue } from '../../types';
import resolve from '../resolve';

describe('GraphQL Resolver Tests', () => {
  it('Should return correct value when field exists', () => {
    const obj: { [key: string]: SolidityValue } = { field: 'test' };
    const result = { fieldName: 'field' } as GraphQLResolveInfo;

    expect(resolve(obj, {}, {}, result)).toBe('test');
  });

  it('Should return undefined when field does not exist', () => {
    const obj: { [key: string]: SolidityValue } = { field: 'test' };
    const result = { fieldName: 'nonexistent' } as GraphQLResolveInfo;

    expect(resolve(obj, {}, {}, result)).toBeUndefined();
  });
});
