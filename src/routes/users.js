import { readJson, send } from '../http.js';
import { createCollection } from '../store.js';

const users = createCollection();

function validate(body) {
  if (typeof body.name !== 'string' || !body.name.trim()) return 'name is required';
  if (body.email !== undefined && !/^[^@\s]+@[^@\s]+$/.test(body.email)) return 'email is invalid';
  return '';
}

export const routes = [
  ['GET', /^\/users$/, (req, res) => send(res, 200, users.list())],
  ['GET', /^\/users\/(\d+)$/, (req, res, [id]) => {
    const u = users.get(Number(id));
    return u ? send(res, 200, u) : send(res, 404, { error: 'not found' });
  }],
  ['POST', /^\/users$/, async (req, res) => {
    const body = await readJson(req);
    const err = validate(body);
    if (err) return send(res, 400, { error: err });
    send(res, 201, users.add({ name: body.name.trim(), email: body.email ?? null }));
  }],
  ['PUT', /^\/users\/(\d+)$/, async (req, res, [id]) => {
    const body = await readJson(req);
    const err = validate(body);
    if (err) return send(res, 400, { error: err });
    const u = users.update(Number(id), { name: body.name.trim(), email: body.email ?? null });
    return u ? send(res, 200, u) : send(res, 404, { error: 'not found' });
  }],
  ['DELETE', /^\/users\/(\d+)$/, (req, res, [id]) => {
    return users.remove(Number(id)) ? send(res, 204) : send(res, 404, { error: 'not found' });
  }],
];
