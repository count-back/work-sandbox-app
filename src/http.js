// Request/response helpers shared by every route module.

export async function readJson(req) {
  let s = '';
  for await (const chunk of req) s += chunk;
  if (!s) return {};
  try {
    return JSON.parse(s);
  } catch {
    throw Object.assign(new Error('invalid JSON body'), { status: 400 });
  }
}

export function send(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(data === undefined ? '' : JSON.stringify(data));
}
