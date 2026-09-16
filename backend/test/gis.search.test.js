import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const port = 3118;
const server = spawn('node', ['src/server.js'], {
    cwd: backendRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
});
let output = '';
server.stdout.on('data', (chunk) => { output += chunk.toString(); });
server.stderr.on('data', (chunk) => { output += chunk.toString(); });

async function waitForServer() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            if ((await fetch(`http://localhost:${port}/api/health`)).ok) return;
        } catch (_error) {
            // server starting up
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Server did not start. Output: ${output}`);
}

async function request(path, options = {}) {
    const response = await fetch(`http://localhost:${port}${path}`, options);
    return { response, body: await response.json() };
}

test.before(async () => { await waitForServer(); });
test.after(async () => { server.kill('SIGTERM'); await once(server, 'exit'); });

test('GIS GeoJSON and affected parcel endpoints return map-safe data', async () => {
    const login = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' })
    });
    const headers = { Authorization: `Bearer ${login.body.data.token}` };
    const projects = await request('/api/projects?pageSize=1', { headers });
    const project = projects.body.data.items[0];
    assert.ok(project?.id);

    const affected = await request(`/api/projects/${project.id}/affected-parcels?riskLevel=LOW&affectedPercentage=0&pageSize=3`, { headers });
    assert.equal(affected.response.status, 200);
    assert.ok(Array.isArray(affected.body.data.items));
    assert.ok('pagination' in affected.body.data);
    for (const parcel of affected.body.data.items) {
        assert.equal(parcel.projectId, project.id);
        assert.equal(typeof parcel.affectedPercentage, 'number');
        assert.ok(!('geometry' in parcel));
    }

    const geojson = await request(`/api/projects/${project.id}/geojson?district=Assam`, { headers });
    assert.equal(geojson.response.status, 200);
    assert.equal(geojson.body.data.type, 'FeatureCollection');
    assert.ok(Array.isArray(geojson.body.data.features));
    for (const feature of geojson.body.data.features) {
        assert.equal(feature.type, 'Feature');
        assert.ok(feature.geometry);
        assert.equal(feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon', true);
        assert.equal(feature.properties.projectId, project.id);
        assert.ok('riskLevel' in feature.properties);
        assert.ok(!('rawSourcePayload' in feature.properties));
    }

    if (affected.body.data.items[0]) {
        const geometry = await request(`/api/parcels/${affected.body.data.items[0].parcelId}/geometry`, { headers });
        assert.equal(geometry.response.status, 200);
        assert.equal(geometry.body.data.parcelId, affected.body.data.items[0].parcelId);
        assert.ok(geometry.body.data.geometry);
    }
});

test('parcel and project filters combine with pagination and validate bad values', async () => {
    const login = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' })
    });
    const headers = { Authorization: `Bearer ${login.body.data.token}` };
    const projects = await request('/api/projects?search=Assam&page=1&pageSize=2&status=ACTIVE&riskLevel=LOW', { headers });
    assert.equal(projects.response.status, 200);
    assert.ok(projects.body.data.pagination.pageSize === 2);
    assert.ok(projects.body.data.items.every((project) => project.status === 'ACTIVE'));

    const parcels = await request('/api/parcels?search=Demo%20Village&sourceSystem=ASSAM_DEMO_IMPORT&village=Demo&page=1&pageSize=2', { headers });
    assert.equal(parcels.response.status, 200);
    assert.ok(parcels.body.data.pagination.total >= parcels.body.data.items.length);
    assert.ok(parcels.body.data.items.every((parcel) => parcel.sourceSystem === 'ASSAM_DEMO_IMPORT'));

    const invalid = await request('/api/parcels?riskLevel=NOT_A_LEVEL', { headers });
    assert.equal(invalid.response.status, 400);
    assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
});
