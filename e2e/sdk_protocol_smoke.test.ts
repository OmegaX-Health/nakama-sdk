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
  CAPITAL_CLASS_RESTRICTION_OPEN,
  ELIGIBILITY_ELIGIBLE,
  OBLIGATION_DELIVERY_MODE_CLAIMABLE,
  OBLIGATION_STATUS_CLAIMABLE_PAYABLE,
  OBLIGATION_STATUS_SETTLED,
  REDEMPTION_POLICY_QUEUE_ONLY,
  SERIES_MODE_REWARD,
  SERIES_STATUS_ACTIVE,
  ZERO_PUBKEY,
  createConnection,
  createProtocolClient,
  createRpcClient,
  deriveCapitalClassPda,
  deriveDomainAssetLedgerPda,
  deriveDomainAssetVaultPda,
  deriveFundingLineLedgerPda,
  deriveFundingLinePda,
  deriveHealthPlanPda,
  deriveLiquidityPoolPda,
  deriveLpPositionPda,
  deriveMemberPositionPda,
  deriveObligationPda,
  derivePlanReserveLedgerPda,
  derivePolicySeriesPda,
  derivePoolClassLedgerPda,
  derivePoolTreasuryVaultPda,
  deriveProtocolGovernancePda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveReserveAssetRailPda,
  deriveReserveDomainPda,
  deriveSeriesReserveLedgerPda,
  recomputeReserveBalanceSheet,
  type ProtocolClient,
} from '../src/index.js';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey(
  'BPFLoaderUpgradeab1e11111111111111111111111',
);
const MINT_ACCOUNT_SIZE = 82;
const TOKEN_ACCOUNT_SIZE = 165;

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

function fixedHash(byte: number): Uint8Array {
  return Uint8Array.from({ length: 32 }, () => byte);
}

