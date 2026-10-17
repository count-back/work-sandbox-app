import { start } from '../src/server.js';

// Start a server on a free port; returns { url, close }.
export async function serve() {
  const server = await start(0);
  const url = `http://127.0.0.1:${server.address().port}`;
  return { url, close: () => new Promise(r => server.close(r)) };
}
