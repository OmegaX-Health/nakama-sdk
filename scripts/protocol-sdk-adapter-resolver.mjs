import { existsSync } from 'node:fs';
import { dirname, resolve as pathResolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const resolverDir = fileURLToPath(new URL('.', import.meta.url));

export const adapterPath = pathResolve(
  resolverDir,
  '../e2e/sdk_protocol_frontend_adapter.mjs',
);
export const adapterUrl = pathToFileURL(adapterPath).href;

const PROTOCOL_FRONTEND_ALIAS_PREFIX = '@/';
const PROTOCOL_MODULE_ALIAS_SPECIFIERS = new Set([
  '@/lib/protocol',
  '@/lib/protocol.ts',
]);

function isProtocolContextPath(parentPath) {
  return (
    typeof parentPath === 'string' &&
    parentPath.includes(`${sep}omegax-protocol${sep}`)
  );
}

export function protocolRootFromParentPath(parentPath) {
  if (!isProtocolContextPath(parentPath)) return null;

  for (const segment of [`${sep}frontend${sep}`, `${sep}e2e${sep}`]) {
    const markerIndex = parentPath.indexOf(segment);
    if (markerIndex !== -1) {
      return parentPath.slice(0, markerIndex);
    }
  }

  return null;
}

export function resolveExistingModulePath(modulePath) {
  for (const candidate of [
    modulePath,
    `${modulePath}.ts`,
    `${modulePath}.tsx`,
    `${modulePath}.js`,
    `${modulePath}.mjs`,
    `${modulePath}.json`,
    pathResolve(modulePath, 'index.ts'),
    pathResolve(modulePath, 'index.tsx'),
    pathResolve(modulePath, 'index.js'),
    pathResolve(modulePath, 'index.mjs'),
  ]) {
    if (existsSync(candidate)) return candidate;
  }

  return null;
}

export function isProtocolModulePath(modulePath) {
  return (
    typeof modulePath === 'string' &&
    modulePath.endsWith(`${sep}frontend${sep}lib${sep}protocol.ts`)
  );
}

export function resolveProtocolImportPath(specifier, parentPath) {
  if (!isProtocolContextPath(parentPath)) return null;

  if (PROTOCOL_MODULE_ALIAS_SPECIFIERS.has(specifier)) {
    return adapterPath;
  }

  const protocolRoot = protocolRootFromParentPath(parentPath);
  if (!protocolRoot) return null;

  if (specifier.startsWith(PROTOCOL_FRONTEND_ALIAS_PREFIX)) {
    const aliasedPath = resolveExistingModulePath(
      pathResolve(
        protocolRoot,
        'frontend',
        specifier.slice(PROTOCOL_FRONTEND_ALIAS_PREFIX.length),
      ),
    );
    if (!aliasedPath) return null;
    return isProtocolModulePath(aliasedPath) ? adapterPath : aliasedPath;
  }

  if (specifier.startsWith('.')) {
    const resolvedPath = resolveExistingModulePath(
      pathResolve(dirname(parentPath), specifier),
    );
    if (isProtocolModulePath(resolvedPath)) return adapterPath;
  }

  return null;
}

export function resolveSdkAdapterImportPath(specifier, parentPath) {
  if (parentPath !== adapterPath) return null;
  if (!specifier.startsWith('../src/') || !specifier.endsWith('.js')) {
    return null;
  }

  return resolveExistingModulePath(
    pathResolve(dirname(adapterPath), specifier.replace(/\.js$/u, '.ts')),
  );
}
