#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const sdkRoot = process.cwd();
const cliPath = resolve(sdkRoot, 'dist/cli.js');
const templates = ['node-backend', 'next-route', 'oracle-worker'];
const sdkPackageName = '@nakama-health/protocol-sdk';

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
    throw new Error(
      `Command failed: ${command} ${args.join(' ')} (exit ${
        result.status ?? 1
      })`,
    );
  }

  return result.stdout;
}

function parsePackedTarball(stdout) {
  const [pack] = JSON.parse(stdout);
  if (!pack?.filename) {
    throw new Error('npm pack did not return a tarball filename.');
  }
  return resolve(sdkRoot, pack.filename);
}

async function patchSdkDependency(appRoot, tarballPath) {
  const packageJsonPath = join(appRoot, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  packageJson.dependencies['@nakama-health/protocol-sdk'] =
    `file:${tarballPath}`;
  await writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf8',
  );
}

async function assertTemplateDependencyVersions() {
  const rootPackageJson = JSON.parse(
    await readFile(join(sdkRoot, 'package.json'), 'utf8'),
  );
  const expectedDependency = `^${rootPackageJson.version}`;

  for (const template of templates) {
    const packageJsonPath = join(
      sdkRoot,
      'templates',
      template,
      'package.json',
    );
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const actualDependency = packageJson.dependencies?.[sdkPackageName];
    if (actualDependency !== expectedDependency) {
      throw new Error(
        `${packageJsonPath} must depend on ${sdkPackageName}@${expectedDependency}; found ${actualDependency ?? 'missing'}.`,
      );
    }
  }
}

function ensureCliBuilt() {
  if (!existsSync(cliPath)) {
    run('npm', ['run', 'build']);
  }
}

export async function runTemplateChecks() {
  await assertTemplateDependencyVersions();
  run('npm', ['run', 'build']);
  const tarballPath = parsePackedTarball(
    run('npm', ['pack', '--ignore-scripts', '--json'], { capture: true }),
  );
  const tempRoot = await mkdtemp(join(tmpdir(), 'nakama-sdk-templates-'));

  try {
    for (const template of templates) {
      const appRoot = join(tempRoot, template);
      ensureCliBuilt();
      run(process.execPath, [
        cliPath,
        'scaffold',
        template,
        '--out',
        appRoot,
        '--force',
      ]);
      await patchSdkDependency(appRoot, tarballPath);
      run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
        cwd: appRoot,
      });
      run('npm', ['run', 'typecheck'], { cwd: appRoot });
      run('npm', ['run', 'build'], { cwd: appRoot });
      run('npm', ['run', 'smoke'], { cwd: appRoot });
    }
  } finally {
    await rm(tarballPath, { force: true });
    await rm(tempRoot, { recursive: true, force: true });
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === new URL(process.argv[1], 'file:').href;

if (isDirectRun) {
  runTemplateChecks()
    .then(() => {
      console.log('Template check passed.');
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
