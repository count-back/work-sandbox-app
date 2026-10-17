import { readJson, send } from '../http.js';
import { createCollection } from '../store.js';

const todos = createCollection();

// When `partial` is true only the fields present in the body are validated.
function validate(body, partial = false) {
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) return 'title is required';
  }
  if (body.done !== undefined && typeof body.done !== 'boolean') return 'done must be a boolean';
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
    const n = Number(id);
    if (!todos.get(n)) return send(res, 404, { error: 'not found' });
    const body = await readJson(req);
    const err = validate(body, true);
    if (err) return send(res, 400, { error: err });
    const fields = {};
    if (body.title !== undefined) fields.title = body.title.trim();
    if (body.done !== undefined) fields.done = body.done;
    send(res, 200, todos.update(n, fields));
  }],
  ['DELETE', /^\/todos\/(\d+)$/, (req, res, [id]) => {
    return todos.remove(Number(id)) ? send(res, 204) : send(res, 404, { error: 'not found' });
  }],
];
