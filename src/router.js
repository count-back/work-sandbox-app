// Route table: every module exports `routes` as [method, pattern, handler] triples.
import { send } from './http.js';
import { routes as health } from './routes/health.js';
import { routes as users } from './routes/users.js';
import { routes as todos } from './routes/todos.js';

const table = [
  ...health,
  ...users,
  ...todos,
];

export async function handle(req, res) {
  const path = new URL(req.url, 'http://x').pathname;
  for (const [method, pattern, handler] of table) {
    const m = path.match(pattern);
    if (m && req.method === method) {
      try {
        return await handler(req, res, m.slice(1));
      } catch (e) {
        return send(res, e.status || 500, { error: e.status ? e.message : 'internal error' });
      }
    }
  }
  send(res, 404, { error: 'not found' });
}
