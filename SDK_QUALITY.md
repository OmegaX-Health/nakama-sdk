# OmegaX SDK Quality Doctrine

This SDK is a production integration surface for humans and AI agents. It should
be boringly reliable: easy to inspect, explicit about trust boundaries, and
aligned with the live OmegaX protocol.

## API Naming

- Use canonical protocol language: policy series, policy position, claim record,
  and protocol config.
- Do not add `v2`, `legacy`, compatibility, reward, or seeker-era names unless
  the active protocol surface still requires them.
- Prefer stable nouns over app-specific roles. SDK names should describe the
  protocol concept, not a current UI journey.

## Public Exports

- Every public export must be useful from TypeScript tooling, documented through
  generated API docs, and covered by an authored doc, example, or test when it is
  a primary workflow entrypoint.
- Public subpaths must stay listed in `package.json#exports` and
  `SDK_RUNTIME.json`.
- Remove stale exports in place during pre-1.0 alignment rather than adding
  parallel aliases by default.

## Transaction Builders

- Builders produce unsigned transaction intent only. They must never sign,
  broadcast, assume a wallet, or hide network mutation.
- Required accounts and args must fail before a nonsensical instruction is
  produced.
- Custom program IDs are unsafe by default. They require an explicit unsafe flag
  or `OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID=1` for devnet, localnet, and
  tests.
- PDA derivation must use the same configured program ID as the instruction
  being built.

## Readers And RPC Helpers

- Readers must validate protocol account ownership and discriminators where the
  SDK has enough information to do so.
- RPC helpers must make simulation, broadcast, and signature-verification
  downgrades explicit in return values.
- Helpers may read network state only when their name and docs make that clear.

## Errors And Validation

- SDK-thrown errors should use stable `OmegaX*Error` classes with deterministic
  `code` values and actionable messages.
- Validation should fail closed around signing, expected transaction bytes,
  account ownership, custom program IDs, and protocol-derived addresses.
- Silent fallbacks are allowed only when the result records the fallback and the
  caller can reject it.

## Safety And Side Effects

- No hidden signing.
- No hidden broadcast.
- No hidden cluster assumption.
- No hidden mutation from examples, docs, templates, or CLI checks.
- Side-effectful methods must name the action and document the caller-owned
  signer, payer, network, and retry behavior.

## Protocol Parity

- Treat `../omegax-protocol` as the active source of truth while the protocol is
  devnet-first.
- Refresh fixtures and generated bindings only through project scripts.
- Preserve the release target in `SDK_RUNTIME.json` and keep protocol surface
  counts, program ID, and contract hash aligned with generated artifacts.
- Run `npm run verify:protocol:local` whenever builders, readers, seeds,
  fixtures, or workspace integration change.

## Docs And Examples

- `README.md`, `docs/*.md`, generated API docs, templates, and examples must
  agree on imports, subpaths, side effects, and command snippets.
- Examples must be copyable without funded keys or irreversible actions by
  default.
- Docs must state setup assumptions, return types, side effects, failure modes,
  and the validation command for the workflow.
- Packaged docs and examples are part of the developer experience, not release
  leftovers.

## Agent-Friendly Usage

- Agents should be able to start from `README.md`, `SDK_RUNTIME.json`, or
  `examples/README.md` and discover the safe entrypoint for each lane.
- Prefer obvious import surfaces and deterministic commands over prose-only
  guidance.
- Keep first-action flows small: connect, derive/read, build unsigned intent,
  validate signed intent, then broadcast only when the caller explicitly asks.
- Do not rely on ambient env vars except documented unsafe/test-only paths.

## Release Gates

Before handoff for broad or release-sensitive SDK work, run:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run docs:api:check
npm run docs:check
npm run docs:sync:check:strict
npm run runtime:check
npm run protocol:artifact:check
npm run examples:check
npm run dogfood:consumer
npm run cli:check
npm run templates:check
npm run dx:smoke
npm run release:state
npm run security:secrets
npm run security:install-scripts
npm run security:release-governance
npm run security:package
npm run audit:prod
npm pack --dry-run
```

Run `npm run verify:release:protocol` before tagging or publishing when protocol
parity is in scope.
