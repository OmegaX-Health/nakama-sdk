import Module, { register } from 'node:module';
import { pathToFileURL } from 'node:url';

import {
  resolveProtocolImportPath,
  resolveSdkAdapterImportPath,
} from './protocol-sdk-adapter-resolver.mjs';

register(
  new URL('./protocol-sdk-adapter-loader.mjs', import.meta.url),
  pathToFileURL(`${process.cwd()}/`),
);

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveProtocolAdapterFilename(
  request,
  parent,
  isMain,
  options,
) {
  const adaptedPath =
    resolveProtocolImportPath(request, parent?.filename) ??
    resolveSdkAdapterImportPath(request, parent?.filename);
  if (adaptedPath) return adaptedPath;

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
