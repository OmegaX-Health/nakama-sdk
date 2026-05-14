#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

const repository = process.env.GITHUB_REPOSITORY ?? 'OmegaX-Health/omegax-sdk';
const token = process.env.OMEGAX_GOVERNANCE_TOKEN ?? process.env.GITHUB_TOKEN;
const branch = process.env.OMEGAX_RELEASE_BRANCH ?? 'main';
const environmentName =
  process.env.OMEGAX_RELEASE_ENVIRONMENT ?? 'npm-production';
const apply = process.argv.includes('--apply');
const excludedReviewerLogins = new Set(
  parseCsv(process.env.OMEGAX_RELEASE_EXCLUDED_REVIEWERS)
    .map((login) => login.toLowerCase())
    .filter(Boolean),
);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function parseCsv(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function assertRepository(value) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(value)) {
    throw new Error(`Invalid GITHUB_REPOSITORY value: ${value}`);
  }
}

async function githubResponse(path, options = {}) {
  if (!token) {
    throw new Error(
      'Missing GitHub token. Set GITHUB_TOKEN or OMEGAX_GOVERNANCE_TOKEN.',
    );
  }

  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `${options.method ?? 'GET'} ${path} failed: ${response.status} ${text}`,
    );
  }

  return response;
}

async function github(path, options = {}) {
  const response = await githubResponse(path, options);
  if (response.status === 204) return null;
  return await response.json();
}

export function nextGitHubPagePath(linkHeader) {
  for (const part of String(linkHeader ?? '').split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/u);
    if (!match) continue;

    const url = new URL(match[1]);
    return `${url.pathname}${url.search}`;
  }

  return null;
}

async function githubPages(path) {
  const items = [];
  let page = path;

  while (page) {
    const response = await githubResponse(page);
    const body = await response.json();
    if (!Array.isArray(body)) {
      throw new Error(`Expected GitHub list response for ${page}.`);
    }
    items.push(...body);
    page = nextGitHubPagePath(response.headers.get('link'));
  }

  return items;
}

export function eligibleTeamReviewerMembers(
  members,
  excludedLogins = new Set(),
) {
  return (members ?? [])
    .map((member) => String(member?.login ?? '').trim())
    .filter(Boolean)
    .filter((login) => !excludedLogins.has(login.toLowerCase()));
}

export function eligibleHumanReviewerLogins(reviewers) {
  const logins = new Set();

  for (const reviewer of reviewers ?? []) {
    if (reviewer?.type === 'User' && reviewer.login) {
      logins.add(String(reviewer.login).toLowerCase());
    }

    if (reviewer?.type === 'Team') {
      for (const login of reviewer.eligibleMemberLogins ?? []) {
        logins.add(String(login).toLowerCase());
      }
    }
  }

  return [...logins].sort();
}

async function resolveUserReviewer(login) {
  const user = await github(`/users/${encodeURIComponent(login)}`);
  if (excludedReviewerLogins.has(String(user.login).toLowerCase())) {
    throw new Error(
      `Release reviewer ${user.login} is excluded from the independent reviewer set.`,
    );
  }
  const permission = await github(
    `/repos/${repository}/collaborators/${encodeURIComponent(user.login)}/permission`,
  );
  const permissionName = String(permission?.permission ?? '').toLowerCase();
  if (!['admin', 'maintain', 'write'].includes(permissionName)) {
    throw new Error(
      `Release reviewer ${user.login} must have write, maintain, or admin access to ${repository}; found ${permissionName || 'none'}.`,
    );
  }
  return {
    type: 'User',
    id: user.id,
    login: user.login,
    permission: permissionName,
  };
}

