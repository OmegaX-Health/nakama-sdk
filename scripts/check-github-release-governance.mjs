#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const jsonOutput = process.argv.includes('--json');
const failures = [];
const warnings = [];
let governanceEvidence = null;

function parseCsv(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function excludedReleaseReviewerLogins(env = process.env) {
  return new Set(
    parseCsv(env.OMEGAX_RELEASE_EXCLUDED_REVIEWERS).map((login) =>
      login.toLowerCase(),
    ),
  );
}

function fail(message) {
  failures.push(message);
  if (!jsonOutput) {
    console.error(message);
  }
  process.exitCode = 1;
}

function warn(message) {
  warnings.push(message);
  if (!jsonOutput) {
    console.warn(`Warning: ${message}`);
  }
}

export function buildReleaseGovernanceReport({
  repository = null,
  liveChecked = false,
  failures: reportFailures = [],
  warnings: reportWarnings = [],
  evidence = null,
}) {
  const report = {
    ok: reportFailures.length === 0,
    repository,
    liveChecked,
    failures: reportFailures,
    warnings: reportWarnings,
  };
  if (evidence) {
    report.evidence = evidence;
  }
  return report;
}

function finish(message, { liveChecked = false } = {}) {
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        buildReleaseGovernanceReport({
          repository: process.env.GITHUB_REPOSITORY ?? null,
          liveChecked,
          failures,
          warnings,
          evidence: governanceEvidence,
        }),
        null,
        2,
      ),
    );
  } else if (!process.exitCode && message) {
    console.log(message);
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

const releaseWorkflowInvariants = [
  {
    pattern: /name:\s+Release/u,
    message: 'Release workflow must be named Release.',
  },
  {
    pattern:
      /Release governance[\s\S]*GITHUB_TOKEN:\s*\$\{\{\s*secrets\.OMEGAX_GOVERNANCE_READ_TOKEN\s*\}\}[\s\S]*OMEGAX_REQUIRE_GITHUB_GOVERNANCE:\s*['"]1['"][\s\S]*run:\s+npm run security:release-governance/u,
    message:
      'Release workflow verify job must run live release governance with OMEGAX_GOVERNANCE_READ_TOKEN.',
  },
  {
    pattern:
      /publish:\s*\n\s+runs-on:[\s\S]*needs:\s+verify[\s\S]*environment:\s+npm-production/u,
    message:
      'Release workflow publish job must depend on verify and use the npm-production environment.',
  },
  {
    pattern:
      /publish:[\s\S]*permissions:\s*\n\s+contents:\s+read\s*\n\s+id-token:\s+write/u,
    message:
      'Release workflow publish job must request OIDC id-token: write permission.',
  },
  {
    pattern:
      /Install dependencies without lifecycle scripts[\s\S]*run:\s+npm ci --ignore-scripts/u,
    message:
      'Release workflow publish job must install dependencies without lifecycle scripts.',
  },
  {
    pattern:
      /Validate release tag and npm availability[\s\S]*npm run security:release-tag/u,
    message:
      'Release workflow publish job must verify the release tag before publishing.',
  },
  {
    pattern:
      /Publish to npm[\s\S]*npm publish --ignore-scripts --access public --provenance/u,
    message:
      'Release workflow must publish with ignore-scripts, public access, and provenance.',
  },
];

function topLevelKeyName(line) {
  const match = /^([A-Za-z0-9_-]+):(?:\s|$)/u.exec(line);
  return match?.[1] ?? null;
}

export function getTopLevelBlock(workflow, key) {
  const lines = workflow.split(/\r?\n/u);
  const startIndex = lines.findIndex((line) => topLevelKeyName(line) === key);
  if (startIndex === -1) return null;

  const block = [lines[startIndex]];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (topLevelKeyName(line)) break;
    block.push(line);
  }
  return block.join('\n');
}

export function getReleaseWorkflowTriggerFailures(workflow) {
  const onBlock = getTopLevelBlock(workflow, 'on');
  if (!onBlock) {
    return ['Release workflow must run only from v* tag pushes.'];
  }
  const normalized = onBlock.trimEnd();
  const expected = ['on:', '  push:', '    tags:', "      - 'v*'"].join('\n');

  return normalized === expected
    ? []
    : ['Release workflow must run only from v* tag pushes.'];
}

export function getReleaseWorkflowInvariantFailures(workflow) {
  const failures = [];
  if (workflow.includes('NODE_AUTH_TOKEN')) {
    failures.push('Release workflow must not publish with NODE_AUTH_TOKEN.');
  }
  if (workflow.includes('NPM_TOKEN')) {
    failures.push('Release workflow must not reference NPM_TOKEN.');
  }
  if (workflow.includes('ALLOW_UNSIGNED_RELEASE_TAG')) {
    failures.push(
      'Release workflow must not bypass signed release tag verification.',
    );
  }
  failures.push(...getReleaseWorkflowTriggerFailures(workflow));

  for (const { pattern, message } of releaseWorkflowInvariants) {
    const matches =
      typeof pattern === 'string'
        ? workflow.includes(pattern)
        : pattern.test(workflow);
    if (!matches) {
      failures.push(message);
    }
  }
  return failures;
}

export function getBranchProtectionFailures(branch) {
  const failures = [];
  const statusChecks = branch?.required_status_checks;
  const requiredStatusCheckCount =
    (statusChecks?.contexts ?? []).length + (statusChecks?.checks ?? []).length;
  if (!statusChecks || statusChecks.strict !== true) {
    failures.push('main branch protection must require strict status checks.');
  }
  if (requiredStatusCheckCount < 1) {
    failures.push(
      'main branch protection must require at least one status check.',
    );
  }
  if (branch?.allow_force_pushes?.enabled !== false) {
    failures.push('main branch protection must not allow force pushes.');
  }
  if (branch?.allow_deletions?.enabled !== false) {
    failures.push('main branch protection must not allow branch deletion.');
  }

  const prReviews = branch?.required_pull_request_reviews;
  const requiredReviews = Number(
    prReviews?.required_approving_review_count ?? 0,
  );
  if (requiredReviews < 1) {
    failures.push(
      'main branch protection must require at least one approving PR review.',
    );
  }
  if (!prReviews?.require_code_owner_reviews) {
    failures.push('main branch protection must require CODEOWNERS review.');
  }

  return failures;
}

export function getEnvironmentReviewerTeamReferences(environment) {
  const reviewerRule = (environment?.protection_rules ?? []).find(
    (rule) => rule.type === 'required_reviewers',
  );
  const reviewers = reviewerRule?.reviewers ?? [];
  return reviewers
    .map((reviewerEntry) => {
      const reviewer = reviewerEntry?.reviewer ?? reviewerEntry;
      const type = String(reviewerEntry?.type ?? reviewer?.type ?? '')
        .trim()
        .toLowerCase();
      const slug = String(reviewer?.slug ?? '').trim();
      const id = reviewer?.id == null ? null : String(reviewer.id);
      if (type !== 'team' && !slug) return null;

      return {
        id,
        slug: slug || null,
        label: slug || id || 'unknown-team',
      };
    })
    .filter(Boolean);
}

export function getEnvironmentHumanReviewerLogins(
  environment,
  {
    excludedReviewerLogins = new Set(),
    teamMembersBySlug = new Map(),
    teamMembersById = new Map(),
  } = {},
) {
  const reviewerRule = (environment?.protection_rules ?? []).find(
    (rule) => rule.type === 'required_reviewers',
  );
  const reviewers = reviewerRule?.reviewers ?? [];
  const logins = new Set();
  const missingTeamMembership = [];

  for (const reviewerEntry of reviewers) {
    const reviewer = reviewerEntry?.reviewer ?? reviewerEntry;
    const type = String(reviewerEntry?.type ?? reviewer?.type ?? '')
      .trim()
      .toLowerCase();
    const login = String(reviewer?.login ?? '').trim();
    const slug = String(reviewer?.slug ?? '').trim();
    const id = reviewer?.id == null ? null : String(reviewer.id);

    if ((type === 'user' || (!type && login)) && login) {
      const normalizedLogin = login.toLowerCase();
      if (!excludedReviewerLogins.has(normalizedLogin)) {
        logins.add(normalizedLogin);
      }
      continue;
    }

    if (type === 'team' || slug) {
      const teamMembers = slug
        ? teamMembersBySlug.get(slug.toLowerCase())
        : teamMembersById.get(id);
      if (!teamMembers) {
        missingTeamMembership.push(slug || id || 'unknown-team');
        continue;
      }

      for (const member of teamMembers) {
        const normalizedLogin = String(member?.login ?? member)
          .trim()
          .toLowerCase();
        if (!normalizedLogin || excludedReviewerLogins.has(normalizedLogin)) {
          continue;
        }
        logins.add(normalizedLogin);
      }
    }
  }

  return {
    logins: [...logins].sort(),
    missingTeamMembership,
  };
}

export function getEnvironmentProtectionFailures(environment, options = {}) {
  const failures = [];
  const reviewerRule = (environment?.protection_rules ?? []).find(
    (rule) => rule.type === 'required_reviewers',
  );
  const reviewers = reviewerRule?.reviewers ?? [];
  if (!reviewerRule) {
    failures.push('npm-production environment must require reviewers.');
    return failures;
  }
  if (reviewers.length < 2) {
    failures.push(
      'npm-production environment must require at least two reviewers.',
    );
  }
  if (reviewerRule.prevent_self_review !== true) {
    failures.push('npm-production environment must prevent self-review.');
  }
  const { logins, missingTeamMembership } = getEnvironmentHumanReviewerLogins(
    environment,
    options,
  );
  for (const team of missingTeamMembership) {
    failures.push(
      `npm-production reviewer team ${team} membership must be visible to verify independent release reviewers.`,
    );
  }
  if (missingTeamMembership.length === 0 && logins.length < 2) {
    failures.push(
      'npm-production environment must require at least two distinct eligible human reviewers.',
    );
  }
  return failures;
}

export function secretNamesFromResponse(response) {
  return new Set((response?.secrets ?? []).map((secret) => secret.name));
}

export function getReleaseSecretFailures(secretScopes) {
  const failures = [];
  const repositorySecrets = secretNamesFromResponse(secretScopes.repository);
  if (
    secretScopes.repository &&
    !repositorySecrets.has('OMEGAX_GOVERNANCE_READ_TOKEN')
  ) {
    failures.push(
      'Repository Actions secrets must include OMEGAX_GOVERNANCE_READ_TOKEN for the unprotected release verify job.',
    );
  }

  const stalePublishSecrets = ['NPM_TOKEN', 'NODE_AUTH_TOKEN'];
  for (const { label, response } of [
    { label: 'Repository Actions', response: secretScopes.repository },
    { label: 'Organization Actions', response: secretScopes.organization },
    { label: 'npm-production environment', response: secretScopes.environment },
  ]) {
    const secretNames = secretNamesFromResponse(response);
    for (const staleSecret of stalePublishSecrets) {
      if (!secretNames.has(staleSecret)) continue;
      failures.push(
        `${label} secrets must not include stale npm publish token ${staleSecret}; trusted publishing should use OIDC.`,
      );
    }
  }

  return failures;
}

export function getBranchProtectionEvidence(branch) {
  const statusChecks = branch?.required_status_checks;
  const prReviews = branch?.required_pull_request_reviews;

  return {
    strictStatusChecks: statusChecks?.strict ?? null,
    requiredStatusCheckCount:
      (statusChecks?.contexts ?? []).length +
      (statusChecks?.checks ?? []).length,
    requiredApprovingReviewCount:
      prReviews?.required_approving_review_count ?? 0,
    requiresCodeOwnerReviews: prReviews?.require_code_owner_reviews ?? false,
    allowsForcePushes: branch?.allow_force_pushes?.enabled ?? null,
    allowsDeletions: branch?.allow_deletions?.enabled ?? null,
  };
}

function reviewerSummary(reviewerEntry) {
  const reviewer = reviewerEntry?.reviewer ?? reviewerEntry;
  const type = String(reviewerEntry?.type ?? reviewer?.type ?? 'User').trim();
  const login = String(reviewer?.login ?? '').trim();
  const slug = String(reviewer?.slug ?? '').trim();
  const id = reviewer?.id == null ? null : String(reviewer.id);

  return {
    type: type || (slug ? 'Team' : 'User'),
    login: login || null,
    slug: slug || null,
    id,
  };
}

export function getEnvironmentProtectionEvidence(environment, options = {}) {
  const reviewerRule = (environment?.protection_rules ?? []).find(
    (rule) => rule.type === 'required_reviewers',
  );
  const reviewers = reviewerRule?.reviewers ?? [];
  const { logins, missingTeamMembership } = reviewerRule
    ? getEnvironmentHumanReviewerLogins(environment, options)
    : { logins: [], missingTeamMembership: [] };

  return {
    requiredReviewersConfigured: Boolean(reviewerRule),
    reviewerCount: reviewers.length,
    preventSelfReview: reviewerRule?.prevent_self_review ?? null,
    reviewers: reviewers.map(reviewerSummary),
    eligibleHumanReviewers: logins,
    missingTeamMembership,
  };
}

function secretScopeEvidence(
  response,
  { requireGovernanceToken = false } = {},
) {
  const names = secretNamesFromResponse(response);
  const stalePublishSecrets = ['NPM_TOKEN', 'NODE_AUTH_TOKEN'].filter((name) =>
    names.has(name),
  );

  return {
    visible: Boolean(response),
    hasGovernanceReadToken: requireGovernanceToken
      ? names.has('OMEGAX_GOVERNANCE_READ_TOKEN')
      : null,
    stalePublishSecrets,
  };
}

export function getReleaseSecretEvidence(secretScopes) {
  return {
    repository: secretScopeEvidence(secretScopes.repository, {
      requireGovernanceToken: true,
    }),
    organization: secretScopeEvidence(secretScopes.organization),
    environment: secretScopeEvidence(secretScopes.environment),
  };
}

function collaboratorPermission(collaborator) {
  const permissions = collaborator?.permissions ?? {};
  for (const permission of ['admin', 'maintain', 'push', 'triage', 'pull']) {
    if (permissions[permission]) return permission;
  }
  return null;
}

export function getReviewerInventoryEvidence({
  collaborators = null,
  teams = null,
  repositoryInvitations = null,
  organizationInvitations = null,
} = {}) {
  return {
    directCollaborators: Array.isArray(collaborators)
      ? collaborators
          .map((collaborator) => ({
            login: String(collaborator?.login ?? '').trim() || null,
            type: collaborator?.type ?? null,
            permission: collaboratorPermission(collaborator),
          }))
          .filter((collaborator) => collaborator.login)
      : null,
    teams: Array.isArray(teams)
      ? teams
          .map((team) => ({
            slug: String(team?.slug ?? '').trim() || null,
            name: String(team?.name ?? '').trim() || null,
            privacy: team?.privacy ?? null,
            permission: team?.permission ?? null,
          }))
          .filter((team) => team.slug)
      : null,
    pendingRepositoryInvitations: Array.isArray(repositoryInvitations)
      ? repositoryInvitations.map((invitation) => ({
          login: invitation?.invitee?.login ?? null,
          permissions: invitation?.permissions ?? null,
        }))
      : null,
    pendingOrganizationInvitations: Array.isArray(organizationInvitations)
      ? organizationInvitations.map((invitation) => ({
          login: invitation?.login ?? null,
          role: invitation?.role ?? null,
          hasEmailOnlyIdentity: Boolean(
            !invitation?.login && invitation?.email,
          ),
        }))
      : null,
  };
}

export function buildReleaseGovernanceEvidence({
  branch,
  environment,
  teamMembers = {},
  secretScopes = {},
  reviewerInventory = {},
} = {}) {
  return {
    branchProtection: getBranchProtectionEvidence(branch),
    environment: getEnvironmentProtectionEvidence(environment, teamMembers),
    secrets: getReleaseSecretEvidence(secretScopes),
    reviewerInventory: getReviewerInventoryEvidence(reviewerInventory),
  };
}

async function githubJson(path) {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return null;
  return await githubApiJson(`/repos/${repository}${path}`);
}

async function githubApiJson(path) {
  const token = process.env.OMEGAX_GOVERNANCE_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) return null;

  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub governance check failed for ${path}: ${response.status} ${await response.text()}`,
    );
  }
  return await response.json();
}

function nextGitHubPagePath(linkHeader) {
  for (const part of String(linkHeader ?? '').split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/u);
    if (!match) continue;

    const url = new URL(match[1]);
    return `${url.pathname}${url.search}`;
  }

  return null;
}

async function optionalGithubApiPages(path) {
  const token = process.env.OMEGAX_GOVERNANCE_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) return null;

  const items = [];
  let page = path;
  while (page) {
    const response = await fetch(`https://api.github.com${page}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (response.status === 403 || response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(
        `GitHub governance check failed for ${page}: ${response.status} ${await response.text()}`,
      );
    }

    const body = await response.json();
    if (!Array.isArray(body)) {
      throw new Error(`Expected GitHub list response for ${page}.`);
    }
    items.push(...body);
    page = nextGitHubPagePath(response.headers.get('link'));
  }

  return items;
}

