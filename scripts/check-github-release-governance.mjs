#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`Warning: ${message}`);
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

export function getEnvironmentProtectionFailures(environment) {
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

async function githubJson(path) {
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

  if (!response.ok) {
    throw new Error(
      `GitHub governance check failed for ${path}: ${response.status} ${await response.text()}`,
    );
  }
  return await response.json();
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
    if (process.exitCode) process.exit(process.exitCode);
    console.log('Release governance static check passed.');
    return;
  }

  const branch = await githubJson('/branches/main/protection');
  for (const message of getBranchProtectionFailures(branch)) {
    fail(message);
  }

  const environment = await githubJson('/environments/npm-production');
  for (const message of getEnvironmentProtectionFailures(environment)) {
    fail(message);
  }

  const repositorySecrets = await optionalGithubJson('/actions/secrets');
  const organizationSecrets =
    await optionalOrganizationJson('/actions/secrets');
  const environmentSecrets = await optionalGithubJson(
    '/environments/npm-production/secrets',
  );
  for (const message of getReleaseSecretFailures({
    repository: repositorySecrets,
    organization: organizationSecrets,
    environment: environmentSecrets,
  })) {
    fail(message);
  }

  if (process.exitCode) process.exit(process.exitCode);
  console.log('Release governance check passed.');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
