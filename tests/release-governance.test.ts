import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  getBranchProtectionFailures,
  getEnvironmentProtectionFailures,
  getEnvironmentHumanReviewerLogins,
  getEnvironmentReviewerTeamReferences,
  getReleaseSecretFailures,
  buildReleaseGovernanceReport,
  getReleaseWorkflowInvariantFailures,
} from '../scripts/check-github-release-governance.mjs';
import {
  branchProtectionBody,
  deploymentBranchPolicyBody,
  eligibleHumanReviewerLogins,
  eligibleTeamReviewerMembers,
  nextGitHubPagePath,
  restrictionPayload,
} from '../scripts/setup-github-release-governance.mjs';
import {
  buildLiveReleaseGovernanceArgs,
  buildLiveReleaseGovernanceEnv,
  needsGitHubToken,
} from '../scripts/run-live-release-governance.mjs';

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

test('live branch protection classification catches unsafe settings', () => {
  assert.deepEqual(
    getBranchProtectionFailures({
      required_status_checks: {
        strict: true,
        contexts: ['test'],
        checks: [],
      },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        require_code_owner_reviews: true,
      },
    }),
    [],
  );

  assert.deepEqual(
    getBranchProtectionFailures({
      required_status_checks: {
        strict: false,
        contexts: [],
        checks: [],
      },
      allow_force_pushes: { enabled: true },
      allow_deletions: { enabled: true },
      required_pull_request_reviews: null,
    }),
    [
      'main branch protection must require strict status checks.',
      'main branch protection must require at least one status check.',
      'main branch protection must not allow force pushes.',
      'main branch protection must not allow branch deletion.',
      'main branch protection must require at least one approving PR review.',
      'main branch protection must require CODEOWNERS review.',
    ],
  );
});

test('live environment governance classification requires independent publish review', () => {
  assert.deepEqual(
    getEnvironmentProtectionFailures({
      protection_rules: [
        {
          type: 'required_reviewers',
          prevent_self_review: true,
          reviewers: [
            { reviewer: { login: 'first' } },
            { reviewer: { login: 'second' } },
          ],
        },
      ],
    }),
    [],
  );

  assert.deepEqual(
    getEnvironmentProtectionFailures({
      protection_rules: [
        {
          type: 'required_reviewers',
          prevent_self_review: false,
          reviewers: [{ reviewer: { login: 'only' } }],
        },
      ],
    }),
    [
      'npm-production environment must require at least two reviewers.',
      'npm-production environment must prevent self-review.',
      'npm-production environment must require at least two distinct eligible human reviewers.',
    ],
  );
  assert.deepEqual(getEnvironmentProtectionFailures({ protection_rules: [] }), [
    'npm-production environment must require reviewers.',
  ]);
});

test('live environment governance validates distinct humans behind team reviewers', () => {
  const environment = {
    protection_rules: [
      {
        type: 'required_reviewers',
        prevent_self_review: true,
        reviewers: [
          { type: 'User', reviewer: { login: 'marinosabijan' } },
          {
            type: 'Team',
            reviewer: { slug: 'release-reviewers', id: 42 },
          },
        ],
      },
    ],
  };

  assert.deepEqual(getEnvironmentReviewerTeamReferences(environment), [
    {
      id: '42',
      slug: 'release-reviewers',
      label: 'release-reviewers',
    },
  ]);

  assert.deepEqual(
    getEnvironmentHumanReviewerLogins(environment, {
      teamMembersBySlug: new Map([
        ['release-reviewers', [{ login: 'MARINOSABIJAN' }]],
      ]),
    }),
    {
      logins: ['marinosabijan'],
      missingTeamMembership: [],
    },
  );

  assert.deepEqual(
    getEnvironmentProtectionFailures(environment, {
      teamMembersBySlug: new Map([
        ['release-reviewers', [{ login: 'MARINOSABIJAN' }]],
      ]),
    }),
    [
      'npm-production environment must require at least two distinct eligible human reviewers.',
    ],
  );

  assert.deepEqual(
    getEnvironmentProtectionFailures(environment, {
      teamMembersBySlug: new Map([
        [
          'release-reviewers',
          [{ login: 'MARINOSABIJAN' }, { login: 'second-reviewer' }],
        ],
      ]),
    }),
    [],
  );
});

test('live environment governance fails closed when team membership is hidden', () => {
  assert.deepEqual(
    getEnvironmentProtectionFailures({
      protection_rules: [
        {
          type: 'required_reviewers',
          prevent_self_review: true,
          reviewers: [
            { type: 'User', reviewer: { login: 'marinosabijan' } },
            {
              type: 'Team',
              reviewer: { slug: 'release-reviewers', id: 42 },
            },
          ],
        },
      ],
    }),
    [
      'npm-production reviewer team release-reviewers membership must be visible to verify independent release reviewers.',
    ],
  );
});

