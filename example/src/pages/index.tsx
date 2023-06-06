import { useState } from 'react';

import Everything from '../components/Everything';
import Subset from '../components/Subset';

export default function Web() {
  const [showComponent, setShowComponent] = useState(false);

  return (
    <>
      <Everything />

      <button onClick={() => setShowComponent(true)}>Show component</button>

      {showComponent && <Subset />}
    </>
  );
}
