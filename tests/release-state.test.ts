import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyReleaseState,
  formatReleaseStateReport,
} from '../scripts/check-release-state.mjs';

test('release state classifier reports the current unpublished release shape', () => {
  const state = classifyReleaseState({
    packageName: '@nakama-health/protocol-sdk',
    packageVersion: '0.8.10',
    git: {
      branch: 'main',
      upstream: 'origin/main',
      ahead: 16,
      behind: 0,
      remoteTagRefs: [],
    },
    npm: {
      latest: '0.8.9',
      distTags: { latest: '0.8.9' },
      versions: ['0.8.8', '0.8.9'],
    },
    github: {
      releases: [{ tagName: 'v0.8.8', isLatest: true }],
    },
  });

  assert.equal(state.tagName, 'v0.8.10');
  assert.equal(state.git.synced, false);
  assert.equal(state.git.remoteTagExists, false);
  assert.equal(state.npm.versionPublished, false);
  assert.equal(state.github.releaseExists, false);
  assert.deepEqual(
    state.findings.map((finding) => finding.code),
    [
      'git-ahead-upstream',
      'npm-version-unpublished',
      'remote-tag-missing',
      'github-release-missing',
    ],
  );
  assert.match(formatReleaseStateReport(state), /local version unpublished/u);
});

test('release state classifier accepts a synced published release', () => {
  const state = classifyReleaseState({
    packageName: '@nakama-health/protocol-sdk',
    packageVersion: '0.8.10',
    git: {
      branch: 'main',
      upstream: 'origin/main',
      ahead: 0,
      behind: 0,
      remoteTagRefs: [
        'abc123\trefs/tags/v0.8.10',
        'def456\trefs/tags/v0.8.10^{}',
      ],
    },
    npm: {
      latest: '0.8.10',
      distTags: { latest: '0.8.10' },
      versions: ['0.8.9', '0.8.10'],
    },
    github: {
      releases: [{ tagName: 'v0.8.10', isLatest: true }],
    },
  });

  assert.equal(state.git.synced, true);
  assert.equal(state.git.remoteTagExists, true);
  assert.equal(state.npm.versionPublished, true);
  assert.equal(state.github.releaseExists, true);
  assert.deepEqual(state.findings, []);
});

test('release state classifier flags partial publish drift', () => {
  const state = classifyReleaseState({
    packageName: '@nakama-health/protocol-sdk',
    packageVersion: '0.8.10',
    git: {
      branch: 'main',
      upstream: 'origin/main',
      ahead: 0,
      behind: 0,
      remoteTagRefs: ['abc123\trefs/tags/v0.8.10'],
    },
    npm: {
      latest: '0.8.9',
      distTags: { latest: '0.8.9' },
      versions: ['0.8.9'],
    },
    github: {
      releases: [{ tagName: 'v0.8.10', isLatest: true }],
    },
  });

  assert.deepEqual(
    state.findings.map((finding) => finding.code),
    [
      'npm-version-unpublished',
      'tag-without-npm-version',
      'github-release-without-npm-version',
    ],
  );
  assert.equal(
    state.findings.filter((finding) => finding.severity === 'warning').length,
    2,
  );
});

test('release state classifier fails closed on missing upstream and unavailable npm', () => {
  const state = classifyReleaseState({
    packageName: '@nakama-health/protocol-sdk',
    packageVersion: '0.8.10',
    git: {
      branch: 'detached',
      upstream: null,
      ahead: 0,
      behind: 0,
      remoteTagRefs: [],
    },
    npm: {
      latest: null,
      distTags: {},
      versions: [],
      errors: ['registry unavailable'],
    },
    github: {
      releases: [],
    },
  });

  assert.equal(state.git.synced, false);
  assert.equal(state.npm.registryAvailable, false);
  assert.deepEqual(
    state.findings.map((finding) => finding.code),
    [
      'git-upstream-missing',
      'npm-registry-unavailable',
      'remote-tag-missing',
      'github-release-missing',
    ],
  );
  assert.match(formatReleaseStateReport(state), /npm: registry unavailable/u);
  assert.doesNotMatch(
    formatReleaseStateReport(state),
    /local version unpublished/u,
  );
});

test('release state report does not call unavailable external probes missing', () => {
  const state = classifyReleaseState({
    packageName: '@nakama-health/protocol-sdk',
    packageVersion: '0.8.10',
    git: {
      branch: 'main',
      upstream: 'origin/main',
      ahead: 0,
      behind: 0,
      remoteTagRefs: [],
      remoteTagError: 'git ls-remote timed out',
    },
    npm: {
      latest: '0.8.10',
      distTags: { latest: '0.8.10' },
      versions: ['0.8.10'],
    },
    github: {
      releases: [],
      error: 'gh release list timed out',
    },
  });

  assert.equal(state.git.remoteTagAvailable, false);
  assert.equal(state.github.releasesAvailable, false);
  assert.deepEqual(
    state.findings.map((finding) => finding.code),
    ['github-release-list-unavailable', 'remote-tag-list-unavailable'],
  );

  const report = formatReleaseStateReport(state);
  assert.match(report, /tag: v0\.8\.10 unknown; remote tag list unavailable/u);
  assert.match(report, /GitHub release: unknown; release list unavailable/u);
  assert.doesNotMatch(report, /missing on origin/u);
  assert.doesNotMatch(report, /GitHub release: missing/u);
});
