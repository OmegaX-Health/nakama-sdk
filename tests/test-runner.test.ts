import test from 'node:test';
import assert from 'node:assert/strict';

import { findTestFiles } from '../scripts/run-tests.mjs';

test('test runner discovers sorted TypeScript test files across the test tree', () => {
  const testFiles = findTestFiles();

  assert.ok(testFiles.length > 0);
  assert.deepEqual(
    [...testFiles].sort((left, right) => left.localeCompare(right)),
    testFiles,
  );
  assert.ok(testFiles.every((filePath) => filePath.startsWith('tests/')));
  assert.ok(testFiles.every((filePath) => filePath.endsWith('.test.ts')));
  assert.ok(testFiles.includes('tests/claims.test.ts'));
  assert.ok(testFiles.includes('tests/protocol-builders.test.ts'));
  assert.ok(testFiles.includes('tests/test-runner.test.ts'));
});
