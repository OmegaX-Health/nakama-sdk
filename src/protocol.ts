import {
  AddressLookupTableAccount,
  type AccountInfo,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import {
  PROTOCOL_ACCOUNT_DISCRIMINATORS,
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  PROTOCOL_PROGRAM_ID,
  type ProtocolInstructionAccount,
  type ProtocolInstructionName,
} from './generated/protocol_contract.js';
import type {
  BuildInstructionParams,
  BuildTransactionParams,
  GenericInstructionAccounts,
  ProtocolAccountName,
  ProtocolClient,
  PublicKeyish,
} from './generated/protocol_types.js';
import {
  deriveCapitalContributionPda,
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
  getProgramId,
  toPublicKey,
  ZERO_PUBKEY_KEY,
} from './protocol_seeds.js';
import {
  OmegaXAccountNotFoundError,
  OmegaXAccountOwnerMismatchError,
  OmegaXInstructionBuildError,
  OmegaXProgramMismatchError,
  OmegaXTokenAccountPreflightError,
  NakamaLegacyWriteDisabledError,
} from './errors.js';
import {
  PROTOCOL_IDL_VERSION as INTERNAL_PROTOCOL_IDL_VERSION,
  decodeProtocolAccountData,
  encodeProtocolInstructionData,
  getProtocolIdl as getInternalProtocolIdl,
  hexToFixedBytes,
  normalizeOptionalHex32,
} from './internal/protocol-codec.js';

const SPL_TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
export const UNSAFE_CUSTOM_PROGRAM_ID_ENV =
  'OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID';

function classicTokenProgramId(
  tokenProgramId?: PublicKeyish | null,
): PublicKey {
  const candidate = toPublicKey(tokenProgramId ?? SPL_TOKEN_PROGRAM_ID);
  if (!candidate.equals(SPL_TOKEN_PROGRAM_ID)) {
    throw new OmegaXProgramMismatchError(
      'OmegaX Protocol v1 supports only the classic SPL Token program.',
      {
        details: {
          expectedProgramId: SPL_TOKEN_PROGRAM_ID.toBase58(),
          actualProgramId: candidate.toBase58(),
        },
      },
    );
  }
  return candidate;
}

function unsafeCustomProgramIdAllowed(explicitFlag?: boolean): boolean {
  const envValue = String(process.env[UNSAFE_CUSTOM_PROGRAM_ID_ENV] ?? '')
    .trim()
    .toLowerCase();
  return (
    explicitFlag === true ||
    envValue === '1' ||
    envValue === 'true' ||
    process.env.NODE_ENV === 'test'
  );
}

function resolveProgramIdForBuild(params: {
  programId?: PublicKeyish;
  unsafeAllowCustomProgramId?: boolean;
}): PublicKey {
  const resolved = toPublicKey(params.programId ?? PROTOCOL_PROGRAM_ID);
  const canonical = toPublicKey(PROTOCOL_PROGRAM_ID);
  if (
    !resolved.equals(canonical) &&
    !unsafeCustomProgramIdAllowed(params.unsafeAllowCustomProgramId)
  ) {
    throw new OmegaXProgramMismatchError(
      `custom programId ${resolved.toBase58()} is unsafe for production SDK flows; set unsafeAllowCustomProgramId or ${UNSAFE_CUSTOM_PROGRAM_ID_ENV}=1 only for devnet/localnet/test workflows`,
      {
        details: {
          expectedProgramId: canonical.toBase58(),
          actualProgramId: resolved.toBase58(),
          unsafeAllowCustomProgramId:
            params.unsafeAllowCustomProgramId === true,
          unsafeCustomProgramIdEnv: UNSAFE_CUSTOM_PROGRAM_ID_ENV,
        },
      },
    );
  }
  return resolved;
}

export const PROTOCOL_IDL_VERSION = INTERNAL_PROTOCOL_IDL_VERSION;

function legacySolanaWriteDisabled(operation: string): void {
  throw new NakamaLegacyWriteDisabledError(
    `${operation} is disabled because Nakama's canonical execution network is Ethereum mainnet. Legacy Solana modules support reads, decoding, simulation, and migration only.`,
    {
      details: {
        operation,
        canonicalChain: 'eip155:1',
      },
    },
  );
}

export function getProtocolIdl() {
  return getInternalProtocolIdl();
}

export {
  CLAIM_ATTESTATION_DECISION_ABSTAIN,
  CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW,
  CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE,
  CLAIM_ATTESTATION_DECISION_SUPPORT_DENY,
} from './protocol_models.js';

function pascalCase(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function assertAllOrNoneAccountScope(
  label: string,
  fields: Record<string, unknown | null | undefined>,
): void {
  const present = Object.entries(fields).filter(
    ([, value]) => value !== undefined && value !== null,
  );
  if (present.length > 0 && present.length !== Object.keys(fields).length) {
    throw new Error(
      `${label} account scope must include ${Object.keys(fields).join(', ')} together`,
    );
  }
}

function resolveInstructionAccounts(
  instructionName: ProtocolInstructionName,
  accounts: GenericInstructionAccounts,
  programId: PublicKeyish,
): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> {
  return (PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? []).flatMap(
    (
      account,
    ): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> => {
      if (account.address) {
        return [
          {
            pubkey: new PublicKey(account.address),
            isSigner: account.signer,
            isWritable: account.writable,
          },
        ];
      }

      const value = accounts[account.name];
      if (value === undefined || value === null) {
        if (account.optional) {
          return [
            {
              pubkey: toPublicKey(programId),
              isSigner: false,
              isWritable: false,
            },
          ];
        }
        throw new OmegaXInstructionBuildError(
          `Missing required account "${account.name}" for instruction ${instructionName}`,
          {
            details: { instructionName, accountName: account.name },
          },
        );
      }

      return [
        {
          pubkey: toPublicKey(value),
          isSigner: account.signer,
          isWritable: account.writable,
        },
      ];
    },
  );
}

function inferFeePayer(
  instructionName: ProtocolInstructionName,
  accounts: GenericInstructionAccounts,
): PublicKey {
  const signer = (PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? []).find(
    (account) => account.signer && !account.address,
  );
  if (!signer) {
    throw new OmegaXInstructionBuildError(
      `Unable to infer fee payer for ${instructionName}. Pass feePayer explicitly.`,
      {
        details: { instructionName },
      },
    );
  }

  const signerAddress = accounts[signer.name];
  if (!signerAddress) {
    throw new OmegaXInstructionBuildError(
      `Unable to infer fee payer for ${instructionName}: signer account "${signer.name}" is missing.`,
      {
        details: { instructionName, signerAccountName: signer.name },
      },
    );
  }

  return toPublicKey(signerAddress);
}

export function listProtocolInstructionNames(): ProtocolInstructionName[] {
  return Object.keys(
    PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  ) as ProtocolInstructionName[];
}

export function listProtocolInstructionAccounts(
  instructionName: ProtocolInstructionName,
): ProtocolInstructionAccount[] {
  return PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? [];
}

export function listProtocolAccountNames(): ProtocolAccountName[] {
  return Object.keys(
    PROTOCOL_ACCOUNT_DISCRIMINATORS,
  ).sort() as ProtocolAccountName[];
}

export async function accountExists(
  connection: Connection,
  address: PublicKeyish,
): Promise<boolean> {
  const info = await connection.getAccountInfo(
    toPublicKey(address),
    'confirmed',
  );
  return info !== null;
}

export function decodeProtocolAccount<T = Record<string, unknown>>(
  accountName: ProtocolAccountName,
  data: Buffer | Uint8Array,
): T {
  return decodeProtocolAccountData<T>(accountName, data);
}

function decodeFetchedProtocolAccount<T = Record<string, unknown>>(
  accountName: ProtocolAccountName,
  address: PublicKey,
  info: AccountInfo<Buffer>,
  programId: PublicKey,
): T {
  if (!info.owner.equals(programId)) {
    throw new OmegaXAccountOwnerMismatchError(
      `Account ${address.toBase58()} for ${accountName} is owned by ${info.owner.toBase58()}, not OmegaX Protocol program ${programId.toBase58()}.`,
      {
        details: {
          accountName,
          address: address.toBase58(),
          expectedOwner: programId.toBase58(),
          actualOwner: info.owner.toBase58(),
        },
      },
    );
  }
  return decodeProtocolAccount<T>(accountName, info.data);
}

function attachProtocolTransactionMetadata(
  transaction: Transaction,
  params: {
    programId: PublicKey;
    unsafeAllowCustomProgramId?: boolean;
  },
): Transaction {
  Object.defineProperty(transaction, 'omegaxProtocolMetadata', {
    value: {
      programId: params.programId.toBase58(),
      canonicalProgramId: toPublicKey(PROTOCOL_PROGRAM_ID).toBase58(),
      unsafeCustomProgramId: !params.programId.equals(
        toPublicKey(PROTOCOL_PROGRAM_ID),
      ),
      unsafeAllowCustomProgramId:
        params.unsafeAllowCustomProgramId === true ||
        unsafeCustomProgramIdAllowed(),
    },
    enumerable: true,
    configurable: false,
    writable: false,
  });
  return transaction;
}

export function buildProtocolInstruction(
  params: BuildInstructionParams<
    Record<string, unknown>,
    GenericInstructionAccounts
  > & {
    instructionName: ProtocolInstructionName;
    unsafeAllowCustomProgramId?: boolean;
  },
): TransactionInstruction {
  legacySolanaWriteDisabled('buildProtocolInstruction');
  const resolvedProgramId = resolveProgramIdForBuild({
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });

  return new TransactionInstruction({
    programId: resolvedProgramId,
    keys: resolveInstructionAccounts(
      params.instructionName,
      params.accounts,
      resolvedProgramId,
    ),
    data: encodeProtocolInstructionData(params.instructionName, params.args),
  });
}

export function buildProtocolTransaction(
  params: BuildTransactionParams<
    Record<string, unknown>,
    GenericInstructionAccounts
  > & {
    instructionName: ProtocolInstructionName;
    unsafeAllowCustomProgramId?: boolean;
  },
): Transaction {
  legacySolanaWriteDisabled('buildProtocolTransaction');
  const resolvedProgramId = resolveProgramIdForBuild({
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
  const transaction = new Transaction({
    feePayer: params.feePayer
      ? toPublicKey(params.feePayer)
      : inferFeePayer(params.instructionName, params.accounts),
    recentBlockhash: params.recentBlockhash,
  });

  for (const instruction of params.prependInstructions ?? []) {
    transaction.add(instruction);
  }

  transaction.add(
    buildProtocolInstruction({
      instructionName: params.instructionName,
      args: params.args,
      accounts: params.accounts,
      programId: resolvedProgramId,
      unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
    }),
  );

  for (const instruction of params.appendInstructions ?? []) {
    transaction.add(instruction);
  }

  return attachProtocolTransactionMetadata(transaction, {
    programId: resolvedProgramId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
}

function buildConvenienceTransaction(params: {
  instructionName: ProtocolInstructionName;
  feePayer: PublicKeyish;
  recentBlockhash: string;
  args: Record<string, unknown>;
  accounts: GenericInstructionAccounts;
  programId?: PublicKeyish;
  unsafeAllowCustomProgramId?: boolean;
}): Transaction {
  return buildProtocolTransaction({
    instructionName: params.instructionName,
    args: params.args,
    accounts: params.accounts,
    feePayer: params.feePayer,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
}

export type ProtocolInstructionAccountInput = {
  pubkey?: PublicKeyish | null;
  isSigner?: boolean;
  isWritable?: boolean;
};

function nonZeroProtocolAccount(
  pubkey?: PublicKeyish | null,
): PublicKey | undefined {
  if (!pubkey) return undefined;
  const key = toPublicKey(pubkey);
  return key.equals(ZERO_PUBKEY_KEY) ? undefined : key;
}

export type SettlementOutflowAccounts = {
  memberPositionAddress: PublicKeyish;
  reserveAssetRailAddress?: PublicKeyish | null;
  vaultTokenAccountAddress: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  tokenProgramId: PublicKeyish;
  poolOracleFeeVaultAddress?: PublicKeyish | null;
  poolOraclePolicyAddress?: PublicKeyish | null;
  oracleFeeAttestationAddress?: PublicKeyish | null;
};

type TokenCustodyFlowParams = {
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
};

function domainVaultAddress(params: TokenCustodyFlowParams): PublicKey {
  return deriveDomainAssetVaultPda({
    reserveDomain: params.reserveDomainAddress,
    assetMint: params.assetMint,
    programId: params.programId,
  });
}

function domainVaultTokenAddress(params: TokenCustodyFlowParams): PublicKey {
  return params.vaultTokenAccountAddress
    ? toPublicKey(params.vaultTokenAccountAddress)
    : deriveDomainAssetVaultTokenAccountPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: params.assetMint,
        programId: params.programId,
      });
}

function domainAssetLedgerAddress(params: TokenCustodyFlowParams): PublicKey {
  return deriveDomainAssetLedgerPda({
    reserveDomain: params.reserveDomainAddress,
    assetMint: params.assetMint,
    programId: params.programId,
  });
}

function tokenProgramAddress(tokenProgramId?: PublicKeyish | null): PublicKey {
  return classicTokenProgramId(tokenProgramId);
}

export function buildCreateReserveDomainTx(params: {
  authority: PublicKeyish;
  recentBlockhash: string;
  domainId: string;
  displayName: string;
  domainAdmin?: PublicKeyish | null;
  settlementMode: number;
  legalStructureHashHex?: string | null;
  complianceBaselineHashHex?: string | null;
  allowedRailMask: number;
  pauseFlags: number;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_reserve_domain',
    programId,
    args: {
      domain_id: params.domainId,
      display_name: params.displayName,
      domain_admin: toPublicKey(params.domainAdmin ?? authority),
      settlement_mode: params.settlementMode,
      legal_structure_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.legalStructureHashHex),
          'legal structure hash',
        ),
      ),
      compliance_baseline_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.complianceBaselineHashHex),
          'compliance baseline hash',
        ),
      ),
      allowed_rail_mask: params.allowedRailMask,
      pause_flags: params.pauseFlags,
    },
    accounts: {
      authority,
      reserve_domain: deriveReserveDomainPda({
        domainId: params.domainId,
        programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildCreateDomainAssetVaultTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  vaultTokenAccountAddress?: PublicKeyish;
  tokenProgram?: PublicKeyish;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const vaultTokenAccount = deriveDomainAssetVaultTokenAccountPda({
    reserveDomain: params.reserveDomainAddress,
    assetMint,
    programId,
  });

  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_domain_asset_vault',
    programId,
    args: {
      asset_mint: assetMint,
    },
    accounts: {
      authority,
      reserve_domain: params.reserveDomainAddress,
      domain_asset_vault: deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      asset_mint: assetMint,
      vault_token_account: vaultTokenAccount,
      token_program: toPublicKey(params.tokenProgram ?? SPL_TOKEN_PROGRAM_ID),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildCreatePolicySeriesTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  seriesId: string;
  displayName: string;
  metadataUri: string;
  mode: number;
  status: number;
  adjudicationMode: number;
  termsHashHex?: string | null;
  pricingHashHex?: string | null;
  payoutHashHex?: string | null;
  reserveModelHashHex?: string | null;
  evidenceRequirementsHashHex?: string | null;
  comparabilityHashHex?: string | null;
  policyOverridesHashHex?: string | null;
  cycleSeconds: bigint;
  termsVersion: number;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const policySeries = derivePolicySeriesPda({
    healthPlan: params.healthPlanAddress,
    seriesId: params.seriesId,
    programId,
  });
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_policy_series',
    programId,
    args: {
      series_id: params.seriesId,
      display_name: params.displayName,
      metadata_uri: params.metadataUri,
      asset_mint: toPublicKey(params.assetMint),
      mode: params.mode,
      status: params.status,
      adjudication_mode: params.adjudicationMode,
      terms_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.termsHashHex),
          'terms hash',
        ),
      ),
      pricing_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.pricingHashHex),
          'pricing hash',
        ),
      ),
      payout_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.payoutHashHex),
          'payout hash',
        ),
      ),
      reserve_model_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reserveModelHashHex),
          'reserve model hash',
        ),
      ),
      comparability_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.comparabilityHashHex),
          'comparability hash',
        ),
      ),
      policy_overrides_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.policyOverridesHashHex),
          'policy overrides hash',
        ),
      ),
      cycle_seconds: params.cycleSeconds,
      terms_version: params.termsVersion,
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      policy_series: policySeries,
      system_program: SystemProgram.programId,
    },
  });
}

