import { OmegaXError, type OmegaXErrorOptions } from '../errors.js';

/** Base class for the canonical Robinhood Chain SDK surface. */
export class NakamaRobinhoodError extends OmegaXError {}

export class NakamaRobinhoodConfigError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_CONFIG_ERROR' });
  }
}

export class NakamaRobinhoodAddressError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_ADDRESS_ERROR' });
  }
}

export class NakamaRobinhoodWrongChainError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_WRONG_CHAIN' });
  }
}

export class NakamaRobinhoodAssetError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_ASSET_ERROR' });
  }
}

export class NakamaRobinhoodArtifactError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_ARTIFACT_ERROR' });
  }
}

export class NakamaRobinhoodContractError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_CONTRACT_ERROR' });
  }
}

export class NakamaRobinhoodSimulationError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_SIMULATION_ERROR' });
  }
}

export class NakamaRobinhoodReceiptError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_RECEIPT_ERROR' });
  }
}

export class NakamaRobinhoodSignatureError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_SIGNATURE_ERROR' });
  }
}

export class NakamaRobinhoodAccountPolicyError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'NAKAMA_ROBINHOOD_ACCOUNT_POLICY_ERROR',
    });
  }
}

export class NakamaRobinhoodStaleStateError extends NakamaRobinhoodError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAKAMA_ROBINHOOD_STALE_STATE' });
  }
}
