# Robinhood and Virtuals launch integration

This SDK deliberately separates three things that are easy to blur during a
token launch: Nakama's health-protection product contracts, Virtuals' official
launch contracts/process, and an offline packet describing the intended launch.
Only the third is implemented here today.

## What the SDK does

`validateVirtualsLaunchPacketStructure(...)` validates an in-memory or decoded
packet before it reaches a signer. It requires:

- Robinhood mainnet chain `4663` and CAIP-2 `eip155:4663`;
- a `pegasus` or `unicorn` launch-class label;
- nonzero, unique addresses and runtime hashes for `virtualToken`, `bonding`,
  `bondingConfig`, `agentFactory`, and `acp`;
- canonical Robinhood mainnet Global Dollar (`USDG`) with exact metadata;
- verified-owner records and resolvable owner references for every recipient
  that claims one;
- unique recipient addresses and one combined allocation per recipient, making
  wallet concentration visible;
- exactly 100% token allocation and exactly 100% creator/ACP fee-share splits;
- an exact set of contract code hashes in the simulation record;
- strict UTC ISO timestamps and monotonic simulation/finality observations;
- contract evidence no newer than the finalized configuration snapshot; and
- a finalized config/simulation observation below safe head and chain head.

The decoder accepts bigints serialized as strings such as `"1000n"`. The
validated object keeps them as native `bigint` values.

## What the SDK does not prove

The validator performs no RPC, identity, legal, sanctions, platform, or launch
API call. A malicious caller can write `legalReviewPassed: true`, copy a random
hash, or mark an owner as verified. Passing means the supplied fields are
complete and internally consistent; it does not mean:

- Virtuals accepted, endorsed, or will promote the project;
- the launch class, fee split, threshold, or contract addresses are current;
- counsel approved the token or health-product structure;
- the founder/entity is eligible in Malaysia or another jurisdiction;
- a beneficial owner passed KYC, KYB, sanctions, or platform review;
- the listed bytecode exists on Robinhood Chain;
- the simulation was run against the exact current configuration; or
- a token has been created, signed, broadcast, or finalized.

These are deliberate boundaries. Virtuals and Robinhood configuration can
change, so production tooling must source it from official current interfaces,
not constants guessed into this package.

## Required production workflow

1. **Approve the product.** Confirm paid-user evidence, risk controls, token
   utility, health-data boundaries, and the intended relationship between the
   Nakama product and token. A launch should not fund an unvalidated promise.
2. **Resolve people and law.** Complete entity, beneficial-owner, jurisdiction,
   Malaysia nexus, KYC/KYB, sanctions, securities/token, consumer, and health
   claims review. Persist evidence references, not private documents or PHI, in
   the packet.
3. **Obtain current Virtuals configuration.** Read the official platform's
   Robinhood support, contract addresses, launch class, economics, eligibility,
   and approval status. Do not infer these from social posts.
4. **Verify onchain code.** At one pinned Robinhood block, fetch every contract's
   runtime code, hash it, confirm source/role, and record the configuration
   commitment. Require nonzero, unique addresses.
5. **Resolve token routing.** Map every fee and allocation recipient to a known
   address and beneficial owner where applicable. Combine allocations to the
   same recipient before calculating concentration.
6. **Simulate the exact official call.** Use the official ABI and current
   configuration at the pinned block. Bind calldata, value, assets, allocations,
   code hashes, and the human-reviewed packet with commitments.
7. **Wait for finalized observation.** Re-read config and canonical block hashes,
   ensuring contract evidence, config, and simulation are not ahead of finalized
   state.
8. **Run structural validation.** Call
   `validateVirtualsLaunchPacketStructure(...)` as the final local consistency
   gate, knowing it is not external evidence.
9. **Show the exact launch to signers.** Display token identity, supply,
   allocation concentration, locks, fee recipients, spend/value, contract
   targets, and commitments. Use the platform's official signing surface.
10. **Observe outcome.** Record transaction replacement, revert, reorg, L1
    posting, and finalization separately. Publish addresses only after canonical
    finality and independent verification.

## Integration seam to implement after approval

Keep any live Virtuals adapter outside the pure validator. It should expose
read-only configuration discovery, code/source verification, exact call
construction, simulation, and outcome observation as separate capabilities.
The signing method should accept only a successful simulation plus an approval
packet, never an arbitrary `to/data/value` triple.

The adapter should be versioned by verified Virtuals contract release and
Robinhood network. If the official ABI, economics, or launch path cannot be
proven current, it must fail closed and ask for a reviewed configuration update.

## Health-data boundary

No diagnosis, claim narrative, medical record, eligibility document, identity
document, or raw evidence belongs in a launch packet or public token metadata.
Use commitments to versioned offchain manifests, with access control and
retention defined by the product system. Public reason codes must be deliberately
non-sensitive.

## Current readiness

- Nakama Robinhood ABIs: imported and checksum-bound.
- Nakama Robinhood deployments: unconfigured and unaudited.
- Canonical mainnet USDG identity: configured; live RPC verification is still
  required at runtime.
- Virtuals packet structural validation: implemented and tested.
- Official Virtuals live configuration/discovery adapter: not implemented.
- Launch signing/broadcast: intentionally not implemented.
- Virtuals approval, legal clearance, and beneficial-owner evidence: external
  prerequisites.