export function buildOpenFundingLineTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  lineId: string;
  policySeriesAddress?: PublicKeyish | null;
  lineType: number;
  fundingPriority: number;
  committedAmount: bigint;
  capsHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const fundingLine = deriveFundingLinePda({
    healthPlan: params.healthPlanAddress,
    lineId: params.lineId,
    programId,
  });
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'open_funding_line',
    programId,
    args: {
      line_id: params.lineId,
      policy_series: toPublicKey(params.policySeriesAddress ?? ZERO_PUBKEY_KEY),
      asset_mint: assetMint,
      line_type: params.lineType,
      funding_priority: params.fundingPriority,
      committed_amount: params.committedAmount,
      caps_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.capsHashHex),
          'caps hash',
        ),
      ),
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      domain_asset_vault: deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      funding_line: fundingLine,
      funding_line_ledger: deriveFundingLineLedgerPda({
        fundingLine,
        assetMint,
        programId,
      }),
      plan_reserve_ledger: derivePlanReserveLedgerPda({
        healthPlan: params.healthPlanAddress,
        assetMint,
        programId,
      }),
      policy_series: nonZeroProtocolAccount(params.policySeriesAddress),
      system_program: SystemProgram.programId,
    },
  });
}

function buildFundingInflowTx(params: {
  instructionName: 'fund_sponsor_budget' | 'record_premium_payment';
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  policySeriesAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const tokenProgramId = tokenProgramAddress(params.tokenProgramId);
  const commonAccounts: GenericInstructionAccounts = {
    authority,
    health_plan: toPublicKey(params.healthPlanAddress),
    domain_asset_vault: domainVaultAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    }),
    domain_asset_ledger: domainAssetLedgerAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    }),
    funding_line: toPublicKey(params.fundingLineAddress),
    funding_line_ledger: deriveFundingLineLedgerPda({
      fundingLine: params.fundingLineAddress,
      assetMint,
      programId,
    }),
    plan_reserve_ledger: derivePlanReserveLedgerPda({
      healthPlan: params.healthPlanAddress,
      assetMint,
      programId,
    }),
    source_token_account: toPublicKey(params.sourceTokenAccountAddress),
    asset_mint: assetMint,
    vault_token_account: domainVaultTokenAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      programId,
    }),
    token_program: tokenProgramId,
  };

  return buildConvenienceTransaction({
    instructionName: params.instructionName,
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: { amount: params.amount },
    accounts: commonAccounts,
  });
}

export function buildFundSponsorBudgetTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  policySeriesAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildFundingInflowTx({
    ...params,
    instructionName: 'fund_sponsor_budget',
  });
}

export function buildRecordPremiumPaymentTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  policySeriesAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildFundingInflowTx({
    ...params,
    instructionName: 'record_premium_payment',
  });
}

export function buildCreateObligationTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  obligationId: string;
  policySeriesAddress?: PublicKeyish | null;
  memberWalletAddress?: PublicKeyish | null;
  beneficiaryAddress?: PublicKeyish | null;
  claimCaseAddress?: PublicKeyish | null;
  liquidityPoolAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  deliveryMode: number;
  amount: bigint;
  creationReasonHashHex?: string | null;
  poolAssetMint?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const obligation = deriveObligationPda({
    fundingLine: params.fundingLineAddress,
    obligationId: params.obligationId,
    programId,
  });
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_obligation',
    programId,
    args: {
      obligation_id: params.obligationId,
      asset_mint: toPublicKey(params.assetMint),
      policy_series: toPublicKey(params.policySeriesAddress ?? ZERO_PUBKEY_KEY),
      member_wallet: toPublicKey(params.memberWalletAddress ?? ZERO_PUBKEY_KEY),
      beneficiary: toPublicKey(params.beneficiaryAddress ?? ZERO_PUBKEY_KEY),
      claim_case: toPublicKey(params.claimCaseAddress ?? ZERO_PUBKEY_KEY),
      delivery_mode: params.deliveryMode,
      amount: params.amount,
      creation_reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.creationReasonHashHex),
          'creation reason hash',
        ),
      ),
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: params.assetMint,
        programId,
      }),
      funding_line: params.fundingLineAddress,
      funding_line_ledger: deriveFundingLineLedgerPda({
        fundingLine: params.fundingLineAddress,
        assetMint: params.assetMint,
        programId,
      }),
      plan_reserve_ledger: derivePlanReserveLedgerPda({
        healthPlan: params.healthPlanAddress,
        assetMint: params.assetMint,
        programId,
      }),
      obligation,
      system_program: SystemProgram.programId,
    },
  });
}

