import { GraphQLResolveInfo } from 'graphql';

import { SolidityValue } from '../../types';
import resolve from '../resolve';

describe('createSchema/resolve', () => {
  it('should return correct value when field exists', () => {
    const obj: { [key: string]: SolidityValue } = { field: 'test' };
    const result = { fieldName: 'field' } as GraphQLResolveInfo;

    expect(resolve(obj, {}, {}, result)).toBe('test');
  });

  it('should return undefined when field does not exist', () => {
    const obj: { [key: string]: SolidityValue } = { field: 'test' };
    const result = { fieldName: 'nonexistent' } as GraphQLResolveInfo;

    expect(resolve(obj, {}, {}, result)).toBeUndefined();
  });
});
