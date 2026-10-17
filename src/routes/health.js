import { send } from '../http.js';

export const routes = [
  ['GET', /^\/health$/, (req, res) => send(res, 200, { ok: true })],
];