async function resolveTeamReviewer(org, slug) {
  const team = await github(
    `/orgs/${encodeURIComponent(org)}/teams/${encodeURIComponent(slug)}`,
  );
  const repo = await github(
    `/orgs/${encodeURIComponent(org)}/teams/${encodeURIComponent(team.slug)}/repos/${repository}`,
  );
  const permissionName = String(
    repo?.permissions?.admin
      ? 'admin'
      : repo?.permissions?.maintain
        ? 'maintain'
        : repo?.permissions?.push
          ? 'write'
          : '',
  ).toLowerCase();
  if (!permissionName) {
    throw new Error(
      `Release reviewer team ${team.slug} must have write, maintain, or admin access to ${repository}.`,
    );
  }
  const members = await githubPages(
    `/orgs/${encodeURIComponent(org)}/teams/${encodeURIComponent(team.slug)}/members?per_page=100`,
  );
  const eligibleMemberLogins = eligibleTeamReviewerMembers(
    members,
    excludedReviewerLogins,
  );
  if (eligibleMemberLogins.length === 0) {
    throw new Error(
      `Release reviewer team ${team.slug} must have at least one visible non-excluded member; empty teams or teams made only of code-owner aliases cannot satisfy release governance.`,
    );
  }
  return {
    type: 'Team',
    id: team.id,
    slug: team.slug,
    permission: permissionName,
    eligibleMemberLogins,
  };
}

async function currentBranchProtection() {
  return await github(
    `/repos/${repository}/branches/${encodeURIComponent(branch)}/protection`,
  );
}

async function currentEnvironment() {
  return await github(
    `/repos/${repository}/environments/${encodeURIComponent(environmentName)}`,
  );
}

export function requiredIdentifiers(items, label, selectIdentifier) {
  return (items ?? []).map((item) => {
    const identifier = selectIdentifier(item);
    if (!identifier) {
      throw new Error(
        `Cannot preserve existing ${label}; GitHub response is missing a required identifier.`,
      );
    }
    return identifier;
  });
}

export function restrictionPayload(restrictions, label) {
  if (!restrictions) return null;

  return {
    users: requiredIdentifiers(
      restrictions.users,
      `${label} user restrictions`,
      (user) => user.login,
    ),
    teams: requiredIdentifiers(
      restrictions.teams,
      `${label} team restrictions`,
      (team) => team.slug,
    ),
    apps: requiredIdentifiers(
      restrictions.apps,
      `${label} app restrictions`,
      (app) => app.slug,
    ),
  };
}

export function requiredStatusChecksBody(existing) {
  const statusChecks = existing?.required_status_checks;
  const contexts = (statusChecks?.contexts ?? []).filter(Boolean);
  const checks = (statusChecks?.checks ?? [])
    .map((check) => {
      if (!check?.context) return null;
      const normalized = { context: check.context };
      if (Number.isInteger(check.app_id)) {
        normalized.app_id = check.app_id;
      }
      return normalized;
    })
    .filter(Boolean);
  const checkContexts = checks.map((check) => check.context).filter(Boolean);
  const requiredContexts =
    contexts.length > 0
      ? contexts
      : checkContexts.length > 0
        ? checkContexts
        : ['test'];

  return {
    strict: statusChecks?.strict ?? true,
    contexts: requiredContexts,
    ...(checks.length > 0 ? { checks } : {}),
  };
}

export function pullRequestReviewsBody(existing) {
  const reviews = existing?.required_pull_request_reviews;
  const body = {
    dismiss_stale_reviews: reviews?.dismiss_stale_reviews ?? true,
    require_code_owner_reviews: true,
    required_approving_review_count: Math.max(
      1,
      Number(reviews?.required_approving_review_count ?? 0),
    ),
  };

  if (typeof reviews?.require_last_push_approval === 'boolean') {
    body.require_last_push_approval = reviews.require_last_push_approval;
  }
  if (reviews?.dismissal_restrictions) {
    body.dismissal_restrictions = restrictionPayload(
      reviews.dismissal_restrictions,
      'pull-request dismissal',
    );
  }
  if (reviews?.bypass_pull_request_allowances) {
    body.bypass_pull_request_allowances = restrictionPayload(
      reviews.bypass_pull_request_allowances,
      'pull-request bypass',
    );
  }

  return body;
}

export function deploymentBranchPolicyBody(environment) {
  const policy = environment?.deployment_branch_policy;
  if (!policy) return null;

  return {
    protected_branches: Boolean(policy.protected_branches),
    custom_branch_policies: Boolean(policy.custom_branch_policies),
  };
}

