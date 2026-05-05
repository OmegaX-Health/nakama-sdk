#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const severityRank = new Map([
  ['info', 0],
  ['low', 1],
  ['moderate', 2],
  ['high', 3],
  ['critical', 4],
]);
const minimumSeverity = severityRank.get('moderate');
const allowedAdvisories = new Map();

const audit = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
});

if (audit.error) {
  process.stderr.write(`Unable to run npm audit: ${audit.error.message}\n`);
  process.exit(1);
}

if (!audit.stdout) {
  process.stderr.write(audit.stderr || 'npm audit did not return JSON output.');
  process.exit(audit.status || 1);
}

let report;
try {
  report = JSON.parse(audit.stdout);
} catch (error) {
  process.stderr.write(`Unable to parse npm audit output: ${error}\n`);
  process.stderr.write(audit.stdout);
  process.exit(1);
}

if (report.error) {
  process.stderr.write('npm audit returned an error response:\n');
  process.stderr.write(`${JSON.stringify(report.error, null, 2)}\n`);
  process.exit(1);
}

if (
  !report.vulnerabilities ||
  typeof report.vulnerabilities !== 'object' ||
  Array.isArray(report.vulnerabilities)
) {
  process.stderr.write(
    'npm audit report is missing a valid vulnerabilities object.\n',
  );
  process.stderr.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities;
if (audit.status !== 0 && Object.keys(vulnerabilities).length === 0) {
  process.stderr.write(audit.stderr || '');
  process.stderr.write(
    `npm audit exited with status ${audit.status} without reporting vulnerabilities.\n`,
  );
  process.stderr.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(audit.status || 1);
}

const allowedCache = new Map();

function advisoryId(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (entry.source !== undefined) return String(entry.source);
  if (typeof entry.url === 'string') return entry.url.split('/').pop() ?? null;
  return null;
}

function isAllowedVulnerability(name, stack = new Set()) {
  if (allowedCache.has(name)) return allowedCache.get(name);
  if (stack.has(name)) return false;

  const vulnerability = vulnerabilities[name];
  if (!vulnerability) return false;

  const via = Array.isArray(vulnerability.via) ? vulnerability.via : [];
  if (via.length === 0) return false;

  const nextStack = new Set(stack);
  nextStack.add(name);
  const allowed = via.every((entry) => {
    if (typeof entry === 'string') {
      return isAllowedVulnerability(entry, nextStack);
    }

    const id = advisoryId(entry);
    return (
      id !== null &&
      allowedAdvisories.has(id) &&
      vulnerability.fixAvailable === false
    );
  });

  allowedCache.set(name, allowed);
  return allowed;
}

const failures = [];
const allowed = [];

for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
  const rank = severityRank.get(vulnerability.severity ?? '') ?? -1;
  if (rank < minimumSeverity) continue;

  if (isAllowedVulnerability(name)) {
    allowed.push(name);
    continue;
  }

  failures.push({
    name,
    severity: vulnerability.severity,
    via: vulnerability.via,
    fixAvailable: vulnerability.fixAvailable,
  });
}

if (failures.length > 0) {
  process.stderr.write('Production dependency audit found unallowed issues:\n');
  process.stderr.write(`${JSON.stringify(failures, null, 2)}\n`);
  process.exit(1);
}

const allowedSummary =
  allowed.length > 0
    ? ` Allowed upstream no-fix advisory path: ${allowed.sort().join(', ')}.`
    : '';
process.stdout.write(`Production dependency audit passed.${allowedSummary}\n`);
