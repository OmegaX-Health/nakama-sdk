import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import {
  adapterPath,
  resolveSdkAdapterImportPath,
} from '../scripts/protocol-sdk-adapter-resolver.mjs';
import { resolve as resolveProtocolSdkAdapter } from '../scripts/protocol-sdk-adapter-loader.mjs';

function createProtocolFixture() {
  const root = mkdtempSync(join(tmpdir(), 'nakama-sdk-loader-'));
  const protocolRoot = join(root, 'omegax-protocol');
  const libRoot = join(protocolRoot, 'frontend/lib');
  mkdirSync(libRoot, { recursive: true });
  writeFileSync(
    join(libRoot, 'genesis-protect-acute.ts'),
    'export const fixture = true;\n',
    'utf8',
  );
  writeFileSync(
    join(libRoot, 'protocol.ts'),
    'export const shouldBeAdapted = true;\n',
    'utf8',
  );

  return { root, protocolRoot };
}

function parentUrl(protocolRoot: string, relativePath: string) {
  return pathToFileURL(join(protocolRoot, relativePath)).href;
}

test('protocol adapter loader resolves frontend aliases used by protocol fixtures', async () => {
  const { root, protocolRoot } = createProtocolFixture();

  try {
    const resolved = await resolveProtocolSdkAdapter(
      '@/lib/genesis-protect-acute',
      {
        parentURL: parentUrl(
          protocolRoot,
          'frontend/lib/network-school-acute-assist.ts',
        ),
      },
      async () => {
        throw new Error(
          'nextResolve should not be needed for protocol aliases',
        );
      },
    );

    assert.equal(resolved.shortCircuit, true);
    assert.equal(
      resolved.url,
      pathToFileURL(join(protocolRoot, 'frontend/lib/genesis-protect-acute.ts'))
        .href,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('protocol adapter loader keeps protocol module imports pointed at the SDK adapter', async () => {
  const { root, protocolRoot } = createProtocolFixture();

  try {
    const aliasResolved = await resolveProtocolSdkAdapter(
      '@/lib/protocol',
      {
        parentURL: parentUrl(protocolRoot, 'frontend/lib/devnet-fixtures.ts'),
      },
      async () => {
        throw new Error(
          'nextResolve should not be needed for protocol aliases',
        );
      },
    );

    const relativeResolved = await resolveProtocolSdkAdapter(
      './protocol',
      {
        parentURL: parentUrl(protocolRoot, 'frontend/lib/devnet-fixtures.ts'),
      },
      async () => ({
        url: pathToFileURL(join(protocolRoot, 'frontend/lib/protocol.ts')).href,
        shortCircuit: false,
      }),
    );

    assert.equal(aliasResolved.shortCircuit, true);
    assert.equal(relativeResolved.shortCircuit, true);
    assert.match(
      aliasResolved.url,
      /\/e2e\/sdk_protocol_frontend_adapter\.mjs$/,
    );
    assert.equal(relativeResolved.url, aliasResolved.url);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('protocol adapter resolver maps adapter JavaScript imports to TypeScript sources', () => {
  assert.match(
    resolveSdkAdapterImportPath('../src/protocol.js', adapterPath) ?? '',
    /\/src\/protocol\.ts$/,
  );
  assert.equal(
    resolveSdkAdapterImportPath('../src/protocol.js', '/tmp/other.mjs'),
    null,
  );
});
