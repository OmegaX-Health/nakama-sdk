# OmegaX SDK Goal Completion Audit

Last audited: 2026-05-14, Asia/Kuala_Lumpur.

This file is a maintainer and agent handoff for the active Codex goal. It is a
snapshot, not packaged SDK documentation. Do not use it as proof of completion
after any push, tag, GitHub setting change, npm secret change, protocol update,
or npm publish event without rerunning the evidence commands below.

## Objective

Make `/Users/dr_sabijan/Documents/GitHub/omegax-sdk` a professional, safe,
easy-to-use TypeScript SDK for human developers and AI agents:

- clear public API exports, package ergonomics, and TypeScript tooling behavior;
- protocol-aligned builders, readers, RPC helpers, account helpers, seeds, and
  fixtures;
- safe transaction intent boundaries with no hidden signing, broadcast, network
  mutation, or cluster assumptions;
- deterministic errors and validation for account ownership, custom program IDs,
  unsigned transaction intent, and protocol-derived addresses;
- aligned README, docs, examples, tests, fixtures, release workflow, and docs
  sync records;
- release posture with passing validation gates, no unresolved critical/high/
  medium SDK or DX issues, and live governance ready for publish.

## Current Status

Blocked, not complete.

The authored SDK surface is locally validated, but public release completion is
blocked by live GitHub and npm governance state. Do not mark the active goal
complete until the live blockers are fixed and the full audit is rerun.

## Evidence Snapshot

Commands run during the latest blocker rechecks:

```bash
git fetch --prune origin
git status --short --branch --untracked-files=all
git log --oneline -5 --decorate
npm view @omegax/protocol-sdk version dist-tags versions --json
gh auth status
gh pr list --repo OmegaX-Health/omegax-sdk --state open \
  --json number,title,headRefName,baseRefName,author,mergeStateStatus,reviewDecision,statusCheckRollup
npm run release:state -- --json
npm run security:release-governance:live -- --json
npm run verify:protocol:local
npm run verify:release:strict
find . -maxdepth 1 -name '*.tgz' -print
```

Recorded blocker evidence from audit runs. Treat exact counts, commits, and
live GitHub inventory as stale after any local commit or GitHub/npm change; run
the commands above for the current truth. The live governance JSON now includes
a non-secret `evidence` object with branch protection, environment reviewer,
secret-name, collaborator, team, and invitation summaries.

- Worktree: local `main` remains ahead of `origin/main`; rerun
  `npm run release:state -- --json` after the last commit for the exact current
  ahead/behind count.
- Open SDK PRs: none.
- Repo collaborators with direct access: `marinosabijan` only.
- Visible org teams: none during the last reviewer-inventory check.
- Pending repo and org invitations: none during the last reviewer-inventory
  check.
- `npm-production` reviewer configuration: one reviewer,
  `marinosabijan`, with `prevent_self_review: false` during the last live
  check.
- npm registry latest: `@omegax/protocol-sdk@0.8.9`.
- Local package version: `@omegax/protocol-sdk@0.8.10`.
- Remote release tag: `v0.8.10` missing.
- GitHub release: `v0.8.10` missing; latest visible release was `v0.8.8`.
- Strict release verification: `npm run verify:release:strict` passed after
  commit `ebbe631`, including security checks, typecheck, lint,
  format, build, SDK tests `114/114`, docs/API/docs-sync checks, runtime and
  protocol artifact checks, package manifest, production dependency audit,
  examples, dogfood consumer, CLI, templates, DX smoke, `release:state`, and
  `npm pack --dry-run`.
- Protocol-local verification: passed against sibling
  `/Users/dr_sabijan/Documents/GitHub/omegax-protocol` commit
  `574672295721fa1d2cea5d5346577e4b3f7e1274`, including SDK tests `112/112`,
  localnet smoke `1/1`, and protocol surface audit `13/13`.
- Release tarballs: none left in the repo root.
- `gh` session: `marinosabijan` with `repo`, `workflow`, and `read:org`.

## Prompt-To-Artifact Checklist

