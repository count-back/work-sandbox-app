import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serve } from './helpers.js';

const json = body => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const patchJson = body => ({ method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

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

test('patches only the name and persists it', async () => {
  const s = await serve();
  try {
    const created = await (await fetch(`${s.url}/users`, json({ name: 'Ada', email: 'ada@example.com' }))).json();
    const r = await fetch(`${s.url}/users/${created.id}`, patchJson({ name: 'Grace' }));
    assert.equal(r.status, 200);
    const u = await r.json();
    assert.equal(u.name, 'Grace');
    assert.equal(u.email, 'ada@example.com');
    const persisted = await (await fetch(`${s.url}/users/${created.id}`)).json();
    assert.equal(persisted.name, 'Grace');
    assert.equal(persisted.email, 'ada@example.com');
  } finally {
    await s.close();
  }
});

test('patches only the email and leaves the name unchanged', async () => {
  const s = await serve();
  try {
    const created = await (await fetch(`${s.url}/users`, json({ name: 'Ada', email: 'ada@example.com' }))).json();
    const r = await fetch(`${s.url}/users/${created.id}`, patchJson({ email: 'grace@example.com' }));
    assert.equal(r.status, 200);
    const u = await r.json();
    assert.equal(u.name, 'Ada');
    assert.equal(u.email, 'grace@example.com');
  } finally {
    await s.close();
  }
});

test('rejects invalid PATCH payloads without changing the user', async () => {
  const s = await serve();
  try {
    const created = await (await fetch(`${s.url}/users`, json({ name: 'Ada', email: 'ada@example.com' }))).json();
    for (const body of [{ name: '' }, { name: '   ' }, { email: 'not-an-email' }]) {
      const r = await fetch(`${s.url}/users/${created.id}`, patchJson(body));
      assert.equal(r.status, 400);
    }
    const u = await (await fetch(`${s.url}/users/${created.id}`)).json();
    assert.equal(u.name, 'Ada');
    assert.equal(u.email, 'ada@example.com');
  } finally {
    await s.close();
  }
});

test('returns 404 when patching a missing user', async () => {
  const s = await serve();
  try {
    const r = await fetch(`${s.url}/users/999999`, patchJson({ name: 'Grace' }));
    assert.equal(r.status, 404);
  } finally {
    await s.close();
  }
});
