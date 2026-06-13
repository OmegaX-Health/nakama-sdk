import test from 'node:test';
import assert from 'node:assert/strict';

import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import {
  OBLIGATION_DELIVERY_MODE_CLAIMABLE,
  OBLIGATION_DELIVERY_MODE_PAYABLE,
  OBLIGATION_STATUS_CANCELED,
  OBLIGATION_STATUS_CLAIMABLE_PAYABLE,
  OBLIGATION_STATUS_SETTLED,
  SERIES_MODE_REWARD,
  SERIES_STATUS_ACTIVE,
  buildAdjudicateClaimCaseTx,
  buildAuthorizeClaimRecipientTx,
  buildCreateDomainAssetVaultTx,
  buildCreateHealthPlanTx,
  buildCreateObligationTx,
  buildCreatePolicySeriesTx,
  buildCreateReserveDomainTx,
  buildDepositReserveCapitalTx,
  buildFundSponsorBudgetTx,
  buildOpenClaimCaseTx,
  buildOpenFundingLineTx,
  buildRecordPremiumPaymentTx,
  buildRecordReserveEarningsTx,
  buildReleaseReserveTx,
  buildReserveObligationTx,
  buildReturnReserveCapitalTx,
  buildSettleClaimCaseTx,
  buildSettleObligationTx,
  buildUpdateHealthPlanControlsTx,
  buildUpdateReserveDomainControlsTx,
  buildVersionPolicySeriesTx,
  createConnection,
  createProtocolClient,
  createRpcClient,
  deriveClaimCasePda,
  deriveDomainAssetLedgerPda,
  deriveDomainAssetVaultPda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveFundingLineLedgerPda,
  deriveFundingLinePda,
  deriveHealthPlanPda,
  deriveObligationPda,
  derivePlanReserveLedgerPda,
  derivePolicySeriesPda,
  deriveReserveDomainPda,
  recomputeReserveBalanceSheet,
  type ProtocolClient,
} from '../src/index.js';

// Canonical 21-instruction localnet smoke. The protocol surface was trimmed to
// the reserve-domain → vault → plan → series → funding-line → capital →
// obligation → claim lifecycle, so this test drives every surviving builder end
// to end against a live validator and asserts on the surviving on-chain
// accounts (ReserveDomain, DomainAssetVault, DomainAssetLedger, HealthPlan,
// PlanReserveLedger, PolicySeries, FundingLine, FundingLineLedger,
// CapitalContribution, Obligation, ClaimCase).

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const MINT_ACCOUNT_SIZE = 82;
const TOKEN_ACCOUNT_SIZE = 165;

const FUNDING_LINE_TYPE_SPONSOR_BUDGET = 0;
const FUNDING_LINE_TYPE_PREMIUM_INCOME = 1;
const FUNDING_LINE_TYPE_BACKSTOP = 3;

// Distinct 32-byte proof/terms fingerprints used across the lifecycle.
const HASH = (byte: number) => Buffer.alloc(32, byte).toString('hex');

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for the SDK localnet smoke test`);
  }
  return value;
}

function keypairFromEnv(name: string): Keypair | null {
  const value = process.env[name]?.trim();
  if (!value) return null;

  const secretKey = JSON.parse(value) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

async function sleep(ms: number) {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function airdrop(
  connection: ReturnType<typeof createConnection>,
  address: Keypair['publicKey'],
  lamports: number,
) {
  const maxChunkLamports = 1_000_000_000;
  let remaining = lamports;

  while (remaining > 0) {
    const chunkLamports = Math.min(remaining, maxChunkLamports);
    await requestAirdropChunk(connection, address, chunkLamports);
    remaining -= chunkLamports;
  }
}

async function requestAirdropChunk(
  connection: ReturnType<typeof createConnection>,
  address: Keypair['publicKey'],
  lamports: number,
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const signature = await connection.requestAirdrop(address, lamports);
      const latest = await connection.getLatestBlockhash('confirmed');
      await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        'confirmed',
      );
      return;
    } catch (error) {
      lastError = error;
      await sleep(300 * (attempt + 1));
    }
  }

  throw new Error(
    `airdrop to ${address.toBase58()} failed after retries: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

function coptionPublicKeyBytes(value: PublicKey | null): Buffer {
  if (!value) return Buffer.from([0]);
  return Buffer.concat([Buffer.from([1]), Buffer.from(value.toBytes())]);
}

function u64Bytes(value: bigint): Buffer {
  const data = Buffer.alloc(8);
  data.writeBigUInt64LE(value);
  return data;
}

