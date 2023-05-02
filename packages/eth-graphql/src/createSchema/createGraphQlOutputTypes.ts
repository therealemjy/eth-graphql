import { JsonFragmentType } from 'ethers';

import createGraphQlType from './createGraphQlType';
import { SharedGraphQlTypes } from './types';

const createGraphQlOutputTypes = ({
  components,
  sharedGraphQlTypes,
}: {
  components: ReadonlyArray<JsonFragmentType>;
  sharedGraphQlTypes: SharedGraphQlTypes;
}) => {
  if (components.length === 1) {
    return createGraphQlType({
      isInput: false,
      component: components[0],
      sharedGraphQlTypes,
    });
  }

  return components.map(component =>
    createGraphQlType({
      isInput: false,
      component,
      sharedGraphQlTypes,
    }),
  );
};

export default createGraphQlOutputTypes;
