import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatLocalnetFailure,
  isRetryableLocalnetError,
} from '../scripts/run-protocol-localnet.mjs';

test('localnet retry classifier recognizes validator startup races', () => {
  assert.equal(
    isRetryableLocalnetError(
      new Error(
        'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA is not deployed',
      ),
    ),
    true,
  );
  assert.equal(
    isRetryableLocalnetError(new Error('Unsupported program id')),
    true,
  );
  assert.equal(
    isRetryableLocalnetError(
      new Error('Timed out waiting for validator RPC at http://127.0.0.1:8899'),
    ),
    true,
  );
});

test('localnet retry classifier leaves deterministic failures non-retryable', () => {
  assert.equal(
    isRetryableLocalnetError(new Error('assertion failed: expected 1 got 2')),
    false,
  );
});

test('localnet failure formatting includes validator log tail', () => {
  const rendered = formatLocalnetFailure({
    error: new Error('Unsupported program id'),
    validatorLogTail: 'tail line 1\ntail line 2',
  });

  assert.match(rendered, /Unsupported program id/);
  assert.match(rendered, /Validator log tail/);
  assert.match(rendered, /tail line 2/);
});
