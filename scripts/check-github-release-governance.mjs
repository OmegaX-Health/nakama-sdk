#!/usr/bin/env node

import { readFileSync } from 'node:fs';

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`Warning: ${message}`);
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

  if (process.exitCode) process.exit(process.exitCode);
  console.log('Release governance check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
