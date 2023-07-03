import { ArgumentNode, Kind } from 'graphql';

import formatArgumentNodes from '../formatArgumentNodes';

describe('createSchema/makeCalls/formatArgumentNodes', () => {
  it('converts argument nodes to valid arguments', () => {
    const fakeVariableName = 'fakeVariable';
    const argumentNodes: ArgumentNode[] = [
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
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: 'fake name 8',
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: fakeVariableName,
          },
        },
      },
    ];

    const res = formatArgumentNodes({
      argumentNodes,
      variableValues: {
        [fakeVariableName]: 'fake variable value',
      },
    });

    expect(res).toMatchSnapshot();
  });
});
