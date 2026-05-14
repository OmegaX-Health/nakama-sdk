#!/usr/bin/env node

import { readFileSync } from 'node:fs';

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`Warning: ${message}`);
}

function requireWorkflowInvariant(workflow, pattern, message) {
  const matches =
    typeof pattern === 'string'
      ? workflow.includes(pattern)
      : pattern.test(workflow);
  if (!matches) {
    fail(message);
  }
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

async function main() {
  const releaseWorkflow = readFileSync('.github/workflows/release.yml', 'utf8');
  if (releaseWorkflow.includes('NODE_AUTH_TOKEN')) {
    fail('Release workflow must not publish with NODE_AUTH_TOKEN.');
  }
  if (releaseWorkflow.includes('NPM_TOKEN')) {
    fail('Release workflow must not reference NPM_TOKEN.');
  }
  if (releaseWorkflow.includes('ALLOW_UNSIGNED_RELEASE_TAG')) {
    fail('Release workflow must not bypass signed release tag verification.');
  }
  requireWorkflowInvariant(
    releaseWorkflow,
    /name:\s+Release/u,
    'Release workflow must be named Release.',
  );
  requireWorkflowInvariant(
    releaseWorkflow,
    /push:\s*\n\s+tags:\s*\n\s+- ['"]v\*['"]/u,
    'Release workflow must run only from v* tag pushes.',
  );
  requireWorkflowInvariant(
    releaseWorkflow,
    /Release governance[\s\S]*GITHUB_TOKEN:\s*\$\{\{\s*secrets\.OMEGAX_GOVERNANCE_READ_TOKEN\s*\}\}[\s\S]*OMEGAX_REQUIRE_GITHUB_GOVERNANCE:\s*['"]1['"][\s\S]*run:\s+npm run security:release-governance/u,
    'Release workflow verify job must run live release governance with OMEGAX_GOVERNANCE_READ_TOKEN.',
  );
  requireWorkflowInvariant(
    releaseWorkflow,
    /publish:\s*\n\s+runs-on:[\s\S]*needs:\s+verify[\s\S]*environment:\s+npm-production/u,
    'Release workflow publish job must depend on verify and use the npm-production environment.',
  );
  requireWorkflowInvariant(
    releaseWorkflow,
    /publish:[\s\S]*permissions:\s*\n\s+contents:\s+read\s*\n\s+id-token:\s+write/u,
    'Release workflow publish job must request OIDC id-token: write permission.',
  );
  requireWorkflowInvariant(
    releaseWorkflow,
    /Install dependencies without lifecycle scripts[\s\S]*run:\s+npm ci --ignore-scripts/u,
    'Release workflow publish job must install dependencies without lifecycle scripts.',
  );
  requireWorkflowInvariant(
    releaseWorkflow,
    /Validate release tag and npm availability[\s\S]*npm run security:release-tag/u,
    'Release workflow publish job must verify the release tag before publishing.',
  );
  requireWorkflowInvariant(
    releaseWorkflow,
    /Publish to npm[\s\S]*npm publish --ignore-scripts --access public --provenance/u,
    'Release workflow must publish with ignore-scripts, public access, and provenance.',
  );

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
  const statusChecks = branch?.required_status_checks;
  const requiredStatusCheckCount =
    (statusChecks?.contexts ?? []).length + (statusChecks?.checks ?? []).length;
  if (!statusChecks || statusChecks.strict !== true) {
    fail('main branch protection must require strict status checks.');
  }
  if (requiredStatusCheckCount < 1) {
    fail('main branch protection must require at least one status check.');
  }
  if (branch?.allow_force_pushes?.enabled !== false) {
    fail('main branch protection must not allow force pushes.');
  }
  if (branch?.allow_deletions?.enabled !== false) {
    fail('main branch protection must not allow branch deletion.');
  }
  const prReviews = branch?.required_pull_request_reviews;
  const requiredReviews = Number(
    prReviews?.required_approving_review_count ?? 0,
  );
  if (requiredReviews < 1) {
    fail(
      'main branch protection must require at least one approving PR review.',
    );
  }
  if (!prReviews?.require_code_owner_reviews) {
    fail('main branch protection must require CODEOWNERS review.');
  }

  const environment = await githubJson('/environments/npm-production');
  const reviewerRule = (environment?.protection_rules ?? []).find(
    (rule) => rule.type === 'required_reviewers',
  );
  const reviewers = reviewerRule?.reviewers ?? [];
  if (!reviewerRule) {
    fail('npm-production environment must require reviewers.');
  } else {
    if (reviewers.length < 2) {
      fail('npm-production environment must require at least two reviewers.');
    }
    if (reviewerRule.prevent_self_review !== true) {
      fail('npm-production environment must prevent self-review.');
    }
  }

  const repositorySecrets = await optionalGithubJson('/actions/secrets');
  const repositorySecretNames = new Set(
    (repositorySecrets?.secrets ?? []).map((secret) => secret.name),
  );
  if (
    repositorySecrets &&
    !repositorySecretNames.has('OMEGAX_GOVERNANCE_READ_TOKEN')
  ) {
    fail(
      'Repository Actions secrets must include OMEGAX_GOVERNANCE_READ_TOKEN for the unprotected release verify job.',
    );
  }

  const stalePublishSecrets = ['NPM_TOKEN', 'NODE_AUTH_TOKEN'];
  const secretScopes = [
    {
      label: 'Repository Actions',
      response: repositorySecrets,
    },
    {
      label: 'npm-production environment',
      response: await optionalGithubJson(
        '/environments/npm-production/secrets',
      ),
    },
  ];
  for (const { label, response } of secretScopes) {
    const secretNames = new Set(
      (response?.secrets ?? []).map((secret) => secret.name),
    );
    for (const staleSecret of stalePublishSecrets) {
      if (!secretNames.has(staleSecret)) continue;
      fail(
        `${label} secrets must not include stale npm publish token ${staleSecret}; trusted publishing should use OIDC.`,
      );
    }
  }

  if (process.exitCode) process.exit(process.exitCode);
  console.log('Release governance check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
