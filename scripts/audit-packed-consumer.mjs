#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve('.');
const consumerRoot = mkdtempSync(join(tmpdir(), 'nakama-sdk-consumer-audit-'));
const severityRank = new Map([
  ['info', 0],
  ['low', 1],
  ['moderate', 2],
  ['high', 3],
  ['critical', 4],
]);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: {
      ...process.env,
      npm_config_cache: join(consumerRoot, '.npm-cache'),
      npm_config_logs_dir: join(consumerRoot, '.npm-logs'),
    },
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(
      options.capture
        ? result.stderr || result.stdout || `${command} failed.`
        : `${command} ${args.join(' ')} failed with status ${result.status}.`,
    );
  }
  return result;
}

try {
  run('npm', ['run', 'build']);
  const packed = run(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', consumerRoot],
    { capture: true },
  );
  const [pack] = JSON.parse(packed.stdout);
  if (!pack?.filename)
    throw new Error('npm pack returned no tarball filename.');

  writeFileSync(
    join(consumerRoot, 'package.json'),
    `${JSON.stringify({ name: 'nakama-packed-audit', private: true }, null, 2)}\n`,
  );
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--omit=dev',
      '--no-audit',
      '--no-fund',
      join(consumerRoot, pack.filename),
    ],
    { cwd: consumerRoot, capture: true },
  );

  const audit = run(
    'npm',
    ['audit', '--omit=dev', '--audit-level=moderate', '--json'],
    {
      cwd: consumerRoot,
      capture: true,
      allowFailure: true,
    },
  );
  if (!audit.stdout) {
    throw new Error(audit.stderr || 'npm audit returned no JSON output.');
  }
  const report = JSON.parse(audit.stdout);
  if (
    !report.vulnerabilities ||
    typeof report.vulnerabilities !== 'object' ||
    Array.isArray(report.vulnerabilities)
  ) {
    throw new Error('npm audit report is missing its vulnerabilities object.');
  }

  const failures = Object.entries(report.vulnerabilities)
    .filter(([, vulnerability]) => {
      const rank = severityRank.get(vulnerability?.severity ?? '') ?? -1;
      return rank >= severityRank.get('moderate');
    })
    .map(([name, vulnerability]) => ({
      name,
      severity: vulnerability.severity,
      via: vulnerability.via,
      fixAvailable: vulnerability.fixAvailable,
    }));

  if (failures.length > 0) {
    throw new Error(
      `Packed consumer production audit found moderate-or-higher issues:\n${JSON.stringify(failures, null, 2)}\n`,
    );
  } else if (audit.status !== 0) {
    throw new Error(
      audit.stderr || 'npm audit failed without a blocking advisory.',
    );
  } else {
    process.stdout.write(
      'Packed consumer production audit passed with zero moderate-or-higher findings.\n',
    );
  }
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}