function branchProtectionFlag(existing, name) {
  if (typeof existing?.[name]?.enabled === 'boolean') {
    return existing[name].enabled;
  }
  return undefined;
}

export function branchProtectionBody(existing) {
  const body = {
    required_status_checks: requiredStatusChecksBody(existing),
    enforce_admins: true,
    required_pull_request_reviews: pullRequestReviewsBody(existing),
    restrictions: restrictionPayload(existing?.restrictions, 'branch push'),
  };

  for (const name of [
    'required_linear_history',
    'allow_force_pushes',
    'allow_deletions',
    'block_creations',
    'required_conversation_resolution',
    'lock_branch',
    'allow_fork_syncing',
  ]) {
    const value = branchProtectionFlag(existing, name);
    if (typeof value === 'boolean') {
      body[name] = value;
    }
  }

  return body;
}

export function reviewerKey(reviewer) {
  return `${reviewer.type}:${reviewer.id}`;
}

function reviewerLabel(reviewer) {
  return reviewer.type === 'Team'
    ? `team:${reviewer.slug}:${reviewer.permission}:${reviewer.eligibleMemberLogins.length}-visible-member${reviewer.eligibleMemberLogins.length === 1 ? '' : 's'}`
    : `user:${reviewer.login}:${reviewer.permission}`;
}

async function main() {
  assertRepository(repository);

  const [org] = repository.split('/');
  const reviewerLogins = parseCsv(process.env.OMEGAX_RELEASE_REVIEWERS);
  const reviewerTeams = parseCsv(process.env.OMEGAX_RELEASE_REVIEWER_TEAMS);

  if (reviewerLogins.length + reviewerTeams.length < 2) {
    fail(
      'Set at least two distinct release reviewers via OMEGAX_RELEASE_REVIEWERS=login1,login2 or OMEGAX_RELEASE_REVIEWER_TEAMS=team-slug.',
    );
    return;
  }

  const [branchProtection, environment, userReviewers, teamReviewers] =
    await Promise.all([
      currentBranchProtection(),
      currentEnvironment(),
      Promise.all(reviewerLogins.map(resolveUserReviewer)),
      Promise.all(reviewerTeams.map((slug) => resolveTeamReviewer(org, slug))),
    ]);
  const reviewers = [...userReviewers, ...teamReviewers];
  const distinctReviewerKeys = new Set(reviewers.map(reviewerKey));
  const distinctHumanReviewerLogins = eligibleHumanReviewerLogins(reviewers);

  if (distinctReviewerKeys.size < 2) {
    fail(
      'Set at least two distinct release reviewers; duplicate reviewer entries do not satisfy the release-governance requirement.',
    );
    return;
  }
  if (distinctHumanReviewerLogins.length < 2) {
    fail(
      'Set at least two distinct eligible human release reviewers; a team that only contains an already-listed reviewer does not satisfy independent release governance.',
    );
    return;
  }

  const branchBody = branchProtectionBody(branchProtection);
  const environmentBody = {
    wait_timer: Number(environment?.wait_timer ?? 0),
    prevent_self_review: true,
    reviewers: reviewers.map((reviewer) => ({
      type: reviewer.type,
      id: reviewer.id,
    })),
    deployment_branch_policy: deploymentBranchPolicyBody(environment),
  };

  const summary = {
    repository,
    branch,
    environment: environmentName,
    apply,
    reviewers: reviewers.map(reviewerLabel),
    eligibleHumanReviewers: distinctHumanReviewerLogins,
    branchProtection: branchBody,
    environmentProtection: environmentBody,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!apply) {
    console.log(
      'Dry run only. Re-run with --apply after reviewing the planned GitHub settings.',
    );
    return;
  }

  await github(
    `/repos/${repository}/branches/${encodeURIComponent(branch)}/protection`,
    {
      method: 'PUT',
      body: JSON.stringify(branchBody),
    },
  );
  await github(
    `/repos/${repository}/environments/${encodeURIComponent(environmentName)}`,
    {
      method: 'PUT',
      body: JSON.stringify(environmentBody),
    },
  );

  console.log('GitHub release governance settings updated.');
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