export function buildOpenClaimCaseTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  memberPositionAddress?: PublicKeyish | null;
  fundingLineAddress: PublicKeyish;
  recentBlockhash: string;
  claimId: string;
  policySeriesAddress?: PublicKeyish | null;
  claimantAddress?: PublicKeyish | null;
  memberWalletAddress?: PublicKeyish | null;
  evidenceRefHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const claimCase = deriveClaimCasePda({
    healthPlan: params.healthPlanAddress,
    claimId: params.claimId,
    programId,
  });
  const claimantAddress = params.claimantAddress ?? params.memberWalletAddress;
  if (!claimantAddress) {
    throw new Error(
      'claimantAddress or memberWalletAddress is required; operator claim intake must not default claimant to the operator authority',
    );
  }
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'open_claim_case',
    programId,
    args: {
      claim_id: params.claimId,
      policy_series: toPublicKey(params.policySeriesAddress ?? ZERO_PUBKEY_KEY),
      claimant: toPublicKey(claimantAddress),
      evidence_ref_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.evidenceRefHashHex),
          'evidence ref hash',
        ),
      ),
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      funding_line: params.fundingLineAddress,
      claim_case: claimCase,
      system_program: SystemProgram.programId,
    },
  });
}

export function buildAdjudicateClaimCaseTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  claimCaseAddress: PublicKeyish;
  recentBlockhash: string;
  reviewState: number;
  approvedAmount: bigint;
  deniedAmount: bigint;
  reserveAmount: bigint;
  evidenceRefHashHex?: string | null;
  decisionSupportHashHex?: string | null;
  obligationAddress?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'adjudicate_claim_case',
    programId,
    args: {
      review_state: params.reviewState,
      approved_amount: params.approvedAmount,
      denied_amount: params.deniedAmount,
      reserve_amount: params.reserveAmount,
      evidence_ref_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.evidenceRefHashHex),
          'evidence ref hash',
        ),
      ),
      decision_support_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.decisionSupportHashHex),
          'decision support hash',
        ),
      ),
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      claim_case: params.claimCaseAddress,
      obligation: nonZeroProtocolAccount(params.obligationAddress),
    },
  });
}

function assertOracleFeeScope(params: {
  poolOracleFeeVaultAddress?: PublicKeyish | null;
  poolOraclePolicyAddress?: PublicKeyish | null;
  oracleFeeAttestationAddress?: PublicKeyish | null;
}): void {
  assertAllOrNoneAccountScope('settlement oracle fee', {
    poolOracleFeeVaultAddress: params.poolOracleFeeVaultAddress,
    poolOraclePolicyAddress: params.poolOraclePolicyAddress,
    oracleFeeAttestationAddress: params.oracleFeeAttestationAddress,
  });
}

export function buildSettleClaimCaseTx(
  params: {
    authority: PublicKeyish;
    healthPlanAddress: PublicKeyish;
    reserveDomainAddress: PublicKeyish;
    fundingLineAddress: PublicKeyish;
    assetMint: PublicKeyish;
    claimCaseAddress: PublicKeyish;
    recentBlockhash: string;
    amount: bigint;
    policySeriesAddress?: PublicKeyish | null;
    obligationAddress?: PublicKeyish | null;
    capitalClassAddress?: PublicKeyish | null;
    allocationPositionAddress?: PublicKeyish | null;
    poolAssetMint?: PublicKeyish | null;
    protocolFeeVaultAddress?: PublicKeyish | null;
    programId?: PublicKeyish;
  } & SettlementOutflowAccounts,
): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  assertAllOrNoneAccountScope('LP allocation', {
    capitalClassAddress: params.capitalClassAddress,
    allocationPositionAddress: params.allocationPositionAddress,
    poolAssetMint: params.poolAssetMint,
  });
  classicTokenProgramId(params.tokenProgramId);
  assertOracleFeeScope(params);

  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'settle_claim_case',
    programId,
    args: {
      amount: params.amount,
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      domain_asset_vault: deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      funding_line: params.fundingLineAddress,
      funding_line_ledger: deriveFundingLineLedgerPda({
        fundingLine: params.fundingLineAddress,
        assetMint,
        programId,
      }),
      plan_reserve_ledger: derivePlanReserveLedgerPda({
        healthPlan: params.healthPlanAddress,
        assetMint,
        programId,
      }),
      claim_case: params.claimCaseAddress,
      obligation: nonZeroProtocolAccount(params.obligationAddress),
      asset_mint: assetMint,
      vault_token_account: params.vaultTokenAccountAddress,
      recipient_token_account: params.recipientTokenAccountAddress,
      token_program: classicTokenProgramId(params.tokenProgramId),
    },
  });
}

function buildObligationFlowTx(params: {
  instructionName:
    | 'reserve_obligation'
    | 'release_reserve'
    | 'settle_obligation';
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  obligationAddress: PublicKeyish;
  recentBlockhash: string;
  claimCaseAddress?: PublicKeyish | null;
  policySeriesAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  poolAssetMint?: PublicKeyish | null;
  memberPositionAddress?: PublicKeyish | null;
  reserveAssetRailAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  recipientTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  poolOracleFeeVaultAddress?: PublicKeyish | null;
  poolOraclePolicyAddress?: PublicKeyish | null;
  oracleFeeAttestationAddress?: PublicKeyish | null;
  args: Record<string, unknown>;
  includeVault?: boolean;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const hasOutflow = Boolean(
    params.vaultTokenAccountAddress && params.recipientTokenAccountAddress,
  );
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: params.instructionName,
    programId,
    args: params.args,
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      domain_asset_vault: deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: params.assetMint,
        programId,
      }),
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: params.assetMint,
        programId,
      }),
      funding_line: params.fundingLineAddress,
      funding_line_ledger: deriveFundingLineLedgerPda({
        fundingLine: params.fundingLineAddress,
        assetMint: params.assetMint,
        programId,
      }),
      plan_reserve_ledger: derivePlanReserveLedgerPda({
        healthPlan: params.healthPlanAddress,
        assetMint: params.assetMint,
        programId,
      }),
      obligation: params.obligationAddress,
      claim_case: nonZeroProtocolAccount(params.claimCaseAddress),
      asset_mint: hasOutflow ? toPublicKey(params.assetMint) : undefined,
      vault_token_account: hasOutflow
        ? nonZeroProtocolAccount(params.vaultTokenAccountAddress)
        : undefined,
      recipient_token_account: hasOutflow
        ? nonZeroProtocolAccount(params.recipientTokenAccountAddress)
        : undefined,
      token_program: hasOutflow
        ? classicTokenProgramId(params.tokenProgramId)
        : undefined,
    },
  });
}

