#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const gitleaks = spawnSync(
  'gitleaks',
  ['detect', '--config=.gitleaks.toml', '--redact', '--no-banner'],
  {
    stdio: 'inherit',
  },
);
if (gitleaks.status === 0) {
  process.exit(0);
}
if (gitleaks.error && gitleaks.error.code !== 'ENOENT') {
  throw gitleaks.error;
}
if (!gitleaks.error && gitleaks.status !== 0) {
  process.exit(gitleaks.status ?? 1);
}

const skippedPaths = new Set([
  '.gitleaks.toml',
  'package-lock.json',
  'scripts/check-secrets.mjs',
]);

const binaryExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.pdf',
  '.zip',
  '.gz',
  '.tgz',
]);

const patterns = [
  {
    label: 'npm token',
    regex: /\b(?:NODE_AUTH_TOKEN|NPM_TOKEN)\s*=\s*npm_[A-Za-z0-9]{20,}/,
  },
  {
    label: 'PostHog personal API token',
    regex: /\bphx_[A-Za-z0-9_]{20,}\b/,
  },
  {
    label: 'Oracle signer secret',
    regex:
      /\b(?:ORACLE_SIGNER_SECRET_KEY_BASE58|OMEGAX_[A-Z0-9_]*SECRET[A-Z0-9_]*)\s*=\s*[1-9A-HJ-NP-Za-km-z]{64,}/,
  },
  {
    label: 'private key block',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/,
  },
];

const result = spawnSync('git', ['ls-files', '-z'], {
  encoding: 'buffer',
});
if (result.status !== 0) {
  console.error(result.stderr.toString('utf8') || 'git ls-files failed');
  process.exit(result.status ?? 1);
}

const paths = result.stdout
  .toString('utf8')
  .split('\0')
  .filter(Boolean)
  .filter((path) => !skippedPaths.has(path));

const findings = [];
for (const path of paths) {
  const lowerPath = path.toLowerCase();
  if (
    [...binaryExtensions].some((extension) => lowerPath.endsWith(extension))
  ) {
    continue;
  }
  const stat = statSync(path);
  if (stat.size > 1_000_000) continue;

  const content = readFileSync(path, 'utf8');
  for (const pattern of patterns) {
    const match = content.match(pattern.regex);
    if (match) {
      findings.push(`${path}: ${pattern.label}`);
    }
  }
}

if (findings.length > 0) {
  console.error('Secret scan failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Secret scan passed.');
