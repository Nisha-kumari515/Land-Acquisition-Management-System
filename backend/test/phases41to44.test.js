import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const TEST_PORT = 3116;
const prisma = new PrismaClient();

const server = spawn('node', ['src/server.js'], {
    cwd: backendRoot,
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', (chunk) => { output += chunk.toString(); });
server.stderr.on('data', (chunk) => { output += chunk.toString(); });

async function waitForServer() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/health`);
            if (response.ok) return;
        } catch (_error) {}
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error(`Server did not start. Output: ${output}`);
}

let token = '';

test.before(async () => {
    await waitForServer();
    const loginRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' })
    });
    const loginBody = await loginRes.json();
    token = loginBody.data.token;
});

test.after(async () => {
    server.kill('SIGTERM');
    await once(server, 'exit');
    await prisma.$disconnect();
});

test('GET /api/search?q=highway', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/search?q=highway`, { headers: { 'Authorization': `Bearer ${token}` } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.projects));
    assert.ok(Array.isArray(body.data.parcels));
});

test('GET /api/map/parcels?bbox=88,24,96,28', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/map/parcels?bbox=88,24,96,28`, { headers: { 'Authorization': `Bearer ${token}` } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.type, 'FeatureCollection');
    assert.ok(Array.isArray(body.data.features));
});

test('POST /api/data-quality/check/parcel/:id', async () => {
    const parcel = await prisma.parcel.findFirst();
    const res = await fetch(`http://localhost:${TEST_PORT}/api/data-quality/check/parcel/${parcel.id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.status !== 200) console.log(await res.text());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.issues));
});

test('GET /api/parcels/:id/source', async () => {
    const parcel = await prisma.parcel.findFirst();
    const res = await fetch(`http://localhost:${TEST_PORT}/api/parcels/${parcel.id}/source`, { headers: { 'Authorization': `Bearer ${token}` } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.sourceSystem);
    assert.ok(body.data.dataOrigin);
});
