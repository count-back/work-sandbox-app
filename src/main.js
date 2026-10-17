import { start } from './server.js';

const server = await start(Number(process.env.PORT) || 3000);
console.log(`listening on http://127.0.0.1:${server.address().port}`);
