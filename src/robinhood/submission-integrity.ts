const TRUSTED_SUBMISSIONS = new WeakSet<object>();

/** Internal capability marker; this module is intentionally not package-exported. */
export function sealTrustedRobinhoodSubmission<T extends object>(input: T): T {
  const submission = Object.freeze({ ...input });
  TRUSTED_SUBMISSIONS.add(submission);
  return submission;
}

export function isTrustedRobinhoodSubmission(input: object): boolean {
  return TRUSTED_SUBMISSIONS.has(input) && Object.isFrozen(input);
}
