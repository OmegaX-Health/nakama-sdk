import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { getReleaseWorkflowInvariantFailures } from '../scripts/check-github-release-governance.mjs';
import {
  branchProtectionBody,
  deploymentBranchPolicyBody,
  restrictionPayload,
} from '../scripts/setup-github-release-governance.mjs';

test('release workflow satisfies static governance invariants', () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');

  assert.deepEqual(getReleaseWorkflowInvariantFailures(workflow), []);
});

test('release workflow invariants catch unsafe publish drift', () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8')
    .replace('environment: npm-production', 'environment: unprotected')
    .replace('id-token: write', 'id-token: none')
    .replace(
      'npm publish --ignore-scripts --access public --provenance',
      'npm publish',
    );

  assert.deepEqual(getReleaseWorkflowInvariantFailures(workflow), [
    'Release workflow publish job must depend on verify and use the npm-production environment.',
    'Release workflow publish job must request OIDC id-token: write permission.',
    'Release workflow must publish with ignore-scripts, public access, and provenance.',
  ]);
});

test('release workflow trigger invariant rejects extra release events', () => {
  const workflow = readFileSync(
    '.github/workflows/release.yml',
    'utf8',
  ).replace("      - 'v*'", "      - 'v*'\n  workflow_dispatch:");

  assert.deepEqual(getReleaseWorkflowInvariantFailures(workflow), [
    'Release workflow must run only from v* tag pushes.',
  ]);
});

test('release setup preserves existing branch protection safety settings', () => {
  const body = branchProtectionBody({
    required_status_checks: {
      strict: true,
      contexts: ['test'],
      checks: [{ context: 'test', app_id: 15368 }],
    },
    required_pull_request_reviews: {
      dismiss_stale_reviews: false,
      require_code_owner_reviews: false,
      required_approving_review_count: 2,
      require_last_push_approval: true,
      dismissal_restrictions: {
        users: [{ login: 'release-owner' }],
        teams: [{ slug: 'security' }],
        apps: [{ slug: 'release-bot' }],
      },
      bypass_pull_request_allowances: {
        users: [{ login: 'maintainer' }],
        teams: [],
        apps: [],
      },
    },
    restrictions: {
      users: [{ login: 'release-owner' }],
      teams: [{ slug: 'maintainers' }],
      apps: [{ slug: 'release-bot' }],
    },
    required_linear_history: { enabled: true },
    allow_force_pushes: { enabled: false },
    allow_deletions: { enabled: false },
    block_creations: { enabled: true },
    required_conversation_resolution: { enabled: true },
    lock_branch: { enabled: false },
    allow_fork_syncing: { enabled: false },
  });

  assert.deepEqual(body.required_status_checks, {
    strict: true,
    contexts: ['test'],
    checks: [{ context: 'test', app_id: 15368 }],
  });
  assert.deepEqual(body.required_pull_request_reviews, {
    dismiss_stale_reviews: false,
    require_code_owner_reviews: true,
    required_approving_review_count: 2,
    require_last_push_approval: true,
    dismissal_restrictions: {
      users: ['release-owner'],
      teams: ['security'],
      apps: ['release-bot'],
    },
    bypass_pull_request_allowances: {
      users: ['maintainer'],
      teams: [],
      apps: [],
    },
  });
  assert.deepEqual(body.restrictions, {
    users: ['release-owner'],
    teams: ['maintainers'],
    apps: ['release-bot'],
  });
  assert.equal(body.required_linear_history, true);
  assert.equal(body.allow_force_pushes, false);
  assert.equal(body.allow_deletions, false);
  assert.equal(body.block_creations, true);
  assert.equal(body.required_conversation_resolution, true);
  assert.equal(body.lock_branch, false);
  assert.equal(body.allow_fork_syncing, false);
});

test('release setup fails closed when existing restrictions cannot be preserved', () => {
  assert.throws(
    () =>
      restrictionPayload(
        {
          users: [{}],
          teams: [],
          apps: [],
        },
        'branch push',
      ),
    /Cannot preserve existing branch push user restrictions/u,
  );
});

test('release setup preserves environment deployment branch policy', () => {
  assert.deepEqual(
    deploymentBranchPolicyBody({
      deployment_branch_policy: {
        protected_branches: true,
        custom_branch_policies: false,
      },
    }),
    {
      protected_branches: true,
      custom_branch_policies: false,
    },
  );
  assert.equal(deploymentBranchPolicyBody({}), null);
});
