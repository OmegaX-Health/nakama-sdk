#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runTemplateChecks } from './check-templates.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const sdkRoot = resolve(dirname(scriptPath), '..');
const fixtureRoot = resolve(sdkRoot, 'examples/consumer-app');

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

  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stderr || result.stdout);
    }
    process.exit(result.status ?? 1);
  }

  return result.stdout;
}

function parsePackedTarball(stdout, destination = sdkRoot) {
  const [pack] = JSON.parse(stdout);
  if (!pack?.filename) {
    throw new Error('npm pack did not return a tarball filename.');
  }
  return resolve(destination, pack.filename);
}

async function main() {
  const tempRoot = await mkdtemp(join(tmpdir(), 'nakama-sdk-dogfood-'));
  const npmEnvironment = {
    npm_config_cache: join(tempRoot, '.npm-cache'),
    npm_config_logs_dir: join(tempRoot, '.npm-logs'),
  };
  run('npm', ['run', 'build']);
  const tarballPath = parsePackedTarball(
    run(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', tempRoot],
      { capture: true, env: npmEnvironment },
    ),
    tempRoot,
  );
  const appRoot = join(tempRoot, 'consumer-app');

  try {
    await cp(fixtureRoot, appRoot, { recursive: true });
    const packageJsonPath = join(appRoot, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    packageJson.dependencies['@nakama-health/protocol-sdk'] =
      `file:${tarballPath}`;
    await writeFile(
      packageJsonPath,
      `${JSON.stringify(packageJson, null, 2)}\n`,
      'utf8',
    );

    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: appRoot,
      env: npmEnvironment,
    });
    run('npm', ['run', 'typecheck'], { cwd: appRoot, env: npmEnvironment });
    run('npm', ['run', 'build'], { cwd: appRoot, env: npmEnvironment });
    run('npm', ['run', 'smoke'], { cwd: appRoot, env: npmEnvironment });
  } finally {
    await rm(tarballPath, { force: true });
    await rm(tempRoot, { recursive: true, force: true });
  }

  if (process.env.OMEGAX_DOGFOOD_SKIP_TEMPLATES !== '1') {
    await runTemplateChecks();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
