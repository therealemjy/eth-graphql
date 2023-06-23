import { GraphQLFieldConfig } from 'graphql';

import { SolidityValue } from '../types';

const resolve: GraphQLFieldConfig<{ [key: string]: SolidityValue }, unknown, unknown>['resolve'] = (
  _obj: { [key: string]: SolidityValue },
  _args,
  _context,
  result,
) => _obj[result.fieldName];

export default resolve;
