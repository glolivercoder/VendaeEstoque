import React, { useEffect } from 'react';
import { runSalesTests } from '../utils/testRunner';

export default function TestRunner() {
  useEffect(() => {
    console.log('TestRunner component mounted');
    runSalesTests()
      .then(() => console.log('Tests completed successfully'))
      .catch(err => console.error('Test error:', err));
  }, []);

  return (
    <div>
      <h2>Test Runner</h2>
      <p>Check console for test results</p>
    </div>
  );
}