import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildVerificationSummary,
  formatProtocolWorkspaceStateLines,
} from '../scripts/verify-protocol-local.mjs';

test('verification reporting uses workspace-state language and avoids stale status wording', () => {
  const surfaceSummaryRoot = mkdtempSync(
    join(tmpdir(), 'nakama-sdk-verify-summary-'),
  );
  const surfaceSummaryPath = join(surfaceSummaryRoot, 'surface-summary.json');
  writeFileSync(surfaceSummaryPath, JSON.stringify({ ok: true }), 'utf8');

  try {
    const workspaceState = {
      branch: 'main',
      commit: 'abc123',
      hasLocalChanges: true,
      workspaceFingerprint: 'fingerprint-123',
      changeSummary: {
        source: 'git',
        staged: 2,
        unstaged: 1,
        untracked: 3,
        tracked: 3,
      },
      porcelain:
        ' M shared/protocol_contract.json\n?? e2e/support/new-scenario.ts',
    };

    const lines = formatProtocolWorkspaceStateLines({
      protocolRepo: '/tmp/omegax-protocol',
      workspaceState,
    });
    const rendered = lines.join('\n');
    const deprecatedStatusWord = ['dir', 'ty'].join('');
    assert.match(rendered, /Protocol workspace changes: present/);
    assert.match(rendered, /Protocol workspace fingerprint: fingerprint-123/);
    assert.doesNotMatch(
      rendered.toLowerCase(),
      new RegExp(deprecatedStatusWord),
    );

    const summary = buildVerificationSummary({
      protocolRepo: '/tmp/omegax-protocol',
      protocolWorkspaceState: workspaceState,
      finalProtocolWorkspaceState: workspaceState,
      commands: [],
      surfaceSummaryPath,
      verificationError: null,
    });
    assert.equal(summary.surfaceSummaryExists, true);
    assert.equal(summary.workspaceStateStable, true);
    assert.doesNotMatch(
      JSON.stringify(summary).toLowerCase(),
      new RegExp(deprecatedStatusWord),
    );
  } finally {
    rmSync(surfaceSummaryRoot, { recursive: true, force: true });
  }
});
