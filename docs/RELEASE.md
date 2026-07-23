# Robinhood SDK release procedure

This procedure publishes a package that truthfully reflects deployed state. The
current mainnet and testnet manifests are `unconfigured`, so the SDK can be
validated as implementation-ready but must not be described as live,
deployment-ready, audited, or Virtuals-approved.

## Release states

Keep these states separate because each has a different evidence threshold:

1. **Implementation-ready.** Source, generated artifacts, tests, docs,
   templates, examples, package consumer checks, and security gates pass against
   fail-closed manifests. This is the current target.
2. **Testnet deployment-ready.** All 12 contracts and testnet USDG are deployed,
   source-verified, runtime-verified, reviewed, and recorded in the testnet
   manifest. This does not imply mainnet readiness.
3. **Mainnet deployment-ready.** The exact release artifact is audited and
   approved, all 12 contracts plus canonical USDG are live and verified, and the
   mainnet manifest contains complete immutable evidence.
4. **Virtuals launch-ready.** Current platform approval, legal/entity/identity
   work, official launch configuration, ownership/allocation disclosure, and
   finalized simulation are complete outside this SDK. Structural packet
   validation alone never reaches this state.

## 1. Freeze and identify the protocol artifact

The protocol repository owns Solidity and the canonical artifact. Before SDK
import, require a reviewed protocol commit, compiler settings, source artifact,
standalone ABIs, creation/runtime hashes, component order, and deployment-code
commitment.

From the SDK repository:

```bash
npm run sync:robinhood-artifacts:check
```

If the reviewed protocol source intentionally changed:

```bash
npm run import:robinhood-contract
git diff -- contracts/robinhood src/generated/robinhood_protocol.ts
npm run sync:robinhood-artifacts:check
```

Review every ABI change as a public API/security change. Do not hand-edit the
import or generated TypeScript and do not import from an unreviewed working tree
for a release.

## 2. Deploy without weakening placeholders

Deployment tooling belongs to the protocol release, not this SDK. Keep each SDK
manifest `unconfigured` until deployment output is final and independently
reviewed. A deployed manifest must contain:

- exact network, chain ID, CAIP-2, protocol release, and 40-hex source commit;
- imported artifact-bundle SHA-256 and deployment transaction/block/hash;
- all 12 role addresses, ABI SHA-256 values, runtime bytecode hashes, and HTTPS
  source-verification URLs;
- exact USDG identity and verified status;
- `verified: true` only after full live runtime and suite-graph checks;
- `auditStatus: audited` plus the final audit-report SHA-256; and
- a release-approval SHA-256 produced by the authorized review process.

Addresses must be unique, nonzero, and mapped to their exact roles. A partial
deployment remains unconfigured; never fill unknown fields with zero addresses,
copied hashes, or temporary URLs to satisfy schema shape.

## 3. Verify the live release

Use independent, caller-selected Robinhood RPC endpoints to verify chain
identity, all 12 runtime hashes, USDG code/metadata, factory/component topology,
program IDs, registry links, and deployment-code commitment. Archive the
provider endpoints, observed block identities, verification results, and reviewer
approval outside the package without storing credentials.

The SDK's `verifyRobinhoodDeploymentRuntime(...)` produces an in-process proof
capability for consumers. It does not replace the deployment team's signed
release evidence and it cannot turn an unconfigured manifest into a deployment.

## 4. Reconcile public material

Update `SDK_RUNTIME.json`, deployment manifests, README, release notes, examples,
and any external launch/operations documentation from the same reviewed release.
Claims must match the narrowest proven state: implementation-ready, testnet,
mainnet, or Virtuals launch-ready.

Generate the API reference only from the canonical root:

```bash
npm run docs:api:generate
npm run docs:api:check
npm run docs:check
npm run runtime:check
```

Historical Ethereum/Solana docs can remain for provenance, but current entry
pages must route new consumers to Robinhood and label legacy subpaths explicitly.

## 5. Run the package gates

Run the aggregate verifier when its external documentation state is available:

```bash
npm run verify:release
```

For an explicit local gate sequence:

```bash
npm run security:secrets
npm run security:install-scripts
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run docs:api:check
npm run docs:check
npm run runtime:check
npm run protocol:artifact:check
npm run security:package
npm run audit:prod
npm run audit:packed-consumer
npm run examples:check
npm run dogfood:consumer
npm run cli:check
npm run templates:check
npm run dx:smoke
npm pack --dry-run
```

`docs:sync:check:strict`, live release-governance checks, and protocol deployment
verification require their external sources and credentials; record them as
separate evidence rather than skipping or faking them.

## 6. Inspect the packed consumer boundary

The tarball, rather than the source checkout, is what users install. Confirm:

- `dist/` contains root and `/robinhood` declarations/JavaScript;
- all 12 Robinhood ABIs, artifact, schema, and deployment manifests are present;
- canonical docs, examples, and templates are present;
- no source maps, environment files with secrets, private keys, local caches,
  deployment credentials, or unlisted files appear;
- a clean consumer can install with only `viem` as a production dependency; and
- legacy Solana peers remain optional and are unnecessary for canonical imports.

`npm run security:package` and `npm run audit:packed-consumer` enforce most of
this mechanically; still inspect `npm pack --dry-run` before publication.

## 7. Version and publish deliberately

Choose the version based on API compatibility, update package/runtime/release
notes together, and rerun every gate after the version change. Create the tag
from the exact reviewed clean commit, use the protected release workflow, and
verify registry provenance plus the installed package after publication.

Do not publish from a dirty worktree, an unreviewed artifact import, a partial
deployment manifest, or a local `npm publish` bypass. Package publication also
does not deploy contracts or launch a Virtuals token; those are separate,
approval-bound operations.

## 8. Post-release verification and rollback

Install the exact registry version in a fresh consumer, run the doctor against
the intended network/RPC, compare all public exports and artifact hashes, and
repeat live runtime verification. If evidence differs, stop new writes, preserve
the conflicting observations, and issue a corrected release through the normal
review path. Do not mutate an already published tarball or silently replace a
deployment manifest at the same version.
