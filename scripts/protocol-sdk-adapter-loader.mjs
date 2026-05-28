import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  adapterPath,
  isProtocolModulePath,
  resolveSdkAdapterImportPath,
  resolveProtocolImportPath,
} from './protocol-sdk-adapter-resolver.mjs';

export async function resolve(specifier, context, nextResolve) {
  const parentPath = context.parentURL?.startsWith('file:')
    ? fileURLToPath(context.parentURL)
    : null;
  const adaptedPath = parentPath
    ? (resolveProtocolImportPath(specifier, parentPath) ??
      resolveSdkAdapterImportPath(specifier, parentPath))
    : null;

  if (adaptedPath) {
    return {
      url: pathToFileURL(adaptedPath).href,
      shortCircuit: true,
    };
  }

  const resolved = await nextResolve(specifier, context);
  if (
    parentPath?.includes('/omegax-protocol/') &&
    resolved.url?.startsWith('file:') &&
    isProtocolModulePath(fileURLToPath(resolved.url))
  ) {
    return {
      url: pathToFileURL(adapterPath).href,
      shortCircuit: true,
    };
  }

  return resolved;
}
