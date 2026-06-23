// FROZEN runtime contract — TODO(NAKAMA-REBRAND-07): the exported OmegaX* symbols and the
// OMEGAX_* error.code strings in this file are public API that consumers key off via
// `instanceof` + error.code. Do NOT rename piecemeal during the rebrand; rename only as a
// coordinated breaking major across producers + consumers.
export type OmegaXErrorDetails = Record<string, unknown>;

export interface OmegaXErrorOptions {
  code: string;
  details?: OmegaXErrorDetails;
  cause?: unknown;
}

export class OmegaXError extends Error {
  readonly code: string;
  readonly details?: OmegaXErrorDetails;

  constructor(message: string, options: OmegaXErrorOptions) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code;
    this.details = options.details;
  }
}

export class OmegaXConfigError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_CONFIG_ERROR',
    });
  }
}

export class OmegaXInvalidPublicKeyError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_INVALID_PUBLIC_KEY',
    });
  }
}

export class OmegaXProgramMismatchError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_PROGRAM_MISMATCH',
    });
  }
}

export class OmegaXAccountNotFoundError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_ACCOUNT_NOT_FOUND',
    });
  }
}

export class OmegaXAccountOwnerMismatchError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_ACCOUNT_OWNER_MISMATCH',
    });
  }
}

export class OmegaXTokenAccountPreflightError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_TOKEN_ACCOUNT_PREFLIGHT',
    });
  }
}

export class OmegaXInstructionBuildError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_INSTRUCTION_BUILD',
    });
  }
}

export class OmegaXTransactionDecodeError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_TRANSACTION_DECODE',
    });
  }
}

export class OmegaXRpcError extends OmegaXError {
  constructor(message: string, options: Omit<OmegaXErrorOptions, 'code'> = {}) {
    super(message, {
      ...options,
      code: 'OMEGAX_RPC_ERROR',
    });
  }
}
