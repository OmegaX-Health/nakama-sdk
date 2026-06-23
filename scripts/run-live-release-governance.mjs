#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_RELEASE_REPOSITORY = 'OmegaX-Health/nakama-sdk';

export function needsGitHubToken(env) {
  return !env.OMEGAX_GOVERNANCE_TOKEN && !env.GITHUB_TOKEN;
}

export function buildLiveReleaseGovernanceEnv(env, token) {
  const nextEnv = {
    ...env,
    GITHUB_REPOSITORY:
      env.GITHUB_REPOSITORY?.trim() || DEFAULT_RELEASE_REPOSITORY,
    OMEGAX_REQUIRE_GITHUB_GOVERNANCE:
      env.OMEGAX_REQUIRE_GITHUB_GOVERNANCE?.trim() || '1',
  };

  if (token && needsGitHubToken(env)) {
    nextEnv.GITHUB_TOKEN = token;
  }

  return nextEnv;
}

export function readGhAuthToken(spawn = spawnSync) {
  const result = spawn('gh', ['auth', 'token'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error || result.status !== 0) return null;

  const token = String(result.stdout ?? '').trim();
  return token || null;
}

export function buildLiveReleaseGovernanceArgs(checkerPath, args = []) {
  return [checkerPath, ...args];
}

function releaseGovernanceCheckerPath() {
  return join(
    dirname(fileURLToPath(import.meta.url)),
    'check-github-release-governance.mjs',
  );
}

export function runLiveReleaseGovernance({
  env = process.env,
  args = process.argv.slice(2),
  spawn = spawnSync,
  checkerPath = releaseGovernanceCheckerPath(),
} = {}) {
  const token = needsGitHubToken(env) ? readGhAuthToken(spawn) : null;
  if (needsGitHubToken(env) && !token) {
    console.error(
      'Live GitHub governance check needs OMEGAX_GOVERNANCE_TOKEN, GITHUB_TOKEN, or an authenticated `gh` CLI session.',
    );
  }

  const result = spawn(
    process.execPath,
    buildLiveReleaseGovernanceArgs(checkerPath, args),
    {
      env: buildLiveReleaseGovernanceEnv(env, token),
      stdio: 'inherit',
    },
  );

  if (result.error) {
    console.error(
      `Failed to run live GitHub governance check: ${result.error.message}`,
    );
    return 1;
  }

  return typeof result.status === 'number' ? result.status : 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = runLiveReleaseGovernance();
}