export function buildReserveObligationTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  obligationAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  claimCaseAddress?: PublicKeyish | null;
  policySeriesAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  poolAssetMint?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildObligationFlowTx({
    ...params,
    instructionName: 'reserve_obligation',
    args: { amount: params.amount },
  });
}

export function buildReleaseReserveTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  obligationAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  claimCaseAddress?: PublicKeyish | null;
  policySeriesAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  poolAssetMint?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildObligationFlowTx({
    ...params,
    instructionName: 'release_reserve',
    args: { amount: params.amount },
  });
}

export function buildSettleObligationTx(
  params: {
    authority: PublicKeyish;
    healthPlanAddress: PublicKeyish;
    reserveDomainAddress: PublicKeyish;
    fundingLineAddress: PublicKeyish;
    assetMint: PublicKeyish;
    obligationAddress: PublicKeyish;
    recentBlockhash: string;
    nextStatus: number;
    amount: bigint;
    settlementReasonHashHex?: string | null;
    claimCaseAddress?: PublicKeyish | null;
    policySeriesAddress?: PublicKeyish | null;
    capitalClassAddress?: PublicKeyish | null;
    allocationPositionAddress?: PublicKeyish | null;
    poolAssetMint?: PublicKeyish | null;
    reserveAssetRailAddress?: PublicKeyish | null;
    programId?: PublicKeyish;
  } & SettlementOutflowAccounts,
): Transaction {
  return buildObligationFlowTx({
    ...params,
    instructionName: 'settle_obligation',
    includeVault: true,
    args: {
      next_status: params.nextStatus,
      amount: params.amount,
      settlement_reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.settlementReasonHashHex),
          'settlement reason hash',
        ),
      ),
    },
  });
}

export function buildDepositReserveCapitalTx(params: {
  contributor: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  termsHashHex?: string | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const contributor = toPublicKey(params.contributor);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: contributor,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'deposit_reserve_capital',
    programId,
    args: {
      amount: params.amount,
      terms_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.termsHashHex),
          'terms hash',
        ),
      ),
    },
    accounts: {
      contributor,
      health_plan: params.healthPlanAddress,
      domain_asset_vault: deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      funding_line: params.fundingLineAddress,
      capital_contribution: deriveCapitalContributionPda({
        fundingLine: params.fundingLineAddress,
        contributor,
        programId,
      }),
      funding_line_ledger: deriveFundingLineLedgerPda({
        fundingLine: params.fundingLineAddress,
        assetMint,
        programId,
      }),
      plan_reserve_ledger: derivePlanReserveLedgerPda({
        healthPlan: params.healthPlanAddress,
        assetMint,
        programId,
      }),
      source_token_account: params.sourceTokenAccountAddress,
      asset_mint: assetMint,
      vault_token_account: domainVaultTokenAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        programId,
      }),
      token_program: classicTokenProgramId(params.tokenProgramId),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildRecordReserveEarningsTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  earningsRefHashHex: string;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'record_reserve_earnings',
    programId,
    args: {
      amount: params.amount,
      earnings_ref_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.earningsRefHashHex),
          'earnings ref hash',
        ),
      ),
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      domain_asset_vault: deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      funding_line: params.fundingLineAddress,
      funding_line_ledger: deriveFundingLineLedgerPda({
        fundingLine: params.fundingLineAddress,
        assetMint,
        programId,
      }),
      plan_reserve_ledger: derivePlanReserveLedgerPda({
        healthPlan: params.healthPlanAddress,
        assetMint,
        programId,
      }),
      source_token_account: params.sourceTokenAccountAddress,
      asset_mint: assetMint,
      vault_token_account: domainVaultTokenAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        programId,
      }),
      token_program: classicTokenProgramId(params.tokenProgramId),
    },
  });
}

export function buildReturnReserveCapitalTx(params: {
  authority: PublicKeyish;
  contributorAddress: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  reasonHashHex?: string | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'return_reserve_capital',
    programId,
    args: {
      amount: params.amount,
      reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reasonHashHex),
          'reason hash',
        ),
      ),
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      domain_asset_vault: deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: deriveDomainAssetLedgerPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      funding_line: params.fundingLineAddress,
      capital_contribution: deriveCapitalContributionPda({
        fundingLine: params.fundingLineAddress,
        contributor: params.contributorAddress,
        programId,
      }),
      funding_line_ledger: deriveFundingLineLedgerPda({
        fundingLine: params.fundingLineAddress,
        assetMint,
        programId,
      }),
      plan_reserve_ledger: derivePlanReserveLedgerPda({
        healthPlan: params.healthPlanAddress,
        assetMint,
        programId,
      }),
      asset_mint: assetMint,
      vault_token_account: domainVaultTokenAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        programId,
      }),
      recipient_token_account: params.recipientTokenAccountAddress,
      token_program: classicTokenProgramId(params.tokenProgramId),
    },
  });
}

export function buildUpdateHealthPlanControlsTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  recentBlockhash: string;
  sponsorOperator: PublicKeyish;
  claimsOperator: PublicKeyish;
  oracleAuthority?: PublicKeyish | null;
  allowedRailMask: number;
  defaultFundingPriority: number;
  oraclePolicyHashHex?: string | null;
  schemaBindingHashHex?: string | null;
  complianceBaselineHashHex?: string | null;
  pauseFlags: number;
  active: boolean;
  reasonHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'update_health_plan_controls',
    programId,
    args: {
      sponsor_operator: toPublicKey(params.sponsorOperator),
      claims_operator: toPublicKey(params.claimsOperator),
      oracle_authority: toPublicKey(params.oracleAuthority ?? ZERO_PUBKEY_KEY),
      allowed_rail_mask: params.allowedRailMask,
      default_funding_priority: params.defaultFundingPriority,
      oracle_policy_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.oraclePolicyHashHex),
          'oracle policy hash',
        ),
      ),
      schema_binding_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.schemaBindingHashHex),
          'schema binding hash',
        ),
      ),
      compliance_baseline_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.complianceBaselineHashHex),
          'compliance baseline hash',
        ),
      ),
      pause_flags: params.pauseFlags,
      active: params.active,
      reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reasonHashHex),
          'reason hash',
        ),
      ),
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
    },
  });
}

export function buildUpdateReserveDomainControlsTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  recentBlockhash: string;
  allowedRailMask: number;
  pauseFlags: number;
  active: boolean;
  reasonHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'update_reserve_domain_controls',
    programId,
    args: {
      allowed_rail_mask: params.allowedRailMask,
      pause_flags: params.pauseFlags,
      active: params.active,
      reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reasonHashHex),
          'reason hash',
        ),
      ),
    },
    accounts: {
      authority,
      reserve_domain: params.reserveDomainAddress,
    },
  });
}

export function buildVersionPolicySeriesTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  currentPolicySeriesAddress: PublicKeyish;
  recentBlockhash: string;
  seriesId: string;
  displayName: string;
  metadataUri: string;
  status: number;
  adjudicationMode: number;
  termsHashHex?: string | null;
  pricingHashHex?: string | null;
  payoutHashHex?: string | null;
  reserveModelHashHex?: string | null;
  comparabilityHashHex?: string | null;
  policyOverridesHashHex?: string | null;
  cycleSeconds: bigint;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const nextPolicySeries = derivePolicySeriesPda({
    healthPlan: params.healthPlanAddress,
    seriesId: params.seriesId,
    programId,
  });
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'version_policy_series',
    programId,
    args: {
      series_id: params.seriesId,
      display_name: params.displayName,
      metadata_uri: params.metadataUri,
      status: params.status,
      adjudication_mode: params.adjudicationMode,
      terms_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.termsHashHex),
          'terms hash',
        ),
      ),
      pricing_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.pricingHashHex),
          'pricing hash',
        ),
      ),
      payout_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.payoutHashHex),
          'payout hash',
        ),
      ),
      reserve_model_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reserveModelHashHex),
          'reserve model hash',
        ),
      ),
      comparability_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.comparabilityHashHex),
          'comparability hash',
        ),
      ),
      policy_overrides_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.policyOverridesHashHex),
          'policy overrides hash',
        ),
      ),
      cycle_seconds: params.cycleSeconds,
    },
    accounts: {
      authority,
      health_plan: params.healthPlanAddress,
      current_policy_series: params.currentPolicySeriesAddress,
      next_policy_series: nextPolicySeries,
      system_program: SystemProgram.programId,
    },
  });
}

export function buildAuthorizeClaimRecipientTx(params: {
  authority: PublicKeyish;
  claimCaseAddress: PublicKeyish;
  recentBlockhash: string;
  delegateRecipient: PublicKeyish;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'authorize_claim_recipient',
    programId,
    args: {
      delegate_recipient: toPublicKey(params.delegateRecipient),
    },
    accounts: {
      authority,
      claim_case: params.claimCaseAddress,
    },
  });
}

export function buildCreateHealthPlanTx(params: {
  planAdmin: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  recentBlockhash: string;
  planId: string;
  displayName: string;
  organizationRef: string;
  metadataUri: string;
  sponsor: PublicKeyish;
  sponsorOperator: PublicKeyish;
  claimsOperator: PublicKeyish;
  oracleAuthority?: PublicKeyish | null;
  allowedRailMask: number;
  defaultFundingPriority: number;
  oraclePolicyHashHex?: string | null;
  schemaBindingHashHex?: string | null;
  complianceBaselineHashHex?: string | null;
  pauseFlags: number;
  programId?: PublicKeyish;
}): Transaction {
  const planAdmin = toPublicKey(params.planAdmin);
  const programId = params.programId ?? getProgramId();
  const healthPlan = deriveHealthPlanPda({
    reserveDomain: params.reserveDomainAddress,
    planId: params.planId,
    programId,
  });
  return buildConvenienceTransaction({
    feePayer: planAdmin,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_health_plan',
    programId,
    args: {
      plan_id: params.planId,
      display_name: params.displayName,
      organization_ref: params.organizationRef,
      metadata_uri: params.metadataUri,
      sponsor: toPublicKey(params.sponsor),
      sponsor_operator: toPublicKey(params.sponsorOperator),
      claims_operator: toPublicKey(params.claimsOperator),
      oracle_authority: toPublicKey(params.oracleAuthority ?? ZERO_PUBKEY_KEY),
      allowed_rail_mask: params.allowedRailMask,
      default_funding_priority: params.defaultFundingPriority,
      oracle_policy_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.oraclePolicyHashHex),
          'oracle policy hash',
        ),
      ),
      schema_binding_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.schemaBindingHashHex),
          'schema binding hash',
        ),
      ),
      compliance_baseline_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.complianceBaselineHashHex),
          'compliance baseline hash',
        ),
      ),
      pause_flags: params.pauseFlags,
    },
    accounts: {
      plan_admin: planAdmin,
      reserve_domain: params.reserveDomainAddress,
      health_plan: healthPlan,
      system_program: SystemProgram.programId,
    },
  });
}

export function compileTransactionToV0(
  transaction: Transaction,
  lookupTableAccounts: AddressLookupTableAccount[],
): VersionedTransaction {
  if (!transaction.feePayer) {
    throw new OmegaXInstructionBuildError(
      'transaction fee payer is required to compile a v0 transaction',
    );
  }
  if (!transaction.recentBlockhash) {
    throw new OmegaXInstructionBuildError(
      'transaction recentBlockhash is required to compile a v0 transaction',
    );
  }

  const message = new TransactionMessage({
    payerKey: transaction.feePayer,
    recentBlockhash: transaction.recentBlockhash,
    instructions: transaction.instructions,
  }).compileToV0Message(lookupTableAccounts);

  return new VersionedTransaction(message);
}

