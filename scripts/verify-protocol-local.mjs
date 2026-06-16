#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  ensureProtocolWorkspace,
  readProtocolWorkspaceState,
  resolveProtocolRepo,
} from './protocol-workspace.mjs';

const sdkRoot = process.cwd();
const artifactsRoot = resolve(sdkRoot, 'artifacts');

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function formatProtocolWorkspaceStateLines(params) {
  const lines = [
    `[nakama-sdk] Protocol repo: ${params.protocolRepo}`,
    `[nakama-sdk] Protocol branch: ${params.workspaceState.branch ?? 'unknown'}`,
    `[nakama-sdk] Protocol commit: ${params.workspaceState.commit ?? 'unknown'}`,
    `[nakama-sdk] Protocol workspace changes: ${params.workspaceState.hasLocalChanges ? 'present' : 'none'}`,
    `[nakama-sdk] Protocol workspace fingerprint: ${params.workspaceState.workspaceFingerprint}`,
  ];

  if (params.workspaceState.hasLocalChanges) {
    const summary = params.workspaceState.changeSummary;
    lines.push(
      `[nakama-sdk] Protocol workspace change summary: staged=${summary.staged} unstaged=${summary.unstaged} untracked=${summary.untracked}`,
    );
    if (params.workspaceState.porcelain) {
      lines.push('[nakama-sdk] Protocol workspace file changes:');
      lines.push(params.workspaceState.porcelain);
    }
  }

  return lines;
}

async function run(command, args, env = process.env) {
  const startedAt = new Date();

  try {
    await new Promise((resolveRun, rejectRun) => {
      const child = spawn(command, args, {
        cwd: sdkRoot,
        env,
        stdio: 'inherit',
      });

      child.once('error', rejectRun);
      child.once('exit', (code, signal) => {
        if (code === 0) {
          resolveRun();
          return;
        }
        rejectRun(
          new Error(
            `${command} ${args.join(' ')} failed with code=${code ?? 'null'} signal=${signal ?? 'null'}`,
          ),
        );
      });
    });

    const completedAt = new Date();
    return {
      command,
      args,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      status: 'passed',
    };
  } catch (error) {
    const completedAt = new Date();
    return {
      command,
      args,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function buildVerificationSummary(params) {
  return {
    generatedAt: new Date().toISOString(),
    sdkRoot,
    protocolRepo: params.protocolRepo,
    protocolWorkspaceState: params.protocolWorkspaceState,
    finalProtocolWorkspaceState: params.finalProtocolWorkspaceState,
    workspaceStateStable:
      params.protocolWorkspaceState.workspaceFingerprint ===
      params.finalProtocolWorkspaceState.workspaceFingerprint,
    commands: params.commands,
    surfaceSummaryPath: params.surfaceSummaryPath,
    surfaceSummaryExists: existsSync(params.surfaceSummaryPath),
    verificationSucceeded: params.verificationError === null,
    verificationError: params.verificationError,
  };
}

export async function verifyProtocolLocal() {
  mkdirSync(artifactsRoot, { recursive: true });

  const stamp = nowStamp();
  const surfaceSummaryPath = resolve(
    artifactsRoot,
    `sdk-protocol-surface-summary-${stamp}.json`,
  );
  const verificationSummaryPath = resolve(
    artifactsRoot,
    `sdk-protocol-verify-summary-${stamp}.json`,
  );
  const protocolRepo = resolveProtocolRepo(sdkRoot);
  ensureProtocolWorkspace(protocolRepo);

  const protocolWorkspaceState = readProtocolWorkspaceState(protocolRepo);
  for (const line of formatProtocolWorkspaceStateLines({
    protocolRepo,
    workspaceState: protocolWorkspaceState,
  })) {
    console.log(line);
  }

  const commands = [];
  let verificationError = null;

  for (const spec of [
    { command: 'npm', args: ['run', 'build'] },
    { command: 'npm', args: ['test'] },
    {
      command: 'npm',
      args: ['run', 'test:protocol:localnet'],
      env: {
        ...process.env,
        OMEGAX_PROTOCOL_SURFACE_SUMMARY_PATH: surfaceSummaryPath,
      },
    },
  ]) {
    const result = await run(spec.command, spec.args, spec.env);
    commands.push(result);
    if (result.status === 'failed') {
      verificationError = result.error;
      break;
    }
  }

  const finalProtocolWorkspaceState = readProtocolWorkspaceState(protocolRepo);
  const workspaceStateStable =
    protocolWorkspaceState.workspaceFingerprint ===
    finalProtocolWorkspaceState.workspaceFingerprint;

  if (!workspaceStateStable && verificationError === null) {
    verificationError = [
      'Protocol workspace state changed during verification.',
      `Started with fingerprint ${protocolWorkspaceState.workspaceFingerprint}.`,
      `Ended with fingerprint ${finalProtocolWorkspaceState.workspaceFingerprint}.`,
      'Re-run verification so build, tests, and localnet all validate the same protocol workspace state.',
    ].join(' ');
    console.error(`[nakama-sdk] ${verificationError}`);
  }

  const summary = buildVerificationSummary({
    protocolRepo,
    protocolWorkspaceState,
    finalProtocolWorkspaceState,
    commands,
    surfaceSummaryPath,
    verificationError,
  });
  writeFileSync(
    verificationSummaryPath,
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
  console.log(
    `[nakama-sdk] Verification summary written to ${verificationSummaryPath}`,
  );

  if (verificationError !== null) {
    throw new Error(verificationError);
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  verifyProtocolLocal().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
