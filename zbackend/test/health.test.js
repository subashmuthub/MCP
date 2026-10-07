import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';

test('backend /health responds ok', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const port = addr.port;

  const res = await fetch(`http://127.0.0.1:${port}/health`);
  const data = await res.json();
  assert.equal(data.status, 'ok');

  server.close();
});