export async function preflightClassicTokenAccount(params: {
  connection: Connection;
  tokenAccountAddress: PublicKeyish;
  mintAddress: PublicKeyish;
  ownerAddress?: PublicKeyish | null;
  label?: string;
}): Promise<void> {
  const label = params.label ?? 'token account';
  const tokenAccount = toPublicKey(params.tokenAccountAddress);
  const expectedMint = toPublicKey(params.mintAddress);
  const expectedOwner = params.ownerAddress
    ? toPublicKey(params.ownerAddress)
    : null;
  const info = await params.connection.getAccountInfo(
    tokenAccount,
    'confirmed',
  );
  if (!info) {
    throw new OmegaXAccountNotFoundError(
      `${label} ${tokenAccount.toBase58()} does not exist`,
      {
        details: { label, tokenAccount: tokenAccount.toBase58() },
      },
    );
  }
  if (!info.owner.equals(SPL_TOKEN_PROGRAM_ID)) {
    throw new OmegaXAccountOwnerMismatchError(
      `${label} must be owned by the classic SPL Token program`,
      {
        details: {
          label,
          tokenAccount: tokenAccount.toBase58(),
          expectedOwner: SPL_TOKEN_PROGRAM_ID.toBase58(),
          actualOwner: info.owner.toBase58(),
        },
      },
    );
  }
  if (info.data.length < 72) {
    throw new OmegaXTokenAccountPreflightError(
      `${label} has invalid SPL Token account data`,
      {
        details: {
          label,
          tokenAccount: tokenAccount.toBase58(),
          dataLength: info.data.length,
        },
      },
    );
  }

  const actualMint = new PublicKey(info.data.subarray(0, 32));
  const actualOwner = new PublicKey(info.data.subarray(32, 64));
  if (!actualMint.equals(expectedMint)) {
    throw new OmegaXTokenAccountPreflightError(
      `${label} mint mismatch: expected ${expectedMint.toBase58()}, got ${actualMint.toBase58()}`,
      {
        details: {
          label,
          tokenAccount: tokenAccount.toBase58(),
          expectedMint: expectedMint.toBase58(),
          actualMint: actualMint.toBase58(),
        },
      },
    );
  }
  if (expectedOwner && !actualOwner.equals(expectedOwner)) {
    throw new OmegaXTokenAccountPreflightError(
      `${label} owner mismatch: expected ${expectedOwner.toBase58()}, got ${actualOwner.toBase58()}`,
      {
        details: {
          label,
          tokenAccount: tokenAccount.toBase58(),
          expectedOwner: expectedOwner.toBase58(),
          actualOwner: actualOwner.toBase58(),
        },
      },
    );
  }
}

export interface SafeProtocolClientOptions {
  programId?: PublicKeyish;
  unsafeAllowCustomProgramId?: boolean;
}

export type SafeFundSponsorBudgetTxParams = Omit<
  Parameters<typeof buildFundSponsorBudgetTx>[0],
  'programId'
>;
export type SafeRecordPremiumPaymentTxParams = Omit<
  Parameters<typeof buildRecordPremiumPaymentTx>[0],
  'programId'
>;
export type SafeOpenClaimCaseTxParams = Omit<
  Parameters<typeof buildOpenClaimCaseTx>[0],
  'programId'
>;
export type SafeReserveObligationTxParams = Omit<
  Parameters<typeof buildReserveObligationTx>[0],
  'programId'
>;
export type SafeReleaseReserveTxParams = Omit<
  Parameters<typeof buildReleaseReserveTx>[0],
  'programId'
>;
export type SafeSettleObligationTxParams = Omit<
  Parameters<typeof buildSettleObligationTx>[0],
  'programId'
> & {
  recipientOwnerAddress: PublicKeyish;
};
export type SafeSettleClaimCaseTxParams = Omit<
  Parameters<typeof buildSettleClaimCaseTx>[0],
  'programId'
> & {
  recipientOwnerAddress: PublicKeyish;
};

export interface SafeProtocolClient {
  connection: Connection;
  programId: PublicKey;
  raw: ProtocolClient;
  getProgramId(): PublicKey;
  buildFundSponsorBudgetTx(
    params: SafeFundSponsorBudgetTxParams,
  ): Promise<Transaction>;
  buildRecordPremiumPaymentTx(
    params: SafeRecordPremiumPaymentTxParams,
  ): Promise<Transaction>;
  buildOpenClaimCaseTx(params: SafeOpenClaimCaseTxParams): Transaction;
  buildReserveObligationTx(params: SafeReserveObligationTxParams): Transaction;
  buildReleaseReserveTx(params: SafeReleaseReserveTxParams): Transaction;
  buildSettleObligationTx(
    params: SafeSettleObligationTxParams,
  ): Promise<Transaction>;
  buildSettleClaimCaseTx(
    params: SafeSettleClaimCaseTxParams,
  ): Promise<Transaction>;
}

