import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const TEST_PORT = 3112;
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

test('GET /api/dashboard/national', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/dashboard/national`, { headers: { 'Authorization': `Bearer ${token}` } });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.data.stageDistribution));
});

test('GET /api/dashboard/state/:stateId', async () => {
    const state = await prisma.state.findFirst();
    const res = await fetch(`http://localhost:${TEST_PORT}/api/dashboard/state/${state.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.data.stageDistribution));
});

test('GET /api/dashboard/district/:districtId', async () => {
    const district = await prisma.district.findFirst();
    const res = await fetch(`http://localhost:${TEST_PORT}/api/dashboard/district/${district.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.data.stageDistribution));
});

test('GET /api/dashboard/project/:projectId', async () => {
    const project = await prisma.project.findFirst();
    const res = await fetch(`http://localhost:${TEST_PORT}/api/dashboard/project/${project.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.data.stageDistribution));
});
