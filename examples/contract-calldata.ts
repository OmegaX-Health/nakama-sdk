import {
  NAKAMA_POLICY_REGISTRY_ABI,
  decodeEthereumCalldata,
  encodeEthereumCalldata,
} from '@nakama-health/protocol-sdk/ethereum_contract';

const calldata = encodeEthereumCalldata({
  abi: NAKAMA_POLICY_REGISTRY_ABI,
  functionName: 'deriveClaimId',
  args: [
    `0x${'11'.repeat(32)}`,
    '0x0000000000000000000000000000000000000001',
    `0x${'22'.repeat(32)}`,
  ],
});
const decoded = decodeEthereumCalldata({
  abi: NAKAMA_POLICY_REGISTRY_ABI,
  data: calldata,
});

console.log(
  JSON.stringify(
    {
      ok: true,
      functionName: decoded.functionName,
      calldata,
      argumentCount: decoded.args?.length ?? 0,
    },
    null,
    2,
  ),
);
