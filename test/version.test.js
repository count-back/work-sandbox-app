import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { serve } from './helpers.js';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

test('GET /version', async () => {
  const s = await serve();
  try {
    const r = await fetch(`${s.url}/version`);
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { version });
  } finally {
    await s.close();
  }
});
