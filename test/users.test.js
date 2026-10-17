import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serve } from './helpers.js';

const json = body => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('create, read and delete a user', async () => {
  const s = await serve();
  try {
    const created = await fetch(`${s.url}/users`, json({ name: 'Ada', email: 'ada@example.com' }));
    assert.equal(created.status, 201);
    const u = await created.json();
    assert.equal(u.name, 'Ada');
    assert.equal((await (await fetch(`${s.url}/users/${u.id}`)).json()).email, 'ada@example.com');
    assert.equal((await fetch(`${s.url}/users/${u.id}`, { method: 'DELETE' })).status, 204);
    assert.equal((await fetch(`${s.url}/users/${u.id}`)).status, 404);
  } finally {
    await s.close();
  }
});

test('rejects a user without a name', async () => {
  const s = await serve();
  try {
    const r = await fetch(`${s.url}/users`, json({ email: 'x@y.z' }));
    assert.equal(r.status, 400);
  } finally {
    await s.close();
  }
});