| Requirement                                             | Evidence                                                                                                                                                                                  | Status                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Respect repo instructions and no surprise branch/push   | `AGENTS.md`; `git status --short --branch --untracked-files=all`; no push was performed during these audit runs.                                                                          | Met locally, push still pending approval             |
| Preserve unrelated work                                 | Worktree clean before this audit addition; latest committed SDK work is isolated in local commits.                                                                                        | Met locally                                          |
| SDK quality doctrine exists                             | `SDK_QUALITY.md` covers naming, exports, builders, readers/RPC, errors, side effects, protocol parity, docs/examples, agent usage, and release gates.                                     | Met                                                  |
| Public exports are coherent and packaged                | `package.json#exports`, `SDK_RUNTIME.json`, `docs/generated/api/README.md`, `npm run runtime:check`, and `npm run docs:api:check`.                                                        | Met by latest strict verification                    |
| Builders fail closed and preserve trust boundaries      | Tests cover canonical builders, unsafe custom program IDs, privileged/partial scopes, selected-program-ID PDA derivation, and money-moving safe builders.                                 | Met by latest strict verification                    |
| Readers validate protocol accounts                      | Tests cover discriminator rejection and owner mismatch checks in protocol readers.                                                                                                        | Met by latest strict verification                    |
| Claim intent validation is not loose                    | Tests cover missing expected intent, tampered signatures, wrong signer, expiry, nonce, lookup mutation, and missing required signer cases.                                                | Met by latest strict verification                    |
| RPC helpers expose signature and simulation trust state | RPC tests cover blockhash replacement defaults, unsigned fallback simulation metadata, and explicit signature-verification downgrade behavior.                                            | Met by latest strict verification                    |
| Docs, examples, templates, and generated API docs align | `docs:api:check`, `docs:check`, `docs:sync:check:strict`, `examples:check`, `dogfood:consumer`, `cli:check`, `templates:check`, and `dx:smoke` passed in `npm run verify:release:strict`. | Met by latest strict verification                    |
| Package contents are release-safe                       | `security:package`, `security:secrets`, `security:install-scripts`, `audit:prod`, and `npm pack --dry-run` passed in `npm run verify:release:strict`.                                     | Met locally                                          |
| Protocol artifact parity is checked                     | `protocol:artifact:check` passed in `npm run verify:release:strict`; `npm run verify:protocol:local` passed against sibling protocol commit `574672295721fa1d2cea5d5346577e4b3f7e1274`.   | Met by current local and protocol-local verification |
| Live release state is ready                             | `npm run release:state -- --json` reports local branch ahead, npm `0.8.10` unpublished, remote tag missing, and GitHub release missing until those external steps are fixed.              | Blocked                                              |
| Live GitHub governance is ready                         | `npm run security:release-governance:live -- --json` reports blocker failures plus non-secret `evidence` for branch policy, environment reviewers, secrets, and reviewer inventory.       | Blocked                                              |
| Independent reviewer requirement is real                | The live gate and setup helper reject code-owner aliases, automation identities, duplicate entries, empty/opaque teams, and teams without a distinct visible human.                       | Met in tooling, blocked in live configuration        |
| No duplicate code-owner reviewer path is counted        | Repo search for the old reviewer-alias variants returns no hits; live governance evidence and setup tooling require two distinct eligible human reviewers.                                | Met                                                  |

## Current Live Blockers

The active goal cannot be completed until all of these are resolved with fresh
evidence:

1. Push the local `main` commits or otherwise reconcile the branch so
   `release:state` no longer reports `git-ahead-upstream`.
2. Configure `main` branch protection to require at least one approving PR
   review and CODEOWNERS review.
3. Configure `npm-production` to require at least two reviewers and prevent
   self-review.
4. Provide a real independent second reviewer or a visible eligible team with a
   distinct human member.
5. Add repository Actions secret `OMEGAX_GOVERNANCE_READ_TOKEN` for the
   unprotected release verification job.
6. Remove stale repository Actions `NPM_TOKEN` only after explicit security
   approval.
7. Tag, release, and publish `@omegax/protocol-sdk@0.8.10` only after live
   governance passes.

## Approved Next Commands

Dry-run GitHub governance only after a real second reviewer login or eligible
team is known:

```bash
GITHUB_REPOSITORY=OmegaX-Health/omegax-sdk \
OMEGAX_RELEASE_REVIEWERS=marinosabijan,<second-reviewer-login> \
npm run security:release-governance:setup
```

Apply GitHub governance only after explicit approval:

```bash
GITHUB_REPOSITORY=OmegaX-Health/omegax-sdk \
OMEGAX_RELEASE_REVIEWERS=marinosabijan,<second-reviewer-login> \
npm run security:release-governance:setup -- --apply
```

Delete stale npm publish secrets only after explicit security approval:

```bash
gh secret delete NPM_TOKEN --repo OmegaX-Health/omegax-sdk
gh secret delete NODE_AUTH_TOKEN --repo OmegaX-Health/omegax-sdk
```

## Final Completion Audit Required

Before calling the active goal complete, rerun and record:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run docs:check
npm run docs:sync:check:strict
npm run verify:protocol:local
npm run verify:release:strict
npm run security:release-governance:live -- --json
npm run release:state -- --json
npm pack --dry-run
git status --short --branch --untracked-files=all
```

Completion requires no unresolved critical, high, or medium SDK/API/docs/DX/
security findings, a clean or intentionally published git state, passing live
governance, and current npm/tag/GitHub release evidence for the intended
version.