function deriveProgramDataAddress(programId: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [new PublicKey(programId).toBuffer()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
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

function signToBase64(
  tx: {
    partialSign: (...signers: Keypair[]) => void;
    serialize: (options: {
      requireAllSignatures: boolean;
      verifySignatures: boolean;
    }) => Uint8Array;
  },
  signers: Keypair[],
) {
  tx.partialSign(...signers);
  return Buffer.from(
    tx.serialize({ requireAllSignatures: true, verifySignatures: true }),
  ).toString('base64');
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

async function simulateAndBroadcast(params: {
  label: string;
  rpc: ReturnType<typeof createRpcClient>;
  tx: {
    partialSign: (...signers: Keypair[]) => void;
    serialize: (options: {
      requireAllSignatures: boolean;
      verifySignatures: boolean;
    }) => Uint8Array;
  };
  signers: Keypair[];
}) {
  const signedTxBase64 = signToBase64(params.tx, params.signers);
  let simulation = await params.rpc.simulateSignedTx({
    signedTxBase64,
    replaceRecentBlockhash: false,
    sigVerify: true,
  });
  for (let attempt = 0; attempt < 10 && !simulation.ok; attempt += 1) {
    const logs = simulation.logs.join('\n');
    if (
      !logs.includes('Program is not deployed') &&
      !logs.includes('Unsupported program id')
    ) {
      break;
    }
    await sleep(500);
    simulation = await params.rpc.simulateSignedTx({
      signedTxBase64,
      replaceRecentBlockhash: false,
      sigVerify: true,
    });
  }
  assert.equal(
    simulation.ok,
    true,
    `${params.label} simulation failed\n${String(simulation.err)}\n${simulation.logs.join('\n')}`,
  );

  const broadcast = await params.rpc.broadcastSignedTx({ signedTxBase64 });
  assert.equal(
    broadcast.status,
    'confirmed',
    `${params.label} did not confirm`,
  );
}

function asDynamicClient(
  client: ProtocolClient,
): ProtocolClient & Record<string, unknown> {
  return client as ProtocolClient & Record<string, unknown>;
}

test('sdk live localnet smoke exercises canonical reserve, plan, obligation, and capital flows', async () => {
  const rpcUrl = requiredEnv('SOLANA_RPC_URL');
  const programId = requiredEnv('PROTOCOL_PROGRAM_ID');
  const connection = createConnection({
    network: 'devnet',
    rpcUrl,
    commitment: 'confirmed',
    warnOnComingSoon: false,
  });
  const rpc = createRpcClient(connection);
  const protocol = asDynamicClient(createProtocolClient(connection, programId));

  const adminFromFixture = keypairFromEnv('OMEGAX_SDK_E2E_ADMIN_KEYPAIR');
  const memberFromFixture = keypairFromEnv('OMEGAX_SDK_E2E_MEMBER_KEYPAIR');
  const admin = adminFromFixture ?? Keypair.generate();
  const member = memberFromFixture ?? Keypair.generate();
  const shareMint = Keypair.generate().publicKey.toBase58();

  if (!adminFromFixture) {
    await airdrop(connection, admin.publicKey, 5_000_000_000);
  }
  if (!memberFromFixture) {
    await airdrop(connection, member.publicKey, 5_000_000_000);
  }

  const assetMintKey = await createClassicMint({
    connection,
    payer: admin,
    mintAuthority: admin.publicKey,
    decimals: 6,
  });
  const reserveDomain = deriveReserveDomainPda({
    domainId: 'sdk-open-domain',
    programId,
  }).toBase58();
  const domainAssetVaultKey = deriveDomainAssetVaultPda({
    reserveDomain,
    assetMint: assetMintKey,
    programId,
  });
  const vaultTokenAccountKey = deriveDomainAssetVaultTokenAccountPda({
    reserveDomain,
    assetMint: assetMintKey,
    programId,
  });
  const adminSourceTokenAccountKey = await createClassicTokenAccount({
    connection,
    payer: admin,
    mint: assetMintKey,
    owner: admin.publicKey,
  });
  const memberSourceTokenAccountKey = await createClassicTokenAccount({
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
    amount: 500_000n,
  });
  await mintClassicTokens({
    connection,
    payer: admin,
    mint: assetMintKey,
    destination: memberSourceTokenAccountKey,
    authority: admin,
    amount: 200_000n,
  });

  const assetMint = assetMintKey.toBase58();
  const vaultTokenAccount = vaultTokenAccountKey.toBase58();
  const adminSourceTokenAccount = adminSourceTokenAccountKey.toBase58();
  const memberSourceTokenAccount = memberSourceTokenAccountKey.toBase58();
  const tokenProgram = TOKEN_PROGRAM_ID.toBase58();

  const protocolGovernance = deriveProtocolGovernancePda(programId).toBase58();
  const programData = deriveProgramDataAddress(programId).toBase58();
  const domainAssetVault = domainAssetVaultKey.toBase58();
  const reserveAssetRail = deriveReserveAssetRailPda({
    reserveDomain,
    assetMint,
    programId,
  }).toBase58();
  const domainAssetLedger = deriveDomainAssetLedgerPda({
    reserveDomain,
    assetMint,
    programId,
  }).toBase58();
  const healthPlan = deriveHealthPlanPda({
    reserveDomain,
    planId: 'sdk-health-plan',
    programId,
  }).toBase58();
  const policySeries = derivePolicySeriesPda({
    healthPlan,
    seriesId: 'sdk-reward-series',
    programId,
  }).toBase58();
  const seriesReserveLedger = deriveSeriesReserveLedgerPda({
    policySeries,
    assetMint,
    programId,
  }).toBase58();
  const memberPosition = deriveMemberPositionPda({
    healthPlan,
    wallet: member.publicKey,
    seriesScope: policySeries,
    programId,
  }).toBase58();
  const fundingLine = deriveFundingLinePda({
    healthPlan,
    lineId: 'sdk-sponsor-budget',
    programId,
  }).toBase58();
  const fundingLineLedger = deriveFundingLineLedgerPda({
    fundingLine,
    assetMint,
    programId,
  }).toBase58();
  const planReserveLedger = derivePlanReserveLedgerPda({
    healthPlan,
    assetMint,
    programId,
  }).toBase58();
  const obligation = deriveObligationPda({
    fundingLine,
    obligationId: 'sdk-reward-1',
    programId,
  }).toBase58();
  const liquidityPool = deriveLiquidityPoolPda({
    reserveDomain,
    poolId: 'sdk-income-pool',
    programId,
  }).toBase58();
  const capitalClass = deriveCapitalClassPda({
    liquidityPool,
    classId: 'sdk-open-class',
    programId,
  }).toBase58();
  const poolClassLedger = derivePoolClassLedgerPda({
    capitalClass,
    assetMint,
    programId,
  }).toBase58();
  const poolTreasuryVault = derivePoolTreasuryVaultPda({
    liquidityPool,
    assetMint,
    programId,
  }).toBase58();
  const lpPosition = deriveLpPositionPda({
    capitalClass,
    owner: member.publicKey,
    programId,
  }).toBase58();

  const buildTx = async (
    methodName: string,
    params: {
      args: Record<string, unknown>;
      accounts: Record<string, string>;
    },
  ) => {
    const method = protocol[methodName];
    assert.equal(typeof method, 'function', `${methodName} is not available`);
    return (
      method as (input: {
        args: Record<string, unknown>;
        accounts: Record<string, string>;
        recentBlockhash: string;
      }) => unknown
    )({
      ...params,
      recentBlockhash: await rpc.getRecentBlockhash(),
    });
  };

  await simulateAndBroadcast({
    label: 'initialize_protocol_governance',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildInitializeProtocolGovernanceTx', {
      args: {
        protocol_fee_bps: 150,
        emergency_pause: false,
      },
      accounts: {
        governance_authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        program_data: programData,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'create_reserve_domain',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildCreateReserveDomainTx', {
      args: {
        domain_id: 'sdk-open-domain',
        display_name: 'SDK Open Domain',
        domain_admin: admin.publicKey.toBase58(),
        settlement_mode: 0,
        legal_structure_hash: fixedHash(1),
        compliance_baseline_hash: fixedHash(2),
        allowed_rail_mask: 1,
        pause_flags: 0,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        reserve_domain: reserveDomain,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'create_domain_asset_vault',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildCreateDomainAssetVaultTx', {
      args: {
        asset_mint: assetMint,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        reserve_domain: reserveDomain,
        domain_asset_vault: domainAssetVault,
        domain_asset_ledger: domainAssetLedger,
        asset_mint: assetMint,
        vault_token_account: vaultTokenAccount,
        token_program: tokenProgram,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'configure_reserve_asset_rail',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildConfigureReserveAssetRailTx', {
      args: {
        asset_mint: assetMint,
        oracle_authority: admin.publicKey.toBase58(),
        asset_symbol: 'USDC',
        role: 0,
        payout_priority: 1,
        oracle_source: 3,
        oracle_feed_id: fixedHash(18),
        max_staleness_seconds: 300n,
        max_confidence_bps: 100,
        haircut_bps: 0,
        max_exposure_bps: 10_000,
        deposit_enabled: true,
        payout_enabled: true,
        capacity_enabled: true,
        active: true,
        reason_hash: fixedHash(19),
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        reserve_domain: reserveDomain,
        reserve_asset_rail: reserveAssetRail,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'publish_reserve_asset_rail_price',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildPublishReserveAssetRailPriceTx', {
      args: {
        price_usd_1e8: 100_000_000n,
        confidence_bps: 5,
        published_at_ts: BigInt(Math.floor(Date.now() / 1000)),
        proof_hash: fixedHash(20),
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        reserve_asset_rail: reserveAssetRail,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'create_health_plan',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildCreateHealthPlanTx', {
      args: {
        plan_id: 'sdk-health-plan',
        display_name: 'SDK Health Plan',
        organization_ref: 'sdk-smoke',
        metadata_uri: 'https://docs.omegax.health/sdk/health-plan',
        sponsor: admin.publicKey.toBase58(),
        sponsor_operator: admin.publicKey.toBase58(),
        claims_operator: admin.publicKey.toBase58(),
        oracle_authority: admin.publicKey.toBase58(),
        membership_mode: 0,
        membership_gate_kind: 0,
        membership_gate_mint: ZERO_PUBKEY,
        membership_gate_min_amount: 0n,
        membership_invite_authority: ZERO_PUBKEY,
        allowed_rail_mask: 1,
        default_funding_priority: 1,
        oracle_policy_hash: fixedHash(3),
        schema_binding_hash: fixedHash(4),
        compliance_baseline_hash: fixedHash(5),
        pause_flags: 0,
      },
      accounts: {
        plan_admin: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        reserve_domain: reserveDomain,
        health_plan: healthPlan,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'create_policy_series',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildCreatePolicySeriesTx', {
      args: {
        series_id: 'sdk-reward-series',
        display_name: 'SDK Reward Series',
        metadata_uri: 'https://docs.omegax.health/sdk/policy-series',
        asset_mint: assetMint,
        mode: SERIES_MODE_REWARD,
        status: SERIES_STATUS_ACTIVE,
        adjudication_mode: 0,
        terms_hash: fixedHash(6),
        pricing_hash: fixedHash(7),
        payout_hash: fixedHash(8),
        reserve_model_hash: fixedHash(9),
        evidence_requirements_hash: fixedHash(10),
        comparability_hash: fixedHash(11),
        policy_overrides_hash: fixedHash(12),
        cycle_seconds: 86_400n,
        terms_version: 1,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        policy_series: policySeries,
        series_reserve_ledger: seriesReserveLedger,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'open_member_position',
    rpc,
    signers: [member],
    tx: (await buildTx('buildOpenMemberPositionTx', {
      args: {
        series_scope: policySeries,
        subject_commitment: fixedHash(13),
        eligibility_status: ELIGIBILITY_ELIGIBLE,
        delegated_rights: 0,
        proof_mode: 0,
        token_gate_amount_snapshot: 0n,
        invite_id_hash: fixedHash(16),
        invite_expires_at: 0n,
        anchor_ref: ZERO_PUBKEY,
      },
      accounts: {
        wallet: member.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        policy_series: policySeries,
        member_position: memberPosition,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'open_funding_line',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildOpenFundingLineTx', {
      args: {
        line_id: 'sdk-sponsor-budget',
        policy_series: policySeries,
        asset_mint: assetMint,
        line_type: 0,
        funding_priority: 1,
        committed_amount: 500_000n,
        caps_hash: fixedHash(14),
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        policy_series: policySeries,
        domain_asset_vault: domainAssetVault,
        domain_asset_ledger: domainAssetLedger,
        funding_line: fundingLine,
        funding_line_ledger: fundingLineLedger,
        plan_reserve_ledger: planReserveLedger,
        series_reserve_ledger: seriesReserveLedger,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'fund_sponsor_budget',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildFundSponsorBudgetTx', {
      args: {
        amount: 500_000n,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        domain_asset_vault: domainAssetVault,
        domain_asset_ledger: domainAssetLedger,
        funding_line: fundingLine,
        funding_line_ledger: fundingLineLedger,
        plan_reserve_ledger: planReserveLedger,
        series_reserve_ledger: seriesReserveLedger,
        source_token_account: adminSourceTokenAccount,
        asset_mint: assetMint,
        vault_token_account: vaultTokenAccount,
        token_program: tokenProgram,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'create_obligation',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildCreateObligationTx', {
      args: {
        obligation_id: 'sdk-reward-1',
        asset_mint: assetMint,
        policy_series: policySeries,
        member_wallet: member.publicKey.toBase58(),
        beneficiary: member.publicKey.toBase58(),
        claim_case: '11111111111111111111111111111111',
        liquidity_pool: '11111111111111111111111111111111',
        capital_class: '11111111111111111111111111111111',
        allocation_position: '11111111111111111111111111111111',
        delivery_mode: OBLIGATION_DELIVERY_MODE_CLAIMABLE,
        amount: 50_000n,
        creation_reason_hash: fixedHash(15),
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        domain_asset_ledger: domainAssetLedger,
        funding_line: fundingLine,
        funding_line_ledger: fundingLineLedger,
        plan_reserve_ledger: planReserveLedger,
        series_reserve_ledger: seriesReserveLedger,
        obligation,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'reserve_obligation',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildReserveObligationTx', {
      args: {
        amount: 50_000n,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        domain_asset_ledger: domainAssetLedger,
        funding_line: fundingLine,
        funding_line_ledger: fundingLineLedger,
        plan_reserve_ledger: planReserveLedger,
        series_reserve_ledger: seriesReserveLedger,
        obligation,
        member_position: memberPosition,
        asset_mint: assetMint,
        vault_token_account: vaultTokenAccount,
        recipient_token_account: adminSourceTokenAccount,
        token_program: tokenProgram,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'settle_obligation_claimable',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildSettleObligationTx', {
      args: {
        next_status: OBLIGATION_STATUS_CLAIMABLE_PAYABLE,
        amount: 50_000n,
        settlement_reason_hash: fixedHash(16),
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        reserve_asset_rail: reserveAssetRail,
        domain_asset_vault: domainAssetVault,
        domain_asset_ledger: domainAssetLedger,
        funding_line: fundingLine,
        funding_line_ledger: fundingLineLedger,
        plan_reserve_ledger: planReserveLedger,
        series_reserve_ledger: seriesReserveLedger,
        obligation,
        member_position: memberPosition,
        asset_mint: assetMint,
        vault_token_account: vaultTokenAccount,
        recipient_token_account: memberSourceTokenAccount,
        token_program: tokenProgram,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'settle_obligation_paid',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildSettleObligationTx', {
      args: {
        next_status: OBLIGATION_STATUS_SETTLED,
        amount: 50_000n,
        settlement_reason_hash: fixedHash(17),
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        health_plan: healthPlan,
        reserve_asset_rail: reserveAssetRail,
        domain_asset_vault: domainAssetVault,
        domain_asset_ledger: domainAssetLedger,
        funding_line: fundingLine,
        funding_line_ledger: fundingLineLedger,
        plan_reserve_ledger: planReserveLedger,
        series_reserve_ledger: seriesReserveLedger,
        obligation,
        member_position: memberPosition,
        asset_mint: assetMint,
        vault_token_account: vaultTokenAccount,
        recipient_token_account: adminSourceTokenAccount,
        token_program: tokenProgram,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'create_liquidity_pool',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildCreateLiquidityPoolTx', {
      args: {
        pool_id: 'sdk-income-pool',
        display_name: 'SDK Income Pool',
        curator: admin.publicKey.toBase58(),
        allocator: admin.publicKey.toBase58(),
        sentinel: admin.publicKey.toBase58(),
        deposit_asset_mint: assetMint,
        strategy_hash: fixedHash(18),
        allowed_exposure_hash: fixedHash(19),
        external_yield_adapter_hash: fixedHash(20),
        fee_bps: 25,
        redemption_policy: REDEMPTION_POLICY_QUEUE_ONLY,
        pause_flags: 0,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        reserve_domain: reserveDomain,
        domain_asset_vault: domainAssetVault,
        liquidity_pool: liquidityPool,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'create_capital_class',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildCreateCapitalClassTx', {
      args: {
        class_id: 'sdk-open-class',
        display_name: 'SDK Open Class',
        share_mint: shareMint,
        priority: 1,
        impairment_rank: 1,
        restriction_mode: CAPITAL_CLASS_RESTRICTION_OPEN,
        redemption_terms_mode: 1,
        wrapper_metadata_hash: fixedHash(21),
        permissioning_hash: fixedHash(22),
        fee_bps: 15,
        min_lockup_seconds: 0n,
        pause_flags: 0,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        liquidity_pool: liquidityPool,
        capital_class: capitalClass,
        pool_class_ledger: poolClassLedger,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'init_pool_treasury_vault',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildInitPoolTreasuryVaultTx', {
      args: {
        asset_mint: assetMint,
        fee_recipient: admin.publicKey.toBase58(),
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        liquidity_pool: liquidityPool,
        domain_asset_vault: domainAssetVault,
        pool_treasury_vault: poolTreasuryVault,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'deposit_into_capital_class',
    rpc,
    signers: [member],
    tx: (await buildTx('buildDepositIntoCapitalClassTx', {
      args: {
        amount: 200_000n,
        shares: 199_700n,
        credentialed: true,
      },
      accounts: {
        owner: member.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        domain_asset_vault: domainAssetVault,
        domain_asset_ledger: domainAssetLedger,
        liquidity_pool: liquidityPool,
        capital_class: capitalClass,
        pool_class_ledger: poolClassLedger,
        lp_position: lpPosition,
        pool_treasury_vault: poolTreasuryVault,
        source_token_account: memberSourceTokenAccount,
        asset_mint: assetMint,
        vault_token_account: vaultTokenAccount,
        token_program: tokenProgram,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'request_redemption',
    rpc,
    signers: [member],
    tx: (await buildTx('buildRequestRedemptionTx', {
      args: {
        shares: 50_000n,
      },
      accounts: {
        owner: member.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        liquidity_pool: liquidityPool,
        capital_class: capitalClass,
        pool_class_ledger: poolClassLedger,
        domain_asset_ledger: domainAssetLedger,
        lp_position: lpPosition,
      },
    })) as never,
  });

  await simulateAndBroadcast({
    label: 'process_redemption_queue',
    rpc,
    signers: [admin],
    tx: (await buildTx('buildProcessRedemptionQueueTx', {
      args: {
        shares: 50_000n,
      },
      accounts: {
        authority: admin.publicKey.toBase58(),
        protocol_governance: protocolGovernance,
        domain_asset_vault: domainAssetVault,
        domain_asset_ledger: domainAssetLedger,
        liquidity_pool: liquidityPool,
        capital_class: capitalClass,
        pool_class_ledger: poolClassLedger,
        lp_position: lpPosition,
        pool_treasury_vault: poolTreasuryVault,
        asset_mint: assetMint,
        vault_token_account: vaultTokenAccount,
        recipient_token_account: memberSourceTokenAccount,
        token_program: tokenProgram,
      },
    })) as never,
  });

  const governance = await protocol.fetchProtocolGovernance();
  assert.ok(governance, 'expected live ProtocolGovernance account');
  assert.equal(
    (governance as { governance_authority: string }).governance_authority,
    admin.publicKey.toBase58(),
  );

  const fetchedDomain = await protocol.fetchReserveDomain(reserveDomain);
  assert.ok(fetchedDomain, 'expected live ReserveDomain account');
  assert.equal(
    (fetchedDomain as { domain_id: string }).domain_id,
    'sdk-open-domain',
  );

  const fetchedVault = await protocol.fetchDomainAssetVault(domainAssetVault);
  assert.ok(fetchedVault, 'expected live DomainAssetVault account');
  assert.equal((fetchedVault as { asset_mint: string }).asset_mint, assetMint);
  assert.equal(
    (fetchedVault as { total_assets: bigint }).total_assets,
    600_075n,
  );

  const fetchedPlan = await protocol.fetchHealthPlan(healthPlan);
  assert.ok(fetchedPlan, 'expected live HealthPlan account');
  assert.equal(
    (fetchedPlan as { health_plan_id: string }).health_plan_id,
    'sdk-health-plan',
  );

  const fetchedSeries = await protocol.fetchPolicySeries(policySeries);
  assert.ok(fetchedSeries, 'expected live PolicySeries account');
  assert.equal(
    (fetchedSeries as { series_id: string }).series_id,
    'sdk-reward-series',
  );
  assert.equal((fetchedSeries as { mode: number }).mode, SERIES_MODE_REWARD);

  const fetchedMember = await protocol.fetchMemberPosition(memberPosition);
  assert.ok(fetchedMember, 'expected live MemberPosition account');
  assert.equal(
    (fetchedMember as { wallet: string }).wallet,
    member.publicKey.toBase58(),
  );

  const fetchedFundingLine = await protocol.fetchFundingLine(fundingLine);
  assert.ok(fetchedFundingLine, 'expected live FundingLine account');
  assert.equal(
    (fetchedFundingLine as { funded_amount: bigint }).funded_amount,
    500_000n,
  );

  const fetchedObligation = await protocol.fetchObligation(obligation);
  assert.ok(fetchedObligation, 'expected live Obligation account');
  assert.equal(
    (fetchedObligation as { status: number }).status,
    OBLIGATION_STATUS_SETTLED,
  );
  assert.equal(
    (fetchedObligation as { settled_amount: bigint }).settled_amount,
    50_000n,
  );

  const fetchedLiquidityPool = await protocol.fetchLiquidityPool(liquidityPool);
  assert.ok(fetchedLiquidityPool, 'expected live LiquidityPool account');
  assert.equal(
    (fetchedLiquidityPool as { pool_id: string }).pool_id,
    'sdk-income-pool',
  );
  assert.equal(
    (fetchedLiquidityPool as { total_value_locked: bigint }).total_value_locked,
    149_700n,
  );

  const fetchedCapitalClass = await protocol.fetchCapitalClass(capitalClass);
  assert.ok(fetchedCapitalClass, 'expected live CapitalClass account');
  assert.equal(
    (fetchedCapitalClass as { total_shares: bigint }).total_shares,
    149_700n,
  );
  assert.equal(
    (fetchedCapitalClass as { pending_redemptions: bigint })
      .pending_redemptions,
    0n,
  );

  const fetchedLpPosition = await protocol.fetchLPPosition(lpPosition);
  assert.ok(fetchedLpPosition, 'expected live LPPosition account');
  assert.equal((fetchedLpPosition as { shares: bigint }).shares, 149_700n);
  assert.equal(
    (fetchedLpPosition as { realized_distributions: bigint })
      .realized_distributions,
    49_925n,
  );

  const fetchedDomainLedger =
    await protocol.fetchDomainAssetLedger(domainAssetLedger);
  const domainSheet = recomputeReserveBalanceSheet(
    (fetchedDomainLedger as { sheet: Record<string, unknown> }).sheet,
  );
  assert.equal(domainSheet.funded, 599_700n);
  assert.equal(domainSheet.reserved, 0n);
  assert.equal(domainSheet.pendingRedemption, 0n);
  assert.equal(domainSheet.impaired, 0n);

  const fetchedPlanLedger =
    await protocol.fetchPlanReserveLedger(planReserveLedger);
  const planSheet = recomputeReserveBalanceSheet(
    (fetchedPlanLedger as { sheet: Record<string, unknown> }).sheet,
  );
  assert.equal(planSheet.funded, 450_000n);
  assert.equal(planSheet.settled, 50_000n);

  const fetchedFundingLineLedger =
    await protocol.fetchFundingLineLedger(fundingLineLedger);
  const fundingLineSheet = recomputeReserveBalanceSheet(
    (fetchedFundingLineLedger as { sheet: Record<string, unknown> }).sheet,
  );
  assert.equal(fundingLineSheet.funded, 450_000n);
  assert.equal(fundingLineSheet.settled, 50_000n);

  const fetchedClassLedger =
    await protocol.fetchPoolClassLedger(poolClassLedger);
  const classSheet = recomputeReserveBalanceSheet(
    (fetchedClassLedger as { sheet: Record<string, unknown> }).sheet,
  );
  assert.equal(classSheet.funded, 149_700n);
  assert.equal(classSheet.pendingRedemption, 0n);
  assert.equal(classSheet.redeemable, 149_700n);
});
