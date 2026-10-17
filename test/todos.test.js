import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serve } from './helpers.js';

const json = body => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('creates a todo with done defaulting to false and a trimmed title', async () => {
  const s = await serve();
  try {
    const r = await fetch(`${s.url}/todos`, json({ title: '  write tests  ' }));
    assert.equal(r.status, 201);
    const t = await r.json();
    assert.equal(t.title, 'write tests');
    assert.equal(t.done, false);
    assert.equal(typeof t.id, 'number');
  } finally {
    await s.close();
  }
});

test('lists created todos and reads a single one', async () => {
  const s = await serve();
  try {
    const created = await (await fetch(`${s.url}/todos`, json({ title: 'list me' }))).json();
    const list = await (await fetch(`${s.url}/todos`)).json();
    assert.ok(Array.isArray(list));
    assert.ok(list.some(t => t.id === created.id && t.title === 'list me'));
    const one = await (await fetch(`${s.url}/todos/${created.id}`)).json();
    assert.equal(one.id, created.id);
    assert.equal(one.title, 'list me');
  } finally {
    await s.close();
  }
});

test('patches done and title and persists the changes', async () => {
  const s = await serve();
  try {
    const created = await (await fetch(`${s.url}/todos`, json({ title: 'before' }))).json();
    const patched = await fetch(`${s.url}/todos/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '  after  ', done: true, id: 9999, extra: 'ignored' }),
    });
    assert.equal(patched.status, 200);
    const p = await patched.json();
    assert.equal(p.id, created.id);
    assert.equal(p.title, 'after');
    assert.equal(p.done, true);
    const reread = await (await fetch(`${s.url}/todos/${created.id}`)).json();
    assert.equal(reread.title, 'after');
    assert.equal(reread.done, true);
    assert.equal(reread.id, created.id);
  } finally {
    await s.close();
  }
});

test('deletes a todo and then returns 404', async () => {
  const s = await serve();
  try {
    const created = await (await fetch(`${s.url}/todos`, json({ title: 'delete me' }))).json();
    assert.equal((await fetch(`${s.url}/todos/${created.id}`, { method: 'DELETE' })).status, 204);
    assert.equal((await fetch(`${s.url}/todos/${created.id}`)).status, 404);
  } finally {
    await s.close();
  }
});

test('rejects a todo without a non-blank string title', async () => {
  const s = await serve();
  try {
    assert.equal((await fetch(`${s.url}/todos`, json({}))).status, 400);
    assert.equal((await fetch(`${s.url}/todos`, json({ title: '   ' }))).status, 400);
    assert.equal((await fetch(`${s.url}/todos`, json({ title: 42 }))).status, 400);
  } finally {
    await s.close();
  }
});

test('rejects a non-boolean done on create and patch', async () => {
  const s = await serve();
  try {
    const bad = await fetch(`${s.url}/todos`, json({ title: 'x', done: 'yes' }));
    assert.equal(bad.status, 400);

    const created = await (await fetch(`${s.url}/todos`, json({ title: 'patch me' }))).json();
    const patched = await fetch(`${s.url}/todos/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ done: 'yes' }),
    });
    assert.equal(patched.status, 400);
  } finally {
    await s.close();
  }
});

test('returns 404 when patching or deleting a missing todo', async () => {
  const s = await serve();
  try {
    const missing = 999999999;
    assert.equal((await fetch(`${s.url}/todos/${missing}`)).status, 404);
    const patched = await fetch(`${s.url}/todos/${missing}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ done: true }),
    });
    assert.equal(patched.status, 404);
    assert.equal((await fetch(`${s.url}/todos/${missing}`, { method: 'DELETE' })).status, 404);
  } finally {
    await s.close();
  }
});
