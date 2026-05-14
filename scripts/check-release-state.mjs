#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const DEFAULT_RELEASE_REPOSITORY = 'OmegaX-Health/omegax-sdk';
export const DEFAULT_COMMAND_TIMEOUT_MS = 15_000;

function commandTimeoutMs() {
  const configured = Number(process.env.OMEGAX_RELEASE_STATE_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_COMMAND_TIMEOUT_MS;
}

function run(command, args) {
  const timeout = commandTimeoutMs();
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout,
  });
  const error =
    result.error?.code === 'ETIMEDOUT'
      ? `${command} ${args.join(' ')} timed out after ${timeout}ms`
      : result.error?.message;

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: String(result.stdout ?? '').trim(),
    stderr: String(result.stderr ?? '').trim(),
    error,
  };
}

function parseJsonOutput(result, fallback) {
  if (!result.ok || !result.stdout) return fallback;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return fallback;
  }
}

function readPackageState() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  return {
    packageName: String(pkg.name),
    packageVersion: String(pkg.version),
  };
}

function readNpmState(packageName) {
  const latestResult = run('npm', ['view', packageName, 'version', '--json']);
  const distTagsResult = run('npm', [
    'view',
    packageName,
    'dist-tags',
    '--json',
  ]);
  const versionsResult = run('npm', [
    'view',
    packageName,
    'versions',
    '--json',
  ]);
  const latest = parseJsonOutput(latestResult, null);
  const distTags = parseJsonOutput(distTagsResult, {});
  const versions = parseJsonOutput(versionsResult, []);
  const errors = [latestResult, distTagsResult, versionsResult]
    .filter((result) => !result.ok)
    .map(
      (result) =>
        result.stderr || result.error || `npm view exited ${result.status}`,
    );

  return {
    latest: typeof latest === 'string' ? latest : null,
    distTags: distTags && typeof distTags === 'object' ? distTags : {},
    versions: Array.isArray(versions) ? versions.map(String) : [],
    errors,
  };
}

function readGitState(tagName) {
  const branch = run('git', ['branch', '--show-current']).stdout || null;
  const upstreamResult = run('git', [
    'rev-parse',
    '--abbrev-ref',
    '--symbolic-full-name',
    '@{upstream}',
  ]);
  const upstream = upstreamResult.ok ? upstreamResult.stdout : null;
  const aheadBehind =
    upstream &&
    run('git', ['rev-list', '--left-right', '--count', `${upstream}...HEAD`]);
  const [behindText, aheadText] =
    aheadBehind && aheadBehind.ok ? aheadBehind.stdout.split(/\s+/u) : [];

  const remoteTagRefs = run('git', [
    'ls-remote',
    '--tags',
    'origin',
    `refs/tags/${tagName}`,
  ]);

  return {
    branch,
    upstream,
    ahead: Number(aheadText ?? 0),
    behind: Number(behindText ?? 0),
    remoteTagRefs: remoteTagRefs.ok
      ? remoteTagRefs.stdout.split('\n').filter(Boolean)
      : [],
    remoteTagError: remoteTagRefs.ok
      ? null
      : remoteTagRefs.stderr || remoteTagRefs.error || 'git ls-remote failed',
  };
}

function readGitHubReleases(repository) {
  const result = run('gh', [
    'release',
    'list',
    '--repo',
    repository,
    '--limit',
    '10',
    '--json',
    'tagName,name,publishedAt,isLatest',
  ]);
  const releases = parseJsonOutput(result, null);
  if (Array.isArray(releases)) return { releases, error: null };

  const fallback = run('gh', [
    'release',
    'list',
    '--repo',
    repository,
    '--limit',
    '10',
    '--json',
    'tagName,name,publishedAt',
  ]);
  const fallbackReleases = parseJsonOutput(fallback, null);
  if (Array.isArray(fallbackReleases)) {
    return { releases: fallbackReleases, error: null };
  }

  return {
    releases: [],
    error: result.stderr || result.error || fallback.stderr || fallback.error,
  };
}

function addFinding(findings, severity, code, message) {
  findings.push({ severity, code, message });
}

