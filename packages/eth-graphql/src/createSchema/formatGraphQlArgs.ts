import { ArgumentNode } from 'graphql';

const formatGraphQlArgs = (args: ReadonlyArray<ArgumentNode>) =>
  args.reduce<ReadonlyArray<string | boolean>>(
    (accArguments, argument) =>
      'value' in argument.value ? [...accArguments, argument.value.value] : accArguments,
    [],
  );

export default formatGraphQlArgs;