test('live secret governance classification detects missing and stale release secrets', () => {
  assert.deepEqual(
    getReleaseSecretFailures({
      repository: {
        secrets: [{ name: 'OMEGAX_GOVERNANCE_READ_TOKEN' }],
      },
      organization: { secrets: [] },
      environment: { secrets: [] },
    }),
    [],
  );

  assert.deepEqual(
    getReleaseSecretFailures({
      repository: {
        secrets: [{ name: 'NPM_TOKEN' }],
      },
      organization: {
        secrets: [{ name: 'NODE_AUTH_TOKEN' }],
      },
      environment: {
        secrets: [{ name: 'NPM_TOKEN' }],
      },
    }),
    [
      'Repository Actions secrets must include OMEGAX_GOVERNANCE_READ_TOKEN for the unprotected release verify job.',
      'Repository Actions secrets must not include stale npm publish token NPM_TOKEN; trusted publishing should use OIDC.',
      'Organization Actions secrets must not include stale npm publish token NODE_AUTH_TOKEN; trusted publishing should use OIDC.',
      'npm-production environment secrets must not include stale npm publish token NPM_TOKEN; trusted publishing should use OIDC.',
    ],
  );
});

test('live governance wrapper defaults to the SDK repo and authenticated gh token', () => {
  assert.equal(needsGitHubToken({}), true);
  assert.equal(needsGitHubToken({ GITHUB_TOKEN: 'existing' }), false);
  assert.equal(
    needsGitHubToken({ OMEGAX_GOVERNANCE_TOKEN: 'existing' }),
    false,
  );

  assert.deepEqual(buildLiveReleaseGovernanceEnv({}, 'gh-token-for-test'), {
    GITHUB_REPOSITORY: 'OmegaX-Health/omegax-sdk',
    OMEGAX_REQUIRE_GITHUB_GOVERNANCE: '1',
    GITHUB_TOKEN: 'gh-token-for-test',
  });

  assert.deepEqual(
    buildLiveReleaseGovernanceEnv(
      {
        GITHUB_REPOSITORY: 'Example/repo',
        OMEGAX_REQUIRE_GITHUB_GOVERNANCE: '0',
        GITHUB_TOKEN: 'explicit-token',
      },
      'gh-token-for-test',
    ),
    {
      GITHUB_REPOSITORY: 'Example/repo',
      OMEGAX_REQUIRE_GITHUB_GOVERNANCE: '0',
      GITHUB_TOKEN: 'explicit-token',
    },
  );
});

test('live governance wrapper forwards structured-output flags', () => {
  assert.deepEqual(
    buildLiveReleaseGovernanceArgs('/tmp/checker.mjs', ['--json']),
    ['/tmp/checker.mjs', '--json'],
  );
});

test('release governance report exposes structured blocker evidence', () => {
  assert.deepEqual(
    buildReleaseGovernanceReport({
      repository: 'OmegaX-Health/omegax-sdk',
      liveChecked: true,
      failures: ['branch protection missing'],
      warnings: ['org secret visibility unavailable'],
    }),
    {
      ok: false,
      repository: 'OmegaX-Health/omegax-sdk',
      liveChecked: true,
      failures: ['branch protection missing'],
      warnings: ['org secret visibility unavailable'],
    },
  );
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

test('release setup filters excluded team members before accepting team reviewers', () => {
  assert.deepEqual(
    eligibleTeamReviewerMembers(
      [{ login: 'marinosabijan' }, { login: 'code-owner-alias' }, {}],
      new Set(['code-owner-alias']),
    ),
    ['marinosabijan'],
  );

  assert.deepEqual(
    eligibleTeamReviewerMembers(
      [{ login: 'CODE-OWNER-ALIAS' }],
      new Set(['code-owner-alias']),
    ),
    [],
  );
});

test('release setup counts distinct eligible humans across users and teams', () => {
  assert.deepEqual(
    eligibleHumanReviewerLogins([
      { type: 'User', login: 'marinosabijan' },
      {
        type: 'Team',
        slug: 'release-reviewers',
        eligibleMemberLogins: ['MARINOSABIJAN', 'second-reviewer'],
      },
    ]),
    ['marinosabijan', 'second-reviewer'],
  );

  assert.deepEqual(
    eligibleHumanReviewerLogins([
      { type: 'User', login: 'marinosabijan' },
      {
        type: 'Team',
        slug: 'release-reviewers',
        eligibleMemberLogins: ['MARINOSABIJAN'],
      },
    ]),
    ['marinosabijan'],
  );
});

test('release setup follows GitHub pagination links for reviewer team inspection', () => {
  assert.equal(
    nextGitHubPagePath(
      '<https://api.github.com/orgs/OmegaX-Health/teams/release/members?per_page=100&page=2>; rel="next", <https://api.github.com/orgs/OmegaX-Health/teams/release/members?per_page=100&page=3>; rel="last"',
    ),
    '/orgs/OmegaX-Health/teams/release/members?per_page=100&page=2',
  );

  assert.equal(nextGitHubPagePath(null), null);
});
