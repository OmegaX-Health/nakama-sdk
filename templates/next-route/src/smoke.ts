import { GET } from './route.js';

const response = await GET();
if (!response.ok) {
  throw new Error(`Unexpected response status ${response.status}`);
}

const payload = (await response.json()) as {
  ok?: boolean;
  chainId?: number;
  caip2?: string;
  deploymentStatus?: string;
};

if (!payload.ok || payload.chainId !== 1 || payload.caip2 !== 'eip155:1') {
  throw new Error(
    'Nakama route smoke did not return Ethereum mainnet metadata.',
  );
}

console.log(JSON.stringify(payload, null, 2));
