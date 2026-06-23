import { GET } from './route.js';

const response = await GET();
if (!response.ok) {
  throw new Error(`Unexpected response status ${response.status}`);
}

const payload = (await response.json()) as {
  ok?: boolean;
  instructions?: number;
  accounts?: number;
};

if (!payload.ok || !payload.instructions || !payload.accounts) {
  throw new Error('Nakama route smoke did not return protocol metadata.');
}

console.log(JSON.stringify(payload, null, 2));