async function optionalGithubJson(path) {
  const token = process.env.OMEGAX_GOVERNANCE_TOKEN ?? process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository) return null;

  const response = await fetch(
    `https://api.github.com/repos/${repository}${path}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (response.status === 403 || response.status === 404) {
    warn(
      `Skipping optional GitHub governance check for ${path}: ${response.status}.`,
    );
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `GitHub governance check failed for ${path}: ${response.status} ${await response.text()}`,
    );
  }
  return await response.json();
}

async function getEnvironmentReviewerTeamMembers(environment) {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    return { teamMembersBySlug: new Map(), teamMembersById: new Map() };
  }

  const [owner] = repository.split('/');
  const teamMembersBySlug = new Map();
  const teamMembersById = new Map();
  for (const team of getEnvironmentReviewerTeamReferences(environment)) {
    if (!team.slug) {
      continue;
    }
    const members = await optionalGithubApiPages(
      `/orgs/${encodeURIComponent(owner)}/teams/${encodeURIComponent(team.slug)}/members?per_page=100`,
    );
    if (!members) {
      continue;
    }
    teamMembersBySlug.set(team.slug.toLowerCase(), members);
    if (team.id) {
      teamMembersById.set(team.id, members);
    }
  }

  return { teamMembersBySlug, teamMembersById };
}

async function optionalOrganizationJson(path) {
  const token = process.env.OMEGAX_GOVERNANCE_TOKEN ?? process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository) return null;

  const [owner] = repository.split('/');
  if (!owner) return null;

  const response = await fetch(
    `https://api.github.com/orgs/${encodeURIComponent(owner)}${path}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (response.status === 403 || response.status === 404) {
    warn(
      `Skipping optional GitHub organization governance check for ${path}: ${response.status}.`,
    );
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `GitHub organization governance check failed for ${path}: ${response.status} ${await response.text()}`,
    );
  }
  return await response.json();
}

