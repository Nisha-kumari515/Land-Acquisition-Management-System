import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const TEST_PORT = 3114;

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

test('Returns standard 404 for unknown endpoints', async () => {
    const token = jwt.sign({ sub: 'user1' }, 'bhoomisetu-dev-secret', { expiresIn: '1h' });
    const res = await fetch(`http://localhost:${TEST_PORT}/api/unknown-endpoint`, { headers: { 'Authorization': `Bearer ${token}` } });
    const body = await res.json();
    assert.equal(res.status, 404);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.message, 'Endpoint not found');
});

test('Returns standard 401 for unauthorized endpoints', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/projects`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
});
