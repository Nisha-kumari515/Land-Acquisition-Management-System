import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const TEST_PORT = 3111;

const server = spawn('node', ['src/server.js'], {
    cwd: backendRoot,
    env: {
        ...process.env,
        PORT: String(TEST_PORT),
        DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://bhoomisetu:bhoomisetu_dev@localhost:5433/bhoomisetu?schema=public',
        CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:3000'
    },
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
let projectId = '';
let parcelId = '';
let verificationId = '';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

test.before(async () => {
    await waitForServer();
    const loginRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' })
    });
    const loginBody = await loginRes.json();
    token = loginBody.data.token;
    
    const project = await prisma.project.findFirst();
    if (!project) throw new Error('No project found');
    projectId = project.id;
    
    const parcel = await prisma.parcel.findFirst();
    if (!parcel) throw new Error('No parcel found');
    parcelId = parcel.id;
});

test.after(async () => {
    server.kill('SIGTERM');
    await once(server, 'exit');
});

test('Unauthorized access should fail', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/field-verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelId, projectId })
    });
    assert.equal(res.status, 401);
});

test('Create verification with invalid coordinates should fail', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/field-verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ parcelId, projectId, latitude: 100, longitude: 200 })
    });
    assert.equal(res.status, 400);
});

test('Create verification successfully', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/field-verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ parcelId, projectId, latitude: 20.5, longitude: 80.5, verificationStatus: 'ASSIGNED', remarks: 'Test creation' })
    });
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.data.verificationStatus, 'ASSIGNED');
    assert.equal(body.data.project.id, projectId);
    verificationId = body.data.id;
});

test('Update verification status', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/field-verifications/${verificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ verificationStatus: 'VERIFIED', remarks: 'Verification done' })
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.data.verificationStatus, 'VERIFIED');
});

test('Audit log was created', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/audit?entityId=${verificationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.data.some(log => log.action === 'FIELD_VERIFICATION_CREATED'));
    assert.ok(body.data.some(log => log.action === 'FIELD_VERIFICATION_UPDATED'));
});
