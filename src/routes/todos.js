import { readJson, send } from '../http.js';
import { createCollection } from '../store.js';

const todos = createCollection();

function validate(body, { partial = false } = {}) {
  const hasTitle = body.title !== undefined;
  const hasDone = body.done !== undefined;
  if (partial && !hasTitle && !hasDone) return 'nothing to update';
  if (!partial || hasTitle) {
    if (typeof body.title !== 'string' || !body.title.trim()) return 'title is required';
  }
  if (hasDone && typeof body.done !== 'boolean') return 'done must be a boolean';
  return '';
}

export const routes = [
  ['GET', /^\/todos$/, (req, res) => send(res, 200, todos.list())],
  ['GET', /^\/todos\/(\d+)$/, (req, res, [id]) => {
    const t = todos.get(Number(id));
    return t ? send(res, 200, t) : send(res, 404, { error: 'not found' });
  }],
  ['POST', /^\/todos$/, async (req, res) => {
    const body = await readJson(req);
    const err = validate(body);
    if (err) return send(res, 400, { error: err });
    send(res, 201, todos.add({ title: body.title.trim(), done: body.done ?? false }));
  }],
  ['PATCH', /^\/todos\/(\d+)$/, async (req, res, [id]) => {
    const body = await readJson(req);
    const err = validate(body, { partial: true });
    if (err) return send(res, 400, { error: err });
    const patch = {};
    if (body.title !== undefined) patch.title = body.title.trim();
    if (body.done !== undefined) patch.done = body.done;
    const t = todos.update(Number(id), patch);
    return t ? send(res, 200, t) : send(res, 404, { error: 'not found' });
  }],
  ['DELETE', /^\/todos\/(\d+)$/, (req, res, [id]) => {
    return todos.remove(Number(id)) ? send(res, 204) : send(res, 404, { error: 'not found' });
  }],
];
