import { readFileSync } from 'node:fs';
import { send } from '../http.js';

const { version } = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
);

export const routes = [
  ['GET', /^\/version$/, (req, res) => send(res, 200, { version })],
];
