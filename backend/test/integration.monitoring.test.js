import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const testPort = 3117;
const server = spawn('node', ['src/server.js'], {
    cwd: backendRoot,
    env: { ...process.env, PORT: String(testPort) },
    stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', (chunk) => { output += chunk.toString(); });
server.stderr.on('data', (chunk) => { output += chunk.toString(); });

async function waitForServer() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            const response = await fetch(`http://localhost:${testPort}/api/health`);
            if (response.ok) return;
        } catch (_error) {
            // server starting up
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Server did not start. Output: ${output}`);
}

async function request(path, options = {}) {
    const response = await fetch(`http://localhost:${testPort}${path}`, options);
    return { response, body: await response.json() };
}

test.before(async () => {
    await waitForServer();
});

test.after(async () => {
    server.kill('SIGTERM');
    await once(server, 'exit');
});

test('integration monitoring endpoints return sanitized source health data', async () => {
    const login = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' })
    });
    const token = login.body.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const integrations = await request('/api/integrations', { headers });
    assert.equal(integrations.response.status, 200);
    assert.ok(Array.isArray(integrations.body.data));
    if (integrations.body.data.length > 0) {
        assert.ok('sourceSystem' in integrations.body.data[0]);
        assert.ok('freshnessStatus' in integrations.body.data[0]);
        assert.ok(!('rawSnapshotRef' in integrations.body.data[0]));
    }

    const assamStatus = await request('/api/integrations/assam/status', { headers });
    assert.equal(assamStatus.response.status, 200);
    assert.equal(assamStatus.body.data.sourceSystem, 'BHUNAKSHA');
    assert.ok('connectionStatus' in assamStatus.body.data);
    assert.ok('lastSuccessfulSync' in assamStatus.body.data);
    assert.ok('lastAttemptedSync' in assamStatus.body.data);
    assert.ok('recordsFetched' in assamStatus.body.data);
    assert.ok('inserted' in assamStatus.body.data);
    assert.ok('updated' in assamStatus.body.data);
    assert.ok('rejected' in assamStatus.body.data);
    assert.ok('failed' in assamStatus.body.data);
    assert.ok(['FRESH', 'STALE', 'LOCAL_SNAPSHOT', 'UNAVAILABLE'].includes(assamStatus.body.data.freshnessStatus));

    const logs = await request('/api/integrations/sync-logs?limit=5', { headers });
    assert.equal(logs.response.status, 200);
    assert.ok(Array.isArray(logs.body.data));
    if (logs.body.data.length > 0) {
        const detail = await request(`/api/integrations/sync-logs/${logs.body.data[0].id}`, { headers });
        assert.equal(detail.response.status, 200);
        assert.equal(detail.body.data.id, logs.body.data[0].id);
        assert.ok('recordsInserted' in detail.body.data);
        assert.ok(!('rawSnapshotRef' in detail.body.data));
    }
});

test('integration monitoring endpoints require authentication', async () => {
    const status = await request('/api/integrations/assam/status');
    assert.equal(status.response.status, 401);
    assert.equal(status.body.error.code, 'UNAUTHORIZED');
});