function createInitializeMintInstruction(params: {
  mint: PublicKey;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey | null;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: params.mint, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([0, params.decimals]),
      Buffer.from(params.mintAuthority.toBytes()),
      coptionPublicKeyBytes(params.freezeAuthority),
    ]),
  });
}

function createInitializeAccountInstruction(params: {
  account: PublicKey;
  mint: PublicKey;
  owner: PublicKey;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: params.account, isSigner: false, isWritable: true },
      { pubkey: params.mint, isSigner: false, isWritable: false },
      { pubkey: params.owner, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]),
  });
}

function createMintToInstruction(params: {
  mint: PublicKey;
  destination: PublicKey;
  authority: PublicKey;
  amount: bigint;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: params.mint, isSigner: false, isWritable: true },
      { pubkey: params.destination, isSigner: false, isWritable: true },
      { pubkey: params.authority, isSigner: true, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from([7]), u64Bytes(params.amount)]),
  });
}

async function sendTokenSetupTransaction(params: {
  connection: ReturnType<typeof createConnection>;
  payer: Keypair;
  signers: Keypair[];
  instructions: TransactionInstruction[];
}) {
  await sendAndConfirmTransaction(
    params.connection,
    new Transaction().add(...params.instructions),
    [params.payer, ...params.signers],
    { commitment: 'confirmed' },
  );
}

