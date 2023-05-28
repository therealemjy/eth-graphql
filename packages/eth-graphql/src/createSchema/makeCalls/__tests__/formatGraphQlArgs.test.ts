import { ArgumentNode, Kind, ValueNode } from 'graphql';

import formatGraphQlArgs from '../formatGraphQlArgs';

describe('createSchema/makeCalls/formatGraphQlArgs', () => {
  it.each([Kind.NULL, Kind.VARIABLE])(
    'throws an error if one of the argument values is of the kind %s',
    kind => {
      const args: ArgumentNode[] = [
        {
          kind: Kind.ARGUMENT,
          name: {
            kind: Kind.NAME,
            value: 'fake argument name',
          },
          value: {
            kind,
            value: 'fake value',
          } as ValueNode,
        },
      ];

      try {
        formatGraphQlArgs(args);

        throw new Error('formatGraphQlArgs should have thrown an error but did not');
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    },
  );

  it('converts argument nodes to valid arguments', () => {
    const args: ArgumentNode[] = [
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 0',
        },
        value: {
          kind: Kind.LIST,
          values: [
            {
              kind: Kind.LIST,
              values: [
                {
                  kind: Kind.STRING,
                  value: 'fake string 0',
                },
              ],
            },
          ],
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 1',
        },
        value: {
          kind: Kind.OBJECT,
          fields: [
            {
              kind: Kind.OBJECT_FIELD,
              name: {
                kind: Kind.NAME,
                value: 'fake name 2',
              },
              value: {
                kind: Kind.OBJECT,
                fields: [
                  {
                    kind: Kind.OBJECT_FIELD,
                    name: {
                      kind: Kind.NAME,
                      value: 'fake name 3',
                    },
                    value: {
                      kind: Kind.STRING,
                      value: 'fake string 1',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 4',
        },
        value: {
          kind: Kind.STRING,
          value: 'fake string 2',
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 5',
        },
        value: {
          kind: Kind.BOOLEAN,
          value: true,
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 6',
        },
        value: {
          kind: Kind.INT,
          value: '100',
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 7',
        },
        value: {
          kind: Kind.FLOAT,
          value: '0.1',
        },
      },
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 7',
        },
        value: {
          kind: Kind.ENUM,
          value: '0',
        },
      },
    ];

    const res = formatGraphQlArgs(args);

    expect(res).toMatchSnapshot();
  });
});
