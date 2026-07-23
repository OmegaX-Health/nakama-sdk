import type { PreparedRobinhoodAction } from './wallet.js';

const BUILDER_PREPARED_ACTIONS = new WeakSet<object>();

/** Internal capability marker; this module is intentionally not package-exported. */
export function sealBuilderPreparedAction(
  input: PreparedRobinhoodAction,
): PreparedRobinhoodAction {
  const expectedStateChanges = Object.freeze(
    input.expectedStateChanges.map((change) => Object.freeze({ ...change })),
  );
  const action = Object.freeze({ ...input, expectedStateChanges });
  BUILDER_PREPARED_ACTIONS.add(action);
  return action;
}

export function isBuilderPreparedAction(
  input: PreparedRobinhoodAction,
): boolean {
  return BUILDER_PREPARED_ACTIONS.has(input) && Object.isFrozen(input);
}
