#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    ...options,
  });
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const tagName = String(
  process.env.TAG_NAME ?? process.env.GITHUB_REF_NAME ?? '',
).trim();

if (!tagName || !tagName.startsWith('v')) {
  console.error('Release tag must be provided as TAG_NAME or GITHUB_REF_NAME.');
  process.exit(1);
}

const tagVersion = tagName.replace(/^v/, '');
if (tagVersion !== pkg.version) {
  console.error(
    `Tag ${tagName} does not match package.json version ${pkg.version}.`,
  );
  process.exit(1);
}

const tagObject = run('git', ['cat-file', '-t', tagName]);
if (tagObject.status !== 0) {
  console.error(tagObject.stderr || `Unable to inspect tag ${tagName}.`);
  process.exit(tagObject.status ?? 1);
}
if (tagObject.stdout.trim() !== 'tag') {
  console.error(`Release tag ${tagName} must be an annotated tag object.`);
  process.exit(1);
}

const tagVerify = run('git', ['tag', '-v', tagName]);
if (tagVerify.status !== 0 && process.env.ALLOW_UNSIGNED_RELEASE_TAG !== '1') {
  console.error(
    `Release tag ${tagName} must be signed, or ALLOW_UNSIGNED_RELEASE_TAG=1 must be set for an explicitly approved exception.`,
  );
  process.exit(tagVerify.status ?? 1);
}

const npmView = run('npm', ['view', `${pkg.name}@${pkg.version}`, 'version']);
if (npmView.status === 0 && npmView.stdout.trim() === pkg.version) {
  console.error(`${pkg.name}@${pkg.version} already exists on npm.`);
  process.exit(1);
}

console.log(`Release tag ${tagName} passed local checks.`);
