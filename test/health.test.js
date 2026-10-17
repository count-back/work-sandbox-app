import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serve } from './helpers.js';

test('GET /health', async () => {
  const s = await serve();
  try {
    const r = await fetch(`${s.url}/health`);
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { ok: true });
  } finally {
    await s.close();
  }
});

test('unknown path is 404', async () => {
  const s = await serve();
  try {
    assert.equal((await fetch(`${s.url}/nope`)).status, 404);
  } finally {
    await s.close();
  }
});
