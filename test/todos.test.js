import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serve } from './helpers.js';

const json = body => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('create, read and delete a todo', async () => {
  const s = await serve();
  try {
    const created = await fetch(`${s.url}/todos`, json({ title: 'Write tests' }));
    assert.equal(created.status, 201);
    const t = await created.json();
    assert.equal(t.title, 'Write tests');
    assert.equal(t.done, false);
    assert.equal((await (await fetch(`${s.url}/todos/${t.id}`)).json()).title, 'Write tests');
    const list = await (await fetch(`${s.url}/todos`)).json();
    assert.ok(list.some(x => x.id === t.id));
    assert.equal((await fetch(`${s.url}/todos/${t.id}`, { method: 'DELETE' })).status, 204);
    assert.equal((await fetch(`${s.url}/todos/${t.id}`)).status, 404);
  } finally {
    await s.close();
  }
});

test('accepts an explicit done flag', async () => {
  const s = await serve();
  try {
    const created = await fetch(`${s.url}/todos`, json({ title: 'Done already', done: true }));
    assert.equal(created.status, 201);
    assert.equal((await created.json()).done, true);
  } finally {
    await s.close();
  }
});

test('rejects a todo without a title', async () => {
  const s = await serve();
  try {
    const missing = await fetch(`${s.url}/todos`, json({ done: true }));
    assert.equal(missing.status, 400);
    assert.deepEqual(await missing.json(), { error: 'title is required' });
    const blank = await fetch(`${s.url}/todos`, json({ title: '   ' }));
    assert.equal(blank.status, 400);
    assert.deepEqual(await blank.json(), { error: 'title is required' });
  } finally {
    await s.close();
  }
});

test('rejects a non-boolean done', async () => {
  const s = await serve();
  try {
    const r = await fetch(`${s.url}/todos`, json({ title: 'x', done: 'yes' }));
    assert.equal(r.status, 400);
    assert.deepEqual(await r.json(), { error: 'done must be a boolean' });
  } finally {
    await s.close();
  }
});

test('GET a missing todo is 404', async () => {
  const s = await serve();
  try {
    assert.equal((await fetch(`${s.url}/todos/9999`)).status, 404);
  } finally {
    await s.close();
  }
});

test('DELETE a missing todo is 404', async () => {
  const s = await serve();
  try {
    assert.equal((await fetch(`${s.url}/todos/9999`, { method: 'DELETE' })).status, 404);
  } finally {
    await s.close();
  }
});