async function main() {
  const releaseWorkflow = readFileSync('.github/workflows/release.yml', 'utf8');
  for (const message of getReleaseWorkflowInvariantFailures(releaseWorkflow)) {
    fail(message);
  }

  if (
    !process.env.OMEGAX_GOVERNANCE_TOKEN &&
    !process.env.GITHUB_TOKEN &&
    process.env.OMEGAX_REQUIRE_GITHUB_GOVERNANCE === '1'
  ) {
    fail(
      'Live GitHub governance check requires OMEGAX_GOVERNANCE_TOKEN or GITHUB_TOKEN.',
    );
  }

  if (
    (!process.env.OMEGAX_GOVERNANCE_TOKEN && !process.env.GITHUB_TOKEN) ||
    !process.env.GITHUB_REPOSITORY
  ) {
    warn(
      'Skipping live GitHub branch/environment governance checks outside GitHub Actions.',
    );
    finish('Release governance static check passed.');
    return;
  }

  const branch = await githubJson('/branches/main/protection');
  for (const message of getBranchProtectionFailures(branch)) {
    fail(message);
  }

  const environment = await githubJson('/environments/npm-production');
  const teamMembers = await getEnvironmentReviewerTeamMembers(environment);
  for (const message of getEnvironmentProtectionFailures(environment, {
    ...teamMembers,
    excludedReviewerLogins: excludedReleaseReviewerLogins(),
  })) {
    fail(message);
  }

  const repositorySecrets = await optionalGithubJson('/actions/secrets');
  const organizationSecrets =
    await optionalOrganizationJson('/actions/secrets');
  const environmentSecrets = await optionalGithubJson(
    '/environments/npm-production/secrets',
  );
  const [owner] = process.env.GITHUB_REPOSITORY.split('/');
  const [collaborators, teams, repositoryInvitations, organizationInvitations] =
    await Promise.all([
      optionalGithubApiPages(
        `/repos/${process.env.GITHUB_REPOSITORY}/collaborators?affiliation=all&per_page=100`,
      ),
      optionalGithubApiPages(
        `/orgs/${encodeURIComponent(owner)}/teams?per_page=100`,
      ),
      optionalGithubApiPages(
        `/repos/${process.env.GITHUB_REPOSITORY}/invitations?per_page=100`,
      ),
      optionalGithubApiPages(
        `/orgs/${encodeURIComponent(owner)}/invitations?per_page=100`,
      ),
    ]);
  governanceEvidence = buildReleaseGovernanceEvidence({
    branch,
    environment,
    teamMembers,
    secretScopes: {
      repository: repositorySecrets,
      organization: organizationSecrets,
      environment: environmentSecrets,
    },
    reviewerInventory: {
      collaborators,
      teams,
      repositoryInvitations,
      organizationInvitations,
    },
  });
  for (const message of getReleaseSecretFailures({
    repository: repositorySecrets,
    organization: organizationSecrets,
    environment: environmentSecrets,
  })) {
    fail(message);
  }

  finish('Release governance check passed.', { liveChecked: true });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (jsonOutput) {
      console.log(
        JSON.stringify(
          buildReleaseGovernanceReport({
            repository: process.env.GITHUB_REPOSITORY ?? null,
            liveChecked: Boolean(
              process.env.GITHUB_REPOSITORY &&
              (process.env.OMEGAX_GOVERNANCE_TOKEN || process.env.GITHUB_TOKEN),
            ),
            failures: [...failures, message],
            warnings,
            evidence: governanceEvidence,
          }),
          null,
          2,
        ),
      );
    } else {
      console.error(message);
    }
    process.exitCode = 1;
  });
}
