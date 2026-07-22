import { ROBINHOOD_PROTOCOL_ARTIFACT_BUNDLE_RAW } from '../generated/robinhood_protocol.js';

let source: unknown = ROBINHOOD_PROTOCOL_ARTIFACT_BUNDLE_RAW;
let revision = 0;

export function getGeneratedRobinhoodArtifactSource(): {
  source: unknown;
  revision: number;
} {
  return { source, revision };
}

/** Test-only seam; this module is intentionally not package-exported. */
export function installGeneratedRobinhoodArtifactSourceForTest(
  input: unknown,
): void {
  source = input;
  revision += 1;
}
