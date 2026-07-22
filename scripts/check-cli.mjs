#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const sdkRoot = process.cwd();
const cliPath = resolve(sdkRoot, 'dist/cli.js');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? sdkRoot,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: {
      ...process.env,
      ...(options.env ?? {}),
    },
  });

  if (options.expectFailure) {
    if (result.status === 0) {
      throw new Error(`${command} ${args.join(' ')} unexpectedly passed`);
    }
    return result;
  }

  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stderr || result.stdout);
    }
    process.exit(result.status ?? 1);
  }

  return result;
}

function parseJsonOutput(result) {
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`Expected JSON output, got: ${result.stdout}`, {
      cause: error,
    });
  }
}

async function main() {
  run('npm', ['run', 'build']);

  const doctor = parseJsonOutput(
    run(process.execPath, [cliPath, 'doctor', '--json'], { capture: true }),
  );
  if (!doctor.ok || !Array.isArray(doctor.checks)) {
    throw new Error('doctor --json did not report passing checks');
  }
  if (
    !doctor.checks.some(
      (check) =>
        check.name === 'package-subpath-imports' && check.status === 'pass',
    )
  ) {
    throw new Error('doctor did not verify package subpath imports');
  }
  const deploymentCheck = doctor.checks.find(
    (check) => check.name === 'deployment-manifest',
  );
  const contractNames = Object.keys(
    deploymentCheck?.details?.contracts ?? {},
  ).sort();
  const expectedContractNames = [
    'agentAuthorizationRegistry',
    'assetRegistry',
    'decisionModule',
    'factory',
    'membershipRegistry',
    'poolRegistry',
    'program',
    'requestManager',
    'safetyGuardian',
    'settlementModule',
    'templateRegistry',
    'vault',
  ].sort();
  if (JSON.stringify(contractNames) !== JSON.stringify(expectedContractNames)) {
    throw new Error(
      'doctor did not report all twelve Robinhood contract roles',
    );
  }

  const failingDoctor = parseJsonOutput(
    run(
      process.execPath,
      [cliPath, 'doctor', '--network', 'ethereum', '--json'],
      {
        capture: true,
        expectFailure: true,
      },
    ),
  );
  if (failingDoctor.ok !== false) {
    throw new Error('doctor failure JSON did not set ok=false');
  }

  run(process.execPath, [cliPath, 'examples'], { capture: true });

  const tempRoot = await mkdtemp(join(tmpdir(), 'nakama-sdk-cli-check-'));
  try {
    const binPath = join(tempRoot, 'nakama-sdk');
    symlinkSync(cliPath, binPath);
    const symlinkHelp = run(process.execPath, [binPath, 'help'], {
      capture: true,
    });
    if (!symlinkHelp.stdout.includes('nakama-sdk doctor')) {
      throw new Error('symlinked CLI bin did not print usage output');
    }

    const nonEmptyTarget = join(tempRoot, 'non-empty');
    mkdirSync(nonEmptyTarget, { recursive: true });
    writeFileSync(join(nonEmptyTarget, 'keep.txt'), 'do not overwrite', 'utf8');
    run(
      process.execPath,
      [cliPath, 'scaffold', 'node-backend', '--out', nonEmptyTarget],
      {
        capture: true,
        expectFailure: true,
      },
    );

    run(
      process.execPath,
      [cliPath, 'scaffold', 'node-backend', '--out', nonEmptyTarget, '--force'],
      { capture: true },
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }

  console.log('CLI check passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