async function createClassicMint(params: {
  connection: ReturnType<typeof createConnection>;
  payer: Keypair;
  mintAuthority: PublicKey;
  decimals: number;
}): Promise<PublicKey> {
  const mint = Keypair.generate();
  const lamports =
    await params.connection.getMinimumBalanceForRentExemption(
      MINT_ACCOUNT_SIZE,
    );
  await sendTokenSetupTransaction({
    connection: params.connection,
    payer: params.payer,
    signers: [mint],
    instructions: [
      SystemProgram.createAccount({
        fromPubkey: params.payer.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports,
        space: MINT_ACCOUNT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction({
        mint: mint.publicKey,
        decimals: params.decimals,
        mintAuthority: params.mintAuthority,
        freezeAuthority: null,
      }),
    ],
  });
  return mint.publicKey;
}

async function createClassicTokenAccount(params: {
  connection: ReturnType<typeof createConnection>;
  payer: Keypair;
  mint: PublicKey;
  owner: PublicKey;
}): Promise<PublicKey> {
  const account = Keypair.generate();
  const lamports =
    await params.connection.getMinimumBalanceForRentExemption(
      TOKEN_ACCOUNT_SIZE,
    );
  await sendTokenSetupTransaction({
    connection: params.connection,
    payer: params.payer,
    signers: [account],
    instructions: [
      SystemProgram.createAccount({
        fromPubkey: params.payer.publicKey,
        newAccountPubkey: account.publicKey,
        lamports,
        space: TOKEN_ACCOUNT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeAccountInstruction({
        account: account.publicKey,
        mint: params.mint,
        owner: params.owner,
      }),
    ],
  });
  return account.publicKey;
}

async function mintClassicTokens(params: {
  connection: ReturnType<typeof createConnection>;
  payer: Keypair;
  mint: PublicKey;
  destination: PublicKey;
  authority: Keypair;
  amount: bigint;
}) {
  await sendTokenSetupTransaction({
    connection: params.connection,
    payer: params.payer,
    signers: [params.authority],
    instructions: [
      createMintToInstruction({
        mint: params.mint,
        destination: params.destination,
        authority: params.authority.publicKey,
        amount: params.amount,
      }),
    ],
  });
}

async function tokenBalance(
  connection: ReturnType<typeof createConnection>,
  account: PublicKey,
): Promise<bigint> {
  const info = await connection.getAccountInfo(account, 'confirmed');
  if (!info) {
    throw new Error(`token account ${account.toBase58()} not found`);
  }
  // SPL token amount is a u64 at offset 64 of the token-account data.
  return Buffer.from(info.data).readBigUInt64LE(64);
}

test('sdk live localnet smoke drives the canonical 21-instruction protocol lifecycle', async () => {
  const rpcUrl = requiredEnv('SOLANA_RPC_URL');
  const programId = requiredEnv('PROTOCOL_PROGRAM_ID');
  const connection = createConnection({
    network: 'devnet',
    rpcUrl,
    commitment: 'confirmed',
    warnOnComingSoon: false,
  });
  const rpc = createRpcClient(connection);
  const protocol: ProtocolClient = createProtocolClient(connection, programId);

  const adminFromFixture = keypairFromEnv('OMEGAX_SDK_E2E_ADMIN_KEYPAIR');
  const memberFromFixture = keypairFromEnv('OMEGAX_SDK_E2E_MEMBER_KEYPAIR');
  const admin = adminFromFixture ?? Keypair.generate();
  const member = memberFromFixture ?? Keypair.generate();

  if (!adminFromFixture) {
    await airdrop(connection, admin.publicKey, 5_000_000_000);
  }
  if (!memberFromFixture) {
    await airdrop(connection, member.publicKey, 5_000_000_000);
  }

  // A real SPL mint backs the whole flow; admin custodies the source liquidity
  // and the member is the claimant/recipient of the settled claim payout.
  const assetMintKey = await createClassicMint({
    connection,
    payer: admin,
    mintAuthority: admin.publicKey,
    decimals: 6,
  });
  const assetMint = assetMintKey.toBase58();

  const adminSourceTokenAccountKey = await createClassicTokenAccount({
    connection,
    payer: admin,
    mint: assetMintKey,
    owner: admin.publicKey,
  });
  const memberRecipientTokenAccountKey = await createClassicTokenAccount({
    connection,
    payer: admin,
    mint: assetMintKey,
    owner: member.publicKey,
  });
  await mintClassicTokens({
    connection,
    payer: admin,
    mint: assetMintKey,
    destination: adminSourceTokenAccountKey,
    authority: admin,
    amount: 1_000_000n,
  });

  const adminSourceTokenAccount = adminSourceTokenAccountKey.toBase58();
  const memberRecipientTokenAccount = memberRecipientTokenAccountKey.toBase58();

  // Canonical PDAs for the surviving account surface.
  const reserveDomain = deriveReserveDomainPda({
    domainId: 'sdk-domain',
    programId,
  }).toBase58();
  const domainAssetVault = deriveDomainAssetVaultPda({
    reserveDomain,
    assetMint,
    programId,
  }).toBase58();
  const vaultTokenAccountKey = deriveDomainAssetVaultTokenAccountPda({
    reserveDomain,
    assetMint,
    programId,
  });
  const domainAssetLedger = deriveDomainAssetLedgerPda({
    reserveDomain,
    assetMint,
    programId,
  }).toBase58();
  const healthPlan = deriveHealthPlanPda({
    reserveDomain,
    planId: 'sdk-plan',
    programId,
  }).toBase58();
  const policySeries = derivePolicySeriesPda({
    healthPlan,
    seriesId: 'sdk-series-v1',
    programId,
  }).toBase58();
  const nextPolicySeries = derivePolicySeriesPda({
    healthPlan,
    seriesId: 'sdk-series-v2',
    programId,
  }).toBase58();
  const planReserveLedger = derivePlanReserveLedgerPda({
    healthPlan,
    assetMint,
    programId,
  }).toBase58();

  const sponsorLine = deriveFundingLinePda({
    healthPlan,
    lineId: 'sdk-sponsor',
    programId,
  }).toBase58();
  const premiumLine = deriveFundingLinePda({
    healthPlan,
    lineId: 'sdk-premium',
    programId,
  }).toBase58();
  const backstopLine = deriveFundingLinePda({
    healthPlan,
    lineId: 'sdk-backstop',
    programId,
  }).toBase58();
  const sponsorLineLedger = deriveFundingLineLedgerPda({
    fundingLine: sponsorLine,
    assetMint,
    programId,
  }).toBase58();
  const premiumLineLedger = deriveFundingLineLedgerPda({
    fundingLine: premiumLine,
    assetMint,
    programId,
  }).toBase58();
  const backstopLineLedger = deriveFundingLineLedgerPda({
    fundingLine: backstopLine,
    assetMint,
    programId,
  }).toBase58();

  const payableObligation = deriveObligationPda({
    fundingLine: sponsorLine,
    obligationId: 'sdk-payable',
    programId,
  }).toBase58();
  const releasedObligation = deriveObligationPda({
    fundingLine: sponsorLine,
    obligationId: 'sdk-released',
    programId,
  }).toBase58();
  const claimCase = deriveClaimCasePda({
    healthPlan,
    claimId: 'sdk-claim',
    programId,
  }).toBase58();

  // Builders set feePayer + recentBlockhash and derive every PDA internally;
  // we only fetch a fresh blockhash, sign, and broadcast against the validator.
  const send = async (label: string, tx: Transaction, signers: Keypair[]) => {
    tx.recentBlockhash = await rpc.getRecentBlockhash();
    try {
      await sendAndConfirmTransaction(connection, tx, signers, {
        commitment: 'confirmed',
      });
    } catch (error) {
      const logs =
        error && typeof error === 'object' && 'logs' in error
          ? `\n${(error as { logs?: string[] }).logs?.join('\n') ?? ''}`
          : '';
      throw new Error(
        `${label} failed: ${
          error instanceof Error ? error.message : String(error)
        }${logs}`,
      );
    }
  };

  const blockhash = () => rpc.getRecentBlockhash();

  // 1. create_reserve_domain
  await send(
    'create_reserve_domain',
    buildCreateReserveDomainTx({
      authority: admin.publicKey,
      recentBlockhash: await blockhash(),
      domainId: 'sdk-domain',
      displayName: 'SDK Domain',
      settlementMode: 0,
      legalStructureHashHex: HASH(1),
      complianceBaselineHashHex: HASH(2),
      allowedRailMask: 1,
      pauseFlags: 0,
      programId,
    }),
    [admin],
  );

  // 2. create_domain_asset_vault (binds the real SPL mint to a PDA vault).
  await send(
    'create_domain_asset_vault',
    buildCreateDomainAssetVaultTx({
      authority: admin.publicKey,
      reserveDomainAddress: reserveDomain,
      assetMint,
      recentBlockhash: await blockhash(),
      programId,
    }),
    [admin],
  );

  // 3. create_health_plan
  await send(
    'create_health_plan',
    buildCreateHealthPlanTx({
      planAdmin: admin.publicKey,
      reserveDomainAddress: reserveDomain,
      recentBlockhash: await blockhash(),
      planId: 'sdk-plan',
      displayName: 'SDK Health Plan',
      organizationRef: 'sdk-smoke',
      metadataUri: 'https://docs.omegax.health/sdk/health-plan',
      sponsor: admin.publicKey,
      sponsorOperator: admin.publicKey,
      claimsOperator: admin.publicKey,
      oracleAuthority: admin.publicKey,
      allowedRailMask: 1,
      defaultFundingPriority: 1,
      oraclePolicyHashHex: HASH(3),
      schemaBindingHashHex: HASH(4),
      complianceBaselineHashHex: HASH(5),
      pauseFlags: 0,
      programId,
    }),
    [admin],
  );

  // 4. create_policy_series
  await send(
    'create_policy_series',
    buildCreatePolicySeriesTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      assetMint,
      recentBlockhash: await blockhash(),
      seriesId: 'sdk-series-v1',
      displayName: 'SDK Series v1',
      metadataUri: 'https://docs.omegax.health/sdk/series-v1',
      mode: SERIES_MODE_REWARD,
      status: SERIES_STATUS_ACTIVE,
      adjudicationMode: 0,
      termsHashHex: HASH(6),
      pricingHashHex: HASH(7),
      payoutHashHex: HASH(8),
      reserveModelHashHex: HASH(9),
      comparabilityHashHex: HASH(10),
      policyOverridesHashHex: HASH(11),
      cycleSeconds: 2_592_000n,
      termsVersion: 1,
      programId,
    }),
    [admin],
  );

  // 5. version_policy_series (supersede v1 with v2)
  await send(
    'version_policy_series',
    buildVersionPolicySeriesTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      currentPolicySeriesAddress: policySeries,
      recentBlockhash: await blockhash(),
      seriesId: 'sdk-series-v2',
      displayName: 'SDK Series v2',
      metadataUri: 'https://docs.omegax.health/sdk/series-v2',
      status: SERIES_STATUS_ACTIVE,
      adjudicationMode: 0,
      termsHashHex: HASH(12),
      pricingHashHex: HASH(13),
      payoutHashHex: HASH(14),
      reserveModelHashHex: HASH(15),
      comparabilityHashHex: HASH(16),
      policyOverridesHashHex: HASH(17),
      cycleSeconds: 2_592_000n,
      programId,
    }),
    [admin],
  );

  // 6. update_reserve_domain_controls (idempotent control refresh)
  await send(
    'update_reserve_domain_controls',
    buildUpdateReserveDomainControlsTx({
      authority: admin.publicKey,
      reserveDomainAddress: reserveDomain,
      recentBlockhash: await blockhash(),
      allowedRailMask: 1,
      pauseFlags: 0,
      active: true,
      reasonHashHex: HASH(18),
      programId,
    }),
    [admin],
  );

  // 7. update_health_plan_controls (idempotent control refresh)
  await send(
    'update_health_plan_controls',
    buildUpdateHealthPlanControlsTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      recentBlockhash: await blockhash(),
      sponsorOperator: admin.publicKey,
      claimsOperator: admin.publicKey,
      oracleAuthority: admin.publicKey,
      allowedRailMask: 1,
      defaultFundingPriority: 1,
      oraclePolicyHashHex: HASH(3),
      schemaBindingHashHex: HASH(4),
      complianceBaselineHashHex: HASH(5),
      pauseFlags: 0,
      active: true,
      reasonHashHex: HASH(19),
      programId,
    }),
    [admin],
  );

  // 8-10. Three funding lines, one per inflow rail type.
  await send(
    'open_funding_line:sponsor',
    buildOpenFundingLineTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      assetMint,
      recentBlockhash: await blockhash(),
      lineId: 'sdk-sponsor',
      policySeriesAddress: policySeries,
      lineType: FUNDING_LINE_TYPE_SPONSOR_BUDGET,
      fundingPriority: 1,
      committedAmount: 1_000_000n,
      capsHashHex: HASH(20),
      programId,
    }),
    [admin],
  );
  await send(
    'open_funding_line:premium',
    buildOpenFundingLineTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      assetMint,
      recentBlockhash: await blockhash(),
      lineId: 'sdk-premium',
      policySeriesAddress: policySeries,
      lineType: FUNDING_LINE_TYPE_PREMIUM_INCOME,
      fundingPriority: 1,
      committedAmount: 1_000_000n,
      capsHashHex: HASH(21),
      programId,
    }),
    [admin],
  );
  await send(
    'open_funding_line:backstop',
    buildOpenFundingLineTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      assetMint,
      recentBlockhash: await blockhash(),
      lineId: 'sdk-backstop',
      policySeriesAddress: policySeries,
      lineType: FUNDING_LINE_TYPE_BACKSTOP,
      fundingPriority: 1,
      committedAmount: 1_000_000n,
      capsHashHex: HASH(22),
      programId,
    }),
    [admin],
  );

  // 11. fund_sponsor_budget: +300_000 into the sponsor line.
  await send(
    'fund_sponsor_budget',
    buildFundSponsorBudgetTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      sourceTokenAccountAddress: adminSourceTokenAccount,
      recentBlockhash: await blockhash(),
      amount: 300_000n,
      programId,
    }),
    [admin],
  );

  // 12. record_premium_payment: +100_000 into the premium line.
  await send(
    'record_premium_payment',
    buildRecordPremiumPaymentTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: premiumLine,
      assetMint,
      sourceTokenAccountAddress: adminSourceTokenAccount,
      recentBlockhash: await blockhash(),
      amount: 100_000n,
      programId,
    }),
    [admin],
  );

  // 13. deposit_reserve_capital: +200_000 into the backstop line (admin LP).
  await send(
    'deposit_reserve_capital',
    buildDepositReserveCapitalTx({
      contributor: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: backstopLine,
      assetMint,
      sourceTokenAccountAddress: adminSourceTokenAccount,
      recentBlockhash: await blockhash(),
      amount: 200_000n,
      termsHashHex: HASH(23),
      programId,
    }),
    [admin],
  );

  // 14. record_reserve_earnings: +50_000 yield into the backstop line.
  await send(
    'record_reserve_earnings',
    buildRecordReserveEarningsTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: backstopLine,
      assetMint,
      sourceTokenAccountAddress: adminSourceTokenAccount,
      recentBlockhash: await blockhash(),
      amount: 50_000n,
      earningsRefHashHex: HASH(24),
      programId,
    }),
    [admin],
  );

  // 15. return_reserve_capital: -50_000 of the admin LP contribution.
  await send(
    'return_reserve_capital',
    buildReturnReserveCapitalTx({
      authority: admin.publicKey,
      contributorAddress: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: backstopLine,
      assetMint,
      recipientTokenAccountAddress: adminSourceTokenAccount,
      recentBlockhash: await blockhash(),
      amount: 50_000n,
      reasonHashHex: HASH(25),
      programId,
    }),
    [admin],
  );

  // 16. create_obligation (payable, settled to the admin treasury account).
  await send(
    'create_obligation:payable',
    buildCreateObligationTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      recentBlockhash: await blockhash(),
      obligationId: 'sdk-payable',
      policySeriesAddress: policySeries,
      memberWalletAddress: member.publicKey,
      beneficiaryAddress: member.publicKey,
      deliveryMode: OBLIGATION_DELIVERY_MODE_PAYABLE,
      amount: 60_000n,
      creationReasonHashHex: HASH(26),
      programId,
    }),
    [admin],
  );

  // 17. reserve_obligation against the payable obligation.
  await send(
    'reserve_obligation:payable',
    buildReserveObligationTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      obligationAddress: payableObligation,
      recentBlockhash: await blockhash(),
      amount: 60_000n,
      programId,
    }),
    [admin],
  );

  // 18a. settle_obligation: RESERVED -> CLAIMABLE_PAYABLE (move into payable).
  await send(
    'settle_obligation:claimable',
    buildSettleObligationTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      obligationAddress: payableObligation,
      recentBlockhash: await blockhash(),
      nextStatus: OBLIGATION_STATUS_CLAIMABLE_PAYABLE,
      amount: 60_000n,
      settlementReasonHashHex: HASH(27),
      memberPositionAddress: member.publicKey,
      vaultTokenAccountAddress: vaultTokenAccountKey,
      recipientTokenAccountAddress: adminSourceTokenAccount,
      tokenProgramId: TOKEN_PROGRAM_ID,
      programId,
    }),
    [admin],
  );

  // 18b. settle_obligation: CLAIMABLE_PAYABLE -> SETTLED (real SPL outflow).
  await send(
    'settle_obligation:settled',
    buildSettleObligationTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      obligationAddress: payableObligation,
      recentBlockhash: await blockhash(),
      nextStatus: OBLIGATION_STATUS_SETTLED,
      amount: 60_000n,
      settlementReasonHashHex: HASH(28),
      memberPositionAddress: member.publicKey,
      vaultTokenAccountAddress: vaultTokenAccountKey,
      recipientTokenAccountAddress: adminSourceTokenAccount,
      tokenProgramId: TOKEN_PROGRAM_ID,
      programId,
    }),
    [admin],
  );

  // 19. create_obligation (claimable) + reserve, then release the reserve.
  await send(
    'create_obligation:released',
    buildCreateObligationTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      recentBlockhash: await blockhash(),
      obligationId: 'sdk-released',
      policySeriesAddress: policySeries,
      memberWalletAddress: member.publicKey,
      beneficiaryAddress: member.publicKey,
      deliveryMode: OBLIGATION_DELIVERY_MODE_CLAIMABLE,
      amount: 40_000n,
      creationReasonHashHex: HASH(29),
      programId,
    }),
    [admin],
  );
  await send(
    'reserve_obligation:released',
    buildReserveObligationTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      obligationAddress: releasedObligation,
      recentBlockhash: await blockhash(),
      amount: 40_000n,
      programId,
    }),
    [admin],
  );
  // release_reserve: drains the full reserve -> obligation becomes CANCELED.
  await send(
    'release_reserve',
    buildReleaseReserveTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: sponsorLine,
      assetMint,
      obligationAddress: releasedObligation,
      recentBlockhash: await blockhash(),
      amount: 40_000n,
      programId,
    }),
    [admin],
  );

  // 20. open_claim_case (direct claim, member is claimant) on the premium line.
  await send(
    'open_claim_case',
    buildOpenClaimCaseTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      fundingLineAddress: premiumLine,
      recentBlockhash: await blockhash(),
      claimId: 'sdk-claim',
      policySeriesAddress: policySeries,
      claimantAddress: member.publicKey,
      evidenceRefHashHex: HASH(30),
      programId,
    }),
    [admin],
  );

  // 21a. authorize_claim_recipient: claimant delegates payout to its own wallet.
  await send(
    'authorize_claim_recipient',
    buildAuthorizeClaimRecipientTx({
      authority: member.publicKey,
      claimCaseAddress: claimCase,
      recentBlockhash: await blockhash(),
      delegateRecipient: member.publicKey,
      programId,
    }),
    [member],
  );

  // 21b. adjudicate_claim_case: approve 30_000 with proof fingerprints.
  await send(
    'adjudicate_claim_case',
    buildAdjudicateClaimCaseTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      claimCaseAddress: claimCase,
      recentBlockhash: await blockhash(),
      reviewState: 1,
      approvedAmount: 30_000n,
      deniedAmount: 0n,
      reserveAmount: 0n,
      evidenceRefHashHex: HASH(30),
      decisionSupportHashHex: HASH(31),
      programId,
    }),
    [admin],
  );

  // 21c. settle_claim_case: pay 30_000 to the member recipient token account.
  await send(
    'settle_claim_case',
    buildSettleClaimCaseTx({
      authority: admin.publicKey,
      healthPlanAddress: healthPlan,
      reserveDomainAddress: reserveDomain,
      fundingLineAddress: premiumLine,
      assetMint,
      claimCaseAddress: claimCase,
      recentBlockhash: await blockhash(),
      amount: 30_000n,
      memberPositionAddress: member.publicKey,
      vaultTokenAccountAddress: vaultTokenAccountKey,
      recipientTokenAccountAddress: memberRecipientTokenAccount,
      tokenProgramId: TOKEN_PROGRAM_ID,
      programId,
    }),
    [admin],
  );

  // ----- On-chain state assertions across the surviving account surface -----

  const fetchedDomain = (await protocol.fetchReserveDomain(reserveDomain)) as {
    domain_id: string;
    active: boolean;
  } | null;
  assert.ok(fetchedDomain, 'expected live ReserveDomain account');
  assert.equal(fetchedDomain.domain_id, 'sdk-domain');
  assert.equal(fetchedDomain.active, true);

  const fetchedVault = (await protocol.fetchDomainAssetVault(
    domainAssetVault,
  )) as { asset_mint: string; total_assets: bigint } | null;
  assert.ok(fetchedVault, 'expected live DomainAssetVault account');
  assert.equal(fetchedVault.asset_mint, assetMint);
  // Inflows 650_000 - return 50_000 - payable settle 60_000 - claim 30_000.
  assert.equal(fetchedVault.total_assets, 510_000n);

  const fetchedPlan = (await protocol.fetchHealthPlan(healthPlan)) as {
    health_plan_id: string;
    active: boolean;
  } | null;
  assert.ok(fetchedPlan, 'expected live HealthPlan account');
  assert.equal(fetchedPlan.health_plan_id, 'sdk-plan');
  assert.equal(fetchedPlan.active, true);

  const fetchedSeries = (await protocol.fetchPolicySeries(policySeries)) as {
    series_id: string;
    mode: number;
    successor_series: string;
  } | null;
  assert.ok(fetchedSeries, 'expected live PolicySeries account');
  assert.equal(fetchedSeries.series_id, 'sdk-series-v1');
  assert.equal(fetchedSeries.mode, SERIES_MODE_REWARD);
  assert.equal(
    fetchedSeries.successor_series,
    nextPolicySeries,
    'v1 should point at its v2 successor',
  );

  const fetchedNextSeries = (await protocol.fetchPolicySeries(
    nextPolicySeries,
  )) as { series_id: string; prior_series: string } | null;
  assert.ok(fetchedNextSeries, 'expected live successor PolicySeries account');
  assert.equal(fetchedNextSeries.series_id, 'sdk-series-v2');
  assert.equal(fetchedNextSeries.prior_series, policySeries);

  const fetchedSponsorLine = (await protocol.fetchFundingLine(sponsorLine)) as {
    funded_amount: bigint;
    spent_amount: bigint;
  } | null;
  assert.ok(fetchedSponsorLine, 'expected live sponsor FundingLine account');
  assert.equal(fetchedSponsorLine.funded_amount, 300_000n);
  assert.equal(
    fetchedSponsorLine.spent_amount,
    60_000n,
    'sponsor line spent the payable settlement',
  );

  const fetchedBackstopLine = (await protocol.fetchFundingLine(
    backstopLine,
  )) as { funded_amount: bigint; returned_amount: bigint } | null;
  assert.ok(fetchedBackstopLine, 'expected live backstop FundingLine account');
  // deposit 200_000 + earnings 50_000 - return 50_000.
  assert.equal(fetchedBackstopLine.funded_amount, 200_000n);
  assert.equal(fetchedBackstopLine.returned_amount, 50_000n);

  const fetchedPayable = (await protocol.fetchObligation(
    payableObligation,
  )) as { status: number; settled_amount: bigint } | null;
  assert.ok(fetchedPayable, 'expected live payable Obligation account');
  assert.equal(fetchedPayable.status, OBLIGATION_STATUS_SETTLED);
  assert.equal(fetchedPayable.settled_amount, 60_000n);

  const fetchedReleased = (await protocol.fetchObligation(
    releasedObligation,
  )) as { status: number; reserved_amount: bigint } | null;
  assert.ok(fetchedReleased, 'expected live released Obligation account');
  assert.equal(fetchedReleased.status, OBLIGATION_STATUS_CANCELED);
  assert.equal(fetchedReleased.reserved_amount, 0n);

  const fetchedClaim = (await protocol.fetchClaimCase(claimCase)) as {
    claimant: string;
    delegate_recipient: string;
    approved_amount: bigint;
    paid_amount: bigint;
    intake_status: number;
    linked_obligation: string;
  } | null;
  assert.ok(fetchedClaim, 'expected live ClaimCase account');
  assert.equal(fetchedClaim.claimant, member.publicKey.toBase58());
  assert.equal(fetchedClaim.delegate_recipient, member.publicKey.toBase58());
  assert.equal(fetchedClaim.approved_amount, 30_000n);
  assert.equal(fetchedClaim.paid_amount, 30_000n);
  // CLAIM_INTAKE_SETTLED == 4 once paid_amount reaches approved_amount.
  assert.equal(fetchedClaim.intake_status, 4);

  // Reserve balance-sheet readers still reconcile via recomputeReserveBalanceSheet.
  const fetchedDomainLedger = (await protocol.fetchDomainAssetLedger(
    domainAssetLedger,
  )) as { sheet: Record<string, unknown> } | null;
  assert.ok(fetchedDomainLedger, 'expected live DomainAssetLedger account');
  const domainSheet = recomputeReserveBalanceSheet(fetchedDomainLedger.sheet);
  // funded = inflows 650_000 - return 50_000 - obligation settle 60_000
  // - claim payout 30_000; settled = obligation 60_000 + claim 30_000.
  assert.equal(domainSheet.funded, 510_000n);
  assert.equal(domainSheet.settled, 90_000n);
  assert.equal(domainSheet.reserved, 0n);

  const fetchedPlanLedger = (await protocol.fetchPlanReserveLedger(
    planReserveLedger,
  )) as { sheet: Record<string, unknown> } | null;
  assert.ok(fetchedPlanLedger, 'expected live PlanReserveLedger account');
  const planSheet = recomputeReserveBalanceSheet(fetchedPlanLedger.sheet);
  assert.equal(planSheet.funded, 510_000n);
  assert.equal(planSheet.settled, 90_000n);
  assert.equal(planSheet.reserved, 0n);

  const fetchedPremiumLedger = (await protocol.fetchFundingLineLedger(
    premiumLineLedger,
  )) as { sheet: Record<string, unknown> } | null;
  assert.ok(
    fetchedPremiumLedger,
    'expected live premium FundingLineLedger account',
  );
  const premiumSheet = recomputeReserveBalanceSheet(fetchedPremiumLedger.sheet);
  // premium funded 100_000 - claim payout 30_000.
  assert.equal(premiumSheet.funded, 70_000n);
  assert.equal(premiumSheet.settled, 30_000n);

  const fetchedSponsorLedger = (await protocol.fetchFundingLineLedger(
    sponsorLineLedger,
  )) as { sheet: Record<string, unknown> } | null;
  assert.ok(
    fetchedSponsorLedger,
    'expected live sponsor FundingLineLedger account',
  );
  const sponsorSheet = recomputeReserveBalanceSheet(fetchedSponsorLedger.sheet);
  // sponsor funded 300_000 - payable obligation settle 60_000.
  assert.equal(sponsorSheet.funded, 240_000n);
  assert.equal(sponsorSheet.settled, 60_000n);
  assert.equal(sponsorSheet.reserved, 0n);

  const fetchedBackstopLedger = (await protocol.fetchFundingLineLedger(
    backstopLineLedger,
  )) as { sheet: Record<string, unknown> } | null;
  assert.ok(
    fetchedBackstopLedger,
    'expected live backstop FundingLineLedger account',
  );
  const backstopSheet = recomputeReserveBalanceSheet(
    fetchedBackstopLedger.sheet,
  );
  assert.equal(backstopSheet.funded, 200_000n);

  // Real SPL token movement: vault custodies inflows net of every outflow, the
  // member received the claim payout, and the admin treasury reflects funding,
  // the returned LP capital, and the payable obligation settlement.
  assert.equal(
    await tokenBalance(connection, vaultTokenAccountKey),
    510_000n,
    'vault token account holds net custody balance',
  );
  assert.equal(
    await tokenBalance(connection, memberRecipientTokenAccountKey),
    30_000n,
    'member received the settled claim payout',
  );
  // 1_000_000 minted - 300_000 sponsor - 100_000 premium - 200_000 deposit
  // - 50_000 earnings + 50_000 returned + 60_000 payable settle.
  assert.equal(
    await tokenBalance(connection, adminSourceTokenAccountKey),
    460_000n,
    'admin treasury reflects net funding and inbound settlements',
  );
});
