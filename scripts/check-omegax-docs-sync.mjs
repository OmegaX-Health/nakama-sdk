#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const strict = process.argv.includes('--strict');
const manifestPath = resolve('docs/OMEGAX_DOCS_SYNC.json');
const packagePath = resolve('package.json');
const placeholders = new Set(['', 'PENDING', 'REPLACE_ME', 'TBD', 'UNKNOWN']);

function fail(message, errors) {
  errors.push(message);
}

function warn(message, warnings) {
  warnings.push(message);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(path) {
  const bytes = await readFile(path);
  return createHash('sha256').update(bytes).digest('hex');
}

function isIsoDate(value) {
  if (typeof value !== 'string') return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isCommitSha(value) {
  return /^[0-9a-f]{7,40}$/i.test(value);
}

async function verifyDocsCommitAncestry(docsCommit, warnings, errors) {
  const docsRepoDir = resolve(
    process.env.OMEGAX_DOCS_REPO_DIR || '../omegax-docs',
  );
  if (!(await fileExists(resolve(docsRepoDir, '.git')))) {
    warn(
      'Skipping docs commit ancestry check because omegax-docs is not available locally.',
      warnings,
    );
    return;
  }

  const refCandidates = ['origin/main', 'main'];
  let verified = false;
  for (const ref of refCandidates) {
    const result = spawnSync(
      'git',
      ['-C', docsRepoDir, 'merge-base', '--is-ancestor', docsCommit, ref],
      { encoding: 'utf8' },
    );
    if (result.status === 0) {
      verified = true;
      break;
    }
  }

  if (!verified) {
    fail(
      `omegaxDocsCommit ${docsCommit} is not reachable from omegax-docs main.`,
      errors,
    );
  }
}

async function main() {
  const errors = [];
  const warnings = [];

  const [pkgRaw, manifestRaw] = await Promise.all([
    readFile(packagePath, 'utf8'),
    readFile(manifestPath, 'utf8'),
  ]);

  const pkg = JSON.parse(pkgRaw);
  const manifest = JSON.parse(manifestRaw);

  const packageVersion = String(pkg.version ?? '').trim();
  const sdkVersion = String(manifest.sdkVersion ?? '').trim();
  const docsRepo = String(manifest.omegaxDocsRepo ?? '').trim();
  const docsCommit = String(manifest.omegaxDocsCommit ?? '').trim();
  const syncedAt = String(manifest.syncedAt ?? '').trim();
  const syncedBy = String(manifest.syncedBy ?? '').trim();

  if (!packageVersion) {
    fail('package.json is missing version.', errors);
  }
  if (!sdkVersion) {
    fail('docs/OMEGAX_DOCS_SYNC.json is missing sdkVersion.', errors);
  }
  if (packageVersion && sdkVersion && packageVersion !== sdkVersion) {
    fail(
      `sdkVersion (${sdkVersion}) does not match package.json version (${packageVersion}).`,
      errors,
    );
  }

  if (!docsRepo.startsWith('https://')) {
    fail('omegaxDocsRepo must be an https URL.', errors);
  }

  if (strict) {
    if (placeholders.has(docsCommit) || !isCommitSha(docsCommit)) {
      fail(
        'Strict mode requires omegaxDocsCommit to be a merged commit SHA (7-40 hex chars).',
        errors,
      );
    }
    if (placeholders.has(syncedAt) || !isIsoDate(syncedAt)) {
      fail(
        'Strict mode requires syncedAt to be a valid ISO-8601 timestamp.',
        errors,
      );
    }
    if (placeholders.has(syncedBy) || syncedBy.length < 2) {
      fail(
        'Strict mode requires syncedBy to be set to a maintainer identifier.',
        errors,
      );
    }
  } else {
    if (placeholders.has(docsCommit) || !isCommitSha(docsCommit)) {
      warn(
        'omegaxDocsCommit is not finalized yet (allowed in non-strict mode, blocked in release strict mode).',
        warnings,
      );
    }
    if (placeholders.has(syncedAt) || !isIsoDate(syncedAt)) {
      warn(
        'syncedAt is not finalized yet (allowed in non-strict mode, blocked in release strict mode).',
        warnings,
      );
    }
    if (placeholders.has(syncedBy) || syncedBy.length < 2) {
      warn(
        'syncedBy is not finalized yet (allowed in non-strict mode, blocked in release strict mode).',
        warnings,
      );
    }
  }

  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    fail(
      'pages[] must be a non-empty array in docs/OMEGAX_DOCS_SYNC.json.',
      errors,
    );
  } else {
    const seen = new Set();
    for (const [index, page] of manifest.pages.entries()) {
      const sdkDoc = String(page?.sdkDoc ?? '').trim();
      const omegaxDocsPath = String(page?.omegaxDocsPath ?? '').trim();
      const sdkDocSha256 = String(page?.sdkDocSha256 ?? '').trim();

      if (!sdkDoc) {
        fail(`pages[${index}].sdkDoc is required.`, errors);
        continue;
      }
      if (!omegaxDocsPath) {
        fail(`pages[${index}].omegaxDocsPath is required.`, errors);
      }
      if (sdkDoc.startsWith('/')) {
        fail(
          `pages[${index}].sdkDoc must be repository-relative: ${sdkDoc}`,
          errors,
        );
      }
      if (omegaxDocsPath.startsWith('/')) {
        fail(
          `pages[${index}].omegaxDocsPath must be repo-relative: ${omegaxDocsPath}`,
          errors,
        );
      }
      if (!omegaxDocsPath.startsWith('website/docs/')) {
        warn(
          `pages[${index}].omegaxDocsPath should usually live under website/docs/: ${omegaxDocsPath}`,
          warnings,
        );
      }
      if (seen.has(sdkDoc)) {
        fail(`Duplicate sdkDoc mapping: ${sdkDoc}`, errors);
      }
      seen.add(sdkDoc);

      const exists = await fileExists(resolve(sdkDoc));
      if (!exists) {
        fail(`Mapped sdkDoc file does not exist: ${sdkDoc}`, errors);
      } else if (strict) {
        if (!/^[0-9a-f]{64}$/i.test(sdkDocSha256)) {
          fail(
            `pages[${index}].sdkDocSha256 must be a 64-character SHA-256 hash in strict mode.`,
            errors,
          );
        } else {
          const actualHash = await sha256File(resolve(sdkDoc));
          if (actualHash !== sdkDocSha256.toLowerCase()) {
            fail(
              `pages[${index}].sdkDocSha256 does not match ${sdkDoc}.`,
              errors,
            );
          }
        }
      }
    }
  }

  if (strict && isCommitSha(docsCommit) && !placeholders.has(docsCommit)) {
    await verifyDocsCommitAncestry(docsCommit, warnings, errors);
  }

  for (const message of warnings) {
    console.warn(`Warning: ${message}`);
  }

  if (errors.length > 0) {
    console.error('Docs sync check failed:');
    for (const message of errors) {
      console.error(`- ${message}`);
    }
    process.exitCode = 1;
    return;
  }

  const mode = strict ? 'strict' : 'standard';
  console.log(`Docs sync check passed (${mode} mode).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
