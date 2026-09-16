import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const TEST_PORT = 3110;

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
server.stdout.on('data', (chunk) => {
    output += chunk.toString();
});
server.stderr.on('data', (chunk) => {
    output += chunk.toString();
});

async function waitForServer() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            const response = await fetch(`http://localhost:${TEST_PORT}/api/health`);
            if (response.ok) return;
        } catch (_error) {
            // server starting up
        }
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

test('health endpoint is available', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.services.database, 'UP');
});

test('login returns a JWT for seeded admin user', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@bhoomisetu.demo',
            password: 'demo-admin-password'
        })
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.role, 'NATIONAL_ADMIN');
});

test('project listing requires authentication', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/projects`);
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
});

test('docs endpoint exposes web API overview', async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}/api/docs`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.endpoints));
    assert.ok(body.data.endpoints.some((entry) => entry.path === '/api/auth/login'));
});
