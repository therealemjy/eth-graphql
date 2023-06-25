import { GraphQLFieldResolver } from 'graphql';

import { SolidityValue } from '../types';

const resolve: GraphQLFieldResolver<{ [key: string]: SolidityValue }, unknown, unknown> = (
  _obj: { [key: string]: SolidityValue },
  _args,
  _context,
  result,
) => _obj[result.fieldName];

export default resolve;