export function createSafeProtocolClient(
  connection: Connection,
  options?: SafeProtocolClientOptions,
): SafeProtocolClient {
  const programId = resolveProgramIdForBuild({
    programId: options?.programId,
    unsafeAllowCustomProgramId: options?.unsafeAllowCustomProgramId,
  });
  const raw = createProtocolClient(connection, programId, {
    unsafeAllowCustomProgramId: options?.unsafeAllowCustomProgramId,
  });

  const preflightDomainVaultInflow = async (params: {
    authority: PublicKeyish;
    reserveDomainAddress: PublicKeyish;
    assetMint: PublicKeyish;
    sourceTokenAccountAddress: PublicKeyish;
    vaultTokenAccountAddress?: PublicKeyish | null;
    sourceLabel: string;
  }): Promise<void> => {
    const assetMint = toPublicKey(params.assetMint);
    const vaultTokenAccount = domainVaultTokenAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      programId,
    });
    const domainAssetVault = domainVaultAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: params.sourceTokenAccountAddress,
      mintAddress: assetMint,
      ownerAddress: params.authority,
      label: params.sourceLabel,
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: vaultTokenAccount,
      mintAddress: assetMint,
      ownerAddress: domainAssetVault,
      label: 'domain vault token account',
    });
  };

  const preflightDomainVaultOutflow = async (params: {
    reserveDomainAddress: PublicKeyish;
    assetMint: PublicKeyish;
    recipientTokenAccountAddress: PublicKeyish;
    vaultTokenAccountAddress?: PublicKeyish | null;
    recipientOwnerAddress?: PublicKeyish | null;
    recipientLabel?: string;
  }): Promise<void> => {
    const assetMint = toPublicKey(params.assetMint);
    const vaultTokenAccount = domainVaultTokenAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      programId,
    });
    const domainAssetVault = domainVaultAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: vaultTokenAccount,
      mintAddress: assetMint,
      ownerAddress: domainAssetVault,
      label: 'domain vault token account',
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: params.recipientTokenAccountAddress,
      mintAddress: assetMint,
      ownerAddress: params.recipientOwnerAddress,
      label: params.recipientLabel ?? 'recipient token account',
    });
  };

  return {
    connection,
    programId,
    raw,
    getProgramId: () => programId,
    async buildFundSponsorBudgetTx(
      params: SafeFundSponsorBudgetTxParams,
    ): Promise<Transaction> {
      legacySolanaWriteDisabled(
        'createSafeProtocolClient.buildFundSponsorBudgetTx',
      );
      await preflightDomainVaultInflow({
        authority: params.authority,
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        sourceTokenAccountAddress: params.sourceTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        sourceLabel: 'sponsor funding source token account',
      });
      return buildFundSponsorBudgetTx({ ...params, programId });
    },
    async buildRecordPremiumPaymentTx(
      params: SafeRecordPremiumPaymentTxParams,
    ): Promise<Transaction> {
      legacySolanaWriteDisabled(
        'createSafeProtocolClient.buildRecordPremiumPaymentTx',
      );
      await preflightDomainVaultInflow({
        authority: params.authority,
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        sourceTokenAccountAddress: params.sourceTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        sourceLabel: 'premium source token account',
      });
      return buildRecordPremiumPaymentTx({ ...params, programId });
    },
    buildOpenClaimCaseTx(params: SafeOpenClaimCaseTxParams): Transaction {
      legacySolanaWriteDisabled(
        'createSafeProtocolClient.buildOpenClaimCaseTx',
      );
      return buildOpenClaimCaseTx({ ...params, programId });
    },
    buildReserveObligationTx(
      params: SafeReserveObligationTxParams,
    ): Transaction {
      legacySolanaWriteDisabled(
        'createSafeProtocolClient.buildReserveObligationTx',
      );
      return buildReserveObligationTx({ ...params, programId });
    },
    buildReleaseReserveTx(params: SafeReleaseReserveTxParams): Transaction {
      legacySolanaWriteDisabled(
        'createSafeProtocolClient.buildReleaseReserveTx',
      );
      return buildReleaseReserveTx({ ...params, programId });
    },
    async buildSettleObligationTx(
      params: SafeSettleObligationTxParams,
    ): Promise<Transaction> {
      legacySolanaWriteDisabled(
        'createSafeProtocolClient.buildSettleObligationTx',
      );
      await preflightDomainVaultOutflow({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        recipientTokenAccountAddress: params.recipientTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        recipientOwnerAddress: params.recipientOwnerAddress,
        recipientLabel: 'settlement recipient token account',
      });
      const {
        recipientOwnerAddress: _recipientOwnerAddress,
        ...builderParams
      } = params;
      void _recipientOwnerAddress;
      return buildSettleObligationTx({ ...builderParams, programId });
    },
    async buildSettleClaimCaseTx(
      params: SafeSettleClaimCaseTxParams,
    ): Promise<Transaction> {
      legacySolanaWriteDisabled(
        'createSafeProtocolClient.buildSettleClaimCaseTx',
      );
      await preflightDomainVaultOutflow({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        recipientTokenAccountAddress: params.recipientTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        recipientOwnerAddress: params.recipientOwnerAddress,
        recipientLabel: 'claim settlement recipient token account',
      });
      const {
        recipientOwnerAddress: _recipientOwnerAddress,
        ...builderParams
      } = params;
      void _recipientOwnerAddress;
      return buildSettleClaimCaseTx({ ...builderParams, programId });
    },
  };
}

export function createProtocolClient(
  connection: Connection,
  programId: PublicKeyish = PROTOCOL_PROGRAM_ID,
  options?: { unsafeAllowCustomProgramId?: boolean },
): ProtocolClient {
  const resolvedProgramId = resolveProgramIdForBuild({
    programId,
    unsafeAllowCustomProgramId: options?.unsafeAllowCustomProgramId,
  });
  const resolveClientProgramId = (inputProgramId?: PublicKeyish): PublicKey => {
    if (inputProgramId === undefined || inputProgramId === null) {
      return resolvedProgramId;
    }

    const requestedProgramId = toPublicKey(inputProgramId);
    if (!requestedProgramId.equals(resolvedProgramId)) {
      throw new OmegaXProgramMismatchError(
        `programId mismatch: expected ${resolvedProgramId.toBase58()}, received ${requestedProgramId.toBase58()}`,
        {
          details: {
            expectedProgramId: resolvedProgramId.toBase58(),
            actualProgramId: requestedProgramId.toBase58(),
          },
        },
      );
    }

    return resolvedProgramId;
  };

  const client: Record<string, unknown> = {
    connection,
    programId: resolvedProgramId,
    getProgramId: () => resolvedProgramId,
    buildInstruction: (
      params: BuildInstructionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      > & {
        instructionName: ProtocolInstructionName;
      },
    ) => {
      legacySolanaWriteDisabled('createProtocolClient.buildInstruction');
      return buildProtocolInstruction({
        ...params,
        programId: resolveClientProgramId(params.programId),
      });
    },
    buildTransaction: (
      params: BuildTransactionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      > & {
        instructionName: ProtocolInstructionName;
      },
    ) => {
      legacySolanaWriteDisabled('createProtocolClient.buildTransaction');
      return buildProtocolTransaction({
        ...params,
        programId: resolveClientProgramId(params.programId),
      });
    },
    decodeAccount: <T = Record<string, unknown>>(
      accountName: ProtocolAccountName,
      data: Buffer | Uint8Array,
    ): T => decodeProtocolAccount<T>(accountName, data),
    async fetchAccount<T = Record<string, unknown>>(
      accountName: ProtocolAccountName,
      address: PublicKeyish,
    ): Promise<T | null> {
      const resolvedAddress = toPublicKey(address);
      const info = await connection.getAccountInfo(
        resolvedAddress,
        'confirmed',
      );
      if (!info) return null;
      return decodeFetchedProtocolAccount<T>(
        accountName,
        resolvedAddress,
        info,
        resolvedProgramId,
      );
    },
  };

  for (const instructionName of listProtocolInstructionNames()) {
    const pascalName = pascalCase(instructionName);
    client[`build${pascalName}Instruction`] = (
      params: BuildInstructionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      >,
    ) => {
      legacySolanaWriteDisabled(
        `createProtocolClient.build${pascalName}Instruction`,
      );
      return buildProtocolInstruction({
        ...params,
        instructionName,
        programId: resolveClientProgramId(params.programId),
      });
    };

    client[`build${pascalName}Tx`] = (
      params: BuildTransactionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      >,
    ) => {
      legacySolanaWriteDisabled(`createProtocolClient.build${pascalName}Tx`);
      return buildProtocolTransaction({
        ...params,
        instructionName,
        programId: resolveClientProgramId(params.programId),
      });
    };
  }

  for (const accountName of listProtocolAccountNames()) {
    client[`fetch${accountName}`] = async (
      address: PublicKeyish,
    ): Promise<Record<string, unknown> | null> => {
      const resolvedAddress = toPublicKey(address);
      const info = await connection.getAccountInfo(
        resolvedAddress,
        'confirmed',
      );
      if (!info) return null;
      return decodeFetchedProtocolAccount(
        accountName,
        resolvedAddress,
        info,
        resolvedProgramId,
      );
    };
  }

  return client as unknown as ProtocolClient;
}

export {
  PROTOCOL_ACCOUNT_DISCRIMINATORS,
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  PROTOCOL_PROGRAM_ID,
  getProgramId,
};
