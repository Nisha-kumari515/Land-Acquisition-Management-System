import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prisma } from '../src/config/database.js';
import { transitionStage } from '../src/services/acquisition.service.js';
import { acquisitionStages } from '../src/constants/acquisition-stages.js';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const port = 3119;
const server = spawn('node', ['src/server.js'], { cwd: backendRoot, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
server.stdout.on('data', (chunk) => { output += chunk.toString(); });
server.stderr.on('data', (chunk) => { output += chunk.toString(); });

async function waitForServer() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
        try { if ((await fetch(`http://localhost:${port}/api/health`)).ok) return; } catch (_error) { /* starting */ }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Server did not start: ${output}`);
}
async function request(path, options = {}) {
    const response = await fetch(`http://localhost:${port}${path}`, options);
    return { response, body: await response.json() };
}

test.before(async () => { await waitForServer(); });
test.after(async () => { server.kill('SIGTERM'); await once(server, 'exit'); await prisma.$disconnect(); });

test('acquisition workflow allows only the next stage and records history', async (t) => {
    const acquisitionCase = await prisma.acquisitionCase.findFirst({ where: { currentStage: { not: 'COMPLETED' } }, include: { projectParcel: true } });
    const user = await prisma.user.findFirst({ where: { email: 'admin@bhoomisetu.demo' } });
    assert.ok(acquisitionCase && user);
    const previousStage = acquisitionCase.currentStage;
    const newStage = acquisitionStages[acquisitionStages.indexOf(previousStage) + 1];
    const result = await transitionStage(acquisitionCase.id, { newStage, changedById: user.id, remarks: 'Validated transition' });
    assert.equal(result.currentStage, newStage);
    const history = await prisma.acquisitionStageHistory.findFirst({ where: { acquisitionCaseId: acquisitionCase.id, newStage }, orderBy: { createdAt: 'desc' } });
    assert.equal(history.previousStage, previousStage);
    assert.equal(history.changedById, user.id);
    assert.equal(history.remarks, 'Validated transition');
    await assert.rejects(transitionStage(acquisitionCase.id, { newStage: 'COMPLETED', changedById: user.id }), (error) => error.code === 'INVALID_STAGE_TRANSITION' && error.status === 422);
    t.after(async () => {
        await prisma.acquisitionStageHistory.delete({ where: { id: history.id } });
        await prisma.acquisitionCase.update({ where: { id: acquisitionCase.id }, data: { currentStage: previousStage } });
        await prisma.projectParcel.update({ where: { id: acquisitionCase.projectParcelId }, data: { acquisitionStage: previousStage } });
    });
});

test('notification APIs list, filter unread, and mark read', async () => {
    const login = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' }) });
    const headers = { Authorization: `Bearer ${login.body.data.token}` };
    const all = await request('/api/notifications', { headers });
    assert.equal(all.response.status, 200);
    assert.ok(Array.isArray(all.body.data));
    if (all.body.data[0]) {
        const unread = await request('/api/notifications/unread', { headers });
        assert.equal(unread.response.status, 200);
        const marked = await request(`/api/notifications/${all.body.data[0].id}/read`, { method: 'PATCH', headers });
        assert.equal(marked.response.status, 200);
        assert.ok(marked.body.data.readAt);
    }
    const readAll = await request('/api/notifications/read-all', { method: 'PATCH', headers });
    assert.equal(readAll.response.status, 200);
});

test('document versions keep one current version and preserve history', async (t) => {
    const user = await prisma.user.findFirst({ where: { email: 'admin@bhoomisetu.demo' } });
    const project = await prisma.project.findFirst();
    const document = await prisma.document.create({ data: { name: `Test document ${Date.now()}`, documentType: 'NOTICE', projectId: project.id, uploadedById: user.id, source: 'TEST', storageRef: 'snapshot://v1' } });
    t.after(async () => { await prisma.document.delete({ where: { id: document.id } }); });
    const login = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' }) });
    const headers = { Authorization: `Bearer ${login.body.data.token}`, 'Content-Type': 'application/json' };
    const first = await request(`/api/documents/${document.id}/version`, { method: 'POST', headers, body: JSON.stringify({ storageReference: 'snapshot://v2', changeReason: 'Updated notice' }) });
    assert.equal(first.response.status, 201);
    const second = await request(`/api/documents/${document.id}/version`, { method: 'POST', headers, body: JSON.stringify({ storageReference: 'snapshot://v3', changeReason: 'Corrected notice' }) });
    assert.equal(second.response.status, 201);
    const versions = await request(`/api/documents/${document.id}/versions`, { headers });
    assert.equal(versions.response.status, 200);
    assert.equal(versions.body.data.length, 2);
    assert.equal(versions.body.data.filter((version) => version.isCurrent).length, 1);
    assert.equal(versions.body.data.find((version) => version.isCurrent).storageReference, 'snapshot://v3');
});
