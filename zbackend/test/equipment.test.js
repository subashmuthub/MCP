import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import http from 'http';
import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase } from '../src/models/db.js';

let mongoServer;

test('equipment CRUD flow', async (t) => {
  let usingMemoryServer = false;
  if (!process.env.MONGODB_URI) {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    usingMemoryServer = true;
  }

  await connectDatabase();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const port = addr.port;

  const agent = request.agent(server);

  // create equipment
  const createRes = await agent.post('/api/equipment').send({ name: 'Pump A', category: 'Pump', location: 'Lab 1' });
  assert.equal(createRes.status, 201);
  const created = createRes.body.data;
  assert.ok(created.id);
  assert.equal(created.name, 'Pump A');

  // list equipment
  const listRes = await agent.get('/api/equipment');
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(listRes.body.data));

  // update equipment
  const updateRes = await agent.put(`/api/equipment/${created.id}`).send({ name: 'Pump A v2' });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.name, 'Pump A v2');

  // delete equipment
  const deleteRes = await agent.delete(`/api/equipment/${created.id}`);
  assert.equal(deleteRes.status, 200);

  server.close();
  await mongoose.disconnect();
  if (usingMemoryServer && mongoServer) {
    await mongoServer.stop();
  }
});

test('bulk equipment import creates records from spreadsheet rows', async () => {
  let usingMemoryServer = false;
  if (!process.env.MONGODB_URI) {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    usingMemoryServer = true;
  }

  await connectDatabase();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const agent = request.agent(server);

  const res = await agent.post('/api/equipment/import').send({
    rows: [
      { name: 'Desktop System', category: 'ACER', location: 'Imported', purchaseDate: '2020-01-01', usageHours: 120, age: 4 },
      { name: 'Printer', category: 'HP', location: 'Imported', purchaseDate: '2021-02-15', usageHours: 80, age: 3 },
    ]
  });

  assert.equal(res.status, 201);
  assert.equal(Array.isArray(res.body.data), true);
  assert.equal(res.body.data.length, 2);
  assert.equal(res.body.count, 2);

  server.close();
  await mongoose.disconnect();
  if (usingMemoryServer && mongoServer) {
    await mongoServer.stop();
  }
});
