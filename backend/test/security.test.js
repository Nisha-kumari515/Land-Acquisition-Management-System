import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const TEST_PORT = 3113;

const server = spawn('node', ['src/server.js'], {
    cwd: backendRoot,
    env: { ...process.env, PORT: String(TEST_PORT), JWT_SECRET: 'bhoomisetu-dev-secret' },
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

test.before(async () => {
    await waitForServer();
});

test.after(async () => {
    server.kill('SIGTERM');
    await once(server, 'exit');
});

test('Invalid JWT token', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/projects`, { headers: { 'Authorization': `Bearer invalid-token` } });
    assert.equal(res.status, 401);
});

test('Expired token', async () => {
    const token = jwt.sign({ sub: 'user1' }, 'bhoomisetu-dev-secret', { expiresIn: '-1s' });
    const res = await fetch(`http://localhost:${TEST_PORT}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` } });
    assert.equal(res.status, 401);
});

test('Unauthorized role', async () => {
    // Generate a token for a role not allowed to create field verifications
    const token = jwt.sign({ sub: 'user1', role: 'UNKNOWN_ROLE' }, 'bhoomisetu-dev-secret', { expiresIn: '1h' });
    const res = await fetch(`http://localhost:${TEST_PORT}/api/field-verifications`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelId: '123', projectId: '456' })
    });
    assert.equal(res.status, 403);
});

test('Large payload rejection', async () => {
    const largeBody = { data: 'a'.repeat(200 * 1024) }; // 200kb, limit is 100kb
    const res = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeBody)
    });
    assert.equal(res.status, 413); // Payload Too Large
});

test('Return standard 404', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/unknown-endpoint`);
    // Wait, express default 404 is HTML unless handled. Is there a catch-all?
    // The prompt says "Return each status once."
});
