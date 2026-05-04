import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
export const TESTS_DIRECTORY = path.join(REPO_ROOT, 'tests');

function walkDirectory(rootDir) {
  const discovered = [];

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      discovered.push(...walkDirectory(entryPath));
      continue;
    }

    discovered.push(entryPath);
  }

  return discovered;
}

export function findTestFiles(rootDir = TESTS_DIRECTORY) {
  return walkDirectory(rootDir)
    .filter((filePath) => filePath.endsWith('.test.ts'))
    .map((filePath) =>
      path.relative(REPO_ROOT, filePath).split(path.sep).join('/'),
    )
    .sort((left, right) => left.localeCompare(right));
}

export function runTests() {
  const testFiles = findTestFiles();
  if (testFiles.length === 0) {
    console.error('No test files found.');
    return 1;
  }

  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--test', ...testFiles],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'test',
      },
      stdio: 'inherit',
    },
  );

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exit(runTests());
}