export function classifyReleaseState(input) {
  const packageName = String(input.packageName);
  const packageVersion = String(input.packageVersion);
  const tagName = `v${packageVersion}`;
  const npmVersions = (input.npm?.versions ?? []).map(String);
  const npmLatest = input.npm?.latest ?? input.npm?.distTags?.latest ?? null;
  const npmVersionPublished = npmVersions.includes(packageVersion);
  const remoteTagExists = (input.git?.remoteTagRefs ?? []).some((line) =>
    line.includes(`refs/tags/${tagName}`),
  );
  const githubRelease = (input.github?.releases ?? []).find(
    (release) => release?.tagName === tagName,
  );
  const latestGitHubRelease =
    (input.github?.releases ?? []).find((release) => release?.isLatest) ??
    input.github?.releases?.[0] ??
    null;
  const ahead = Number(input.git?.ahead ?? 0);
  const behind = Number(input.git?.behind ?? 0);
  const upstream = input.git?.upstream ?? null;
  const gitSynced = Boolean(upstream) && ahead === 0 && behind === 0;
  const npmUnavailable = (input.npm?.errors ?? []).length > 0;
  const remoteTagUnavailable = Boolean(input.git?.remoteTagError);
  const githubUnavailable = Boolean(input.github?.error);
  const findings = [];

  if (!upstream) {
    addFinding(
      findings,
      'blocker',
      'git-upstream-missing',
      'Local branch has no upstream; origin sync state cannot be verified.',
    );
  }
  if (behind > 0) {
    addFinding(
      findings,
      'blocker',
      'git-behind-upstream',
      `Local branch is behind ${upstream ?? 'upstream'} by ${behind} commit${behind === 1 ? '' : 's'}.`,
    );
  }
  if (ahead > 0) {
    addFinding(
      findings,
      'blocker',
      'git-ahead-upstream',
      `Local branch is ahead of ${upstream ?? 'upstream'} by ${ahead} commit${ahead === 1 ? '' : 's'}; push is required before public release completion.`,
    );
  }
  for (const error of input.npm?.errors ?? []) {
    addFinding(
      findings,
      'warning',
      'npm-registry-unavailable',
      `Unable to inspect npm registry state: ${error}`,
    );
  }
  if (!npmVersionPublished && !npmUnavailable) {
    addFinding(
      findings,
      'info',
      'npm-version-unpublished',
      `${packageName}@${packageVersion} is not published on npm yet.`,
    );
  }
  if (npmVersionPublished && npmLatest !== packageVersion) {
    addFinding(
      findings,
      'warning',
      'npm-latest-drift',
      `${packageName}@${packageVersion} exists on npm but latest is ${npmLatest ?? 'unknown'}.`,
    );
  }
  if (!remoteTagExists && !remoteTagUnavailable) {
    addFinding(
      findings,
      'info',
      'remote-tag-missing',
      `Remote release tag ${tagName} is not present on origin.`,
    );
  }
  if (remoteTagExists && !npmVersionPublished) {
    addFinding(
      findings,
      'warning',
      'tag-without-npm-version',
      `Remote tag ${tagName} exists but ${packageName}@${packageVersion} is not published on npm.`,
    );
  }
  if (!githubRelease && !githubUnavailable) {
    addFinding(
      findings,
      'info',
      'github-release-missing',
      `GitHub release ${tagName} is not present.`,
    );
  }
  if (githubRelease && !npmVersionPublished) {
    addFinding(
      findings,
      'warning',
      'github-release-without-npm-version',
      `GitHub release ${tagName} exists but ${packageName}@${packageVersion} is not published on npm.`,
    );
  }
  if (githubUnavailable) {
    addFinding(
      findings,
      'warning',
      'github-release-list-unavailable',
      `Unable to inspect GitHub releases: ${input.github.error}`,
    );
  }
  if (remoteTagUnavailable) {
    addFinding(
      findings,
      'warning',
      'remote-tag-list-unavailable',
      `Unable to inspect remote release tags: ${input.git.remoteTagError}`,
    );
  }

  return {
    packageName,
    packageVersion,
    tagName,
    git: {
      branch: input.git?.branch ?? null,
      upstream,
      ahead,
      behind,
      synced: gitSynced,
      remoteTagAvailable: !remoteTagUnavailable,
      remoteTagExists,
    },
    npm: {
      latest: npmLatest,
      distTags: input.npm?.distTags ?? {},
      registryAvailable: !npmUnavailable,
      versionPublished: npmVersionPublished,
    },
    github: {
      releasesAvailable: !githubUnavailable,
      releaseExists: Boolean(githubRelease),
      release: githubRelease ?? null,
      latestRelease: latestGitHubRelease,
    },
    findings,
  };
}

function formatFinding({ severity, code, message }) {
  return `- ${severity.toUpperCase()} ${code}: ${message}`;
}

export function formatReleaseStateReport(state) {
  const npmState = state.npm.registryAvailable
    ? `latest ${state.npm.latest ?? 'unknown'}; ${state.npm.versionPublished ? 'local version published' : 'local version unpublished'}`
    : 'registry unavailable';
  const tagState = state.git.remoteTagAvailable
    ? `${state.tagName} ${state.git.remoteTagExists ? 'present on origin' : 'missing on origin'}`
    : `${state.tagName} unknown; remote tag list unavailable`;
  const githubReleaseState = state.github.releasesAvailable
    ? `${state.github.releaseExists ? 'present' : 'missing'}${state.github.latestRelease?.tagName ? `; latest visible ${state.github.latestRelease.tagName}` : ''}`
    : 'unknown; release list unavailable';
  const lines = [
    'OmegaX SDK release state',
    `- package: ${state.packageName}@${state.packageVersion}`,
    `- git: ${state.git.branch ?? 'unknown'} ${state.git.synced ? 'synced with' : `ahead ${state.git.ahead}, behind ${state.git.behind} vs`} ${state.git.upstream ?? 'upstream unknown'}`,
    `- npm: ${npmState}`,
    `- tag: ${tagState}`,
    `- GitHub release: ${githubReleaseState}`,
  ];

  if (state.findings.length === 0) {
    lines.push('Findings: none.');
  } else {
    lines.push('Findings:');
    lines.push(...state.findings.map(formatFinding));
  }

  return lines.join('\n');
}

function readReleaseState() {
  const packageState = readPackageState();
  const tagName = `v${packageState.packageVersion}`;
  const repository =
    process.env.GITHUB_REPOSITORY?.trim() || DEFAULT_RELEASE_REPOSITORY;

  return classifyReleaseState({
    ...packageState,
    npm: readNpmState(packageState.packageName),
    git: readGitState(tagName),
    github: readGitHubReleases(repository),
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const json = process.argv.includes('--json');
  const failOnBlockers = process.argv.includes('--fail-on-blockers');
  const state = readReleaseState();

  console.log(
    json ? JSON.stringify(state, null, 2) : formatReleaseStateReport(state),
  );

  if (
    failOnBlockers &&
    state.findings.some((finding) => finding.severity === 'blocker')
  ) {
    process.exitCode = 1;
  }
}
