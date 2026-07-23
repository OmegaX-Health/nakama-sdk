import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const RUNTIME_CHECK = join(REPO_ROOT, 'scripts/check-sdk-runtime-manifest.mjs');
const FIXTURE_PATHS = [
  'package.json',
  'SDK_RUNTIME.json',
  'README.md',
  'SDK_QUALITY.md',
  'src',
  'contracts/robinhood',
  'deployments',
  'docs',
];

async function createIsolatedSdkCheckout() {
  const root = await mkdtemp(join(tmpdir(), 'nakama-sdk-runtime-'));
  const sdkRoot = join(root, 'nakama-sdk');
  await mkdir(sdkRoot);
  for (const path of FIXTURE_PATHS) {
    await cp(join(REPO_ROOT, path), join(sdkRoot, path), { recursive: true });
  }
  return { root, sdkRoot };
}

function runRuntimeCheck(cwd: string) {
  return spawnSync(process.execPath, [RUNTIME_CHECK], {
    cwd,
    encoding: 'utf8',
  });
}

test('runtime check validates checked-in canonical artifacts without a sibling protocol checkout', async (t) => {
  const fixture = await createIsolatedSdkCheckout();
  t.after(async () => {
    await rm(fixture.root, { recursive: true, force: true });
  });

  const result = runRuntimeCheck(fixture.sdkRoot);

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /checked-in canonical artifacts; sibling protocol repository unavailable/u,
  );
});

test('runtime check fails closed when an isolated checked-in artifact is altered', async (t) => {
  const fixture = await createIsolatedSdkCheckout();
  t.after(async () => {
    await rm(fixture.root, { recursive: true, force: true });
  });
  const artifactPath = join(
    fixture.sdkRoot,
    'contracts/robinhood/protocol_contract.json',
  );
  const artifact = JSON.parse(await readFile(artifactPath, 'utf8')) as {
    sourceCommit: string;
  };
  artifact.sourceCommit = '0'.repeat(40);
  await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

  const result = runRuntimeCheck(fixture.sdkRoot);

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Checked-in artifact sourceCommit must be a nonzero full lowercase Git SHA/u,
  );
  assert.match(result.stderr, /checked-in artifact SHA-256 mismatch/u);
});

test('runtime check compares checked-in artifacts with a sibling protocol checkout when present', async (t) => {
  const fixture = await createIsolatedSdkCheckout();
  t.after(async () => {
    await rm(fixture.root, { recursive: true, force: true });
  });
  const siblingRoot = join(fixture.root, 'nakama-protocol/shared/robinhood');
  await mkdir(dirname(siblingRoot), { recursive: true });
  await cp(join(fixture.sdkRoot, 'contracts/robinhood'), siblingRoot, {
    recursive: true,
  });
  const siblingArtifactPath = join(siblingRoot, 'protocol_contract.json');
  await writeFile(
    siblingArtifactPath,
    `${await readFile(siblingArtifactPath, 'utf8')}\n`,
  );

  const result = runRuntimeCheck(fixture.sdkRoot);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /sibling artifact bytes mismatch/u);
});

test('runtime check fails closed when a sibling repository exists without its canonical artifact', async (t) => {
  const fixture = await createIsolatedSdkCheckout();
  t.after(async () => {
    await rm(fixture.root, { recursive: true, force: true });
  });
  await mkdir(join(fixture.root, 'nakama-protocol'));

  const result = runRuntimeCheck(fixture.sdkRoot);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Canonical Robinhood artifact is missing/u);
});
