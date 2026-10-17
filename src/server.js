import { createServer } from 'node:http';
import { handle } from './router.js';

export function start(port = 0) {
  const server = createServer(handle);
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}
