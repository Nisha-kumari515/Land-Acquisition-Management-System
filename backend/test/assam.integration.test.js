import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/config/database.js';
import { getDagInfo } from '../src/clients/bhunaksha.client.js';
import { dataStatusForTimestamp, getDagInfoWithRetry, syncAssamParcel } from '../src/adapters/assam.adapter.js';
import { areaInSquareMetres, mapBhuNakshaParcel } from '../src/integrations/assam/bhunaksha.mapper.js';

const samplePayload = {
    Patta_number: '46',
    dag_area_Bigha: '14',
    dag_area_katha: '4',
    dag_area_lessa: '8.0000',
    land_class: 'Agricultural II',
    Pattadar_names: [{ Pattadar_name: 'Test Pattadar', Pattadar_father_name: 'Test Parent' }]
};

function response(body, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => typeof body === 'string' ? body : JSON.stringify(body)
    };
}

test.after(async () => {
    await prisma.$disconnect();
});

test('BhuNaksha client parses a successful response', async () => {
    const result = await getDagInfo({
        locationCode: '030102010110002',
        dagNo: '1',
        fetchImpl: async () => response(samplePayload)
    });

    assert.equal(result.payload.Patta_number, '46');
    assert.equal(result.sourceMetadata.sourceSystem, 'BHUNAKSHA');
    assert.equal(result.sourceMetadata.dataOrigin, 'OFFICIAL_API');
});

test('BhuNaksha client maps HTTP failures', async () => {
    await assert.rejects(
        getDagInfo({ locationCode: 'location', dagNo: '1', fetchImpl: async () => response({ error: 'unavailable' }, 503) }),
        (error) => error.code === 'ASSAM_API_ERROR' && error.status === 502
    );
});

test('BhuNaksha client rejects invalid JSON', async () => {
    await assert.rejects(
        getDagInfo({ locationCode: 'location', dagNo: '1', fetchImpl: async () => response('<html>blocked</html>') }),
        (error) => error.code === 'ASSAM_INVALID_RESPONSE' && error.status === 502
    );
});

test('BhuNaksha validator rejects a structurally valid but incomplete response', async () => {
    await assert.rejects(
        getDagInfo({ locationCode: 'location', dagNo: '1', fetchImpl: async () => response({ Patta_number: '46' }) }),
        (error) => error.code === 'ASSAM_INVALID_RESPONSE' && error.status === 502
    );
});

test('BhuNaksha client maps request timeouts', async () => {
    await assert.rejects(
        getDagInfo({
            locationCode: 'location',
            dagNo: '1',
            fetchImpl: async () => {
                const error = new Error('aborted');
                error.name = 'AbortError';
                throw error;
            }
        }),
        (error) => error.code === 'ASSAM_API_TIMEOUT' && error.status === 504
    );
});

test('retry succeeds after one failed request with bounded backoff', async () => {
    let attempts = 0;
    const result = await getDagInfoWithRetry({ locationCode: 'location', dagNo: '1' }, {
        maxRetries: 1,
        retryBaseDelayMs: 50,
        sleep: async () => undefined,
        fetchImpl: async () => {
            attempts += 1;
            return attempts === 1 ? response({ error: 'temporary' }, 503) : response(samplePayload);
        }
    });

    assert.equal(attempts, 2);
    assert.equal(result.payload.Patta_number, '46');
});

test('old source timestamps are classified as stale', () => {
    assert.equal(dataStatusForTimestamp('2020-01-01T00:00:00.000Z', 'FRESH'), 'STALE');
    assert.equal(dataStatusForTimestamp(new Date().toISOString(), 'LOCAL_SNAPSHOT'), 'LOCAL_SNAPSHOT');
});

test('complete API failure is bounded and records no snapshot success', async () => {
    const locationCode = `FAIL-${Date.now()}`;
    let attempts = 0;

    await assert.rejects(
        syncAssamParcel({ locationCode, dagNo: '1' }, {
            maxRetries: 2,
            retryBaseDelayMs: 0,
            fetchImpl: async () => {
                attempts += 1;
                return response({ error: 'offline' }, 503);
            }
        }),
        (error) => error.code === 'ASSAM_API_ERROR'
    );

    assert.equal(attempts, 3);
    const unavailableError = await syncAssamParcel({ locationCode: `${locationCode}-check`, dagNo: '1' }, {
        maxRetries: 0,
        fetchImpl: async () => response({ error: 'offline' }, 503)
    }).catch((error) => error);
    assert.equal(unavailableError.dataStatus, 'UNAVAILABLE');
    const failedLog = await prisma.syncLog.findFirst({
        where: { status: 'FAILED', rawSnapshotRef: { contains: locationCode } },
        orderBy: { startedAt: 'desc' }
    });
    assert.ok(failedLog);
});

test('Assam mapper safely handles missing optional fields and multiple owners', () => {
    const mapped = mapBhuNakshaParcel(
        { dag_area_Bigha: '1', Pattadar_names: [{ Pattadar_name: 'Owner One' }, { Pattadar_name: 'Owner Two' }] },
        { locationCode: 'location', dagNo: '7' },
        { requestedAt: '2026-09-10T00:00:00.000Z' }
    );

    assert.equal(mapped.pattaNo, null);
    assert.equal(mapped.village, 'Location location');
    assert.equal(mapped.owners.length, 2);
    assert.equal(mapped.sourceSystem, 'BHUNAKSHA');
    assert.equal(mapped.dataOrigin, 'OFFICIAL_API');
    assert.equal(mapped.sourceId, 'BHUNAKSHA:location:7');
});

test('Assam mapper converts bigha, katha, and lessa into square metres', () => {
    assert.equal(areaInSquareMetres(samplePayload), 19906.5202);
});

test('Assam sync persists a canonical parcel, owner, and sync log', async (t) => {
    const locationCode = `TEST-${Date.now()}`;
    const sourceId = `BHUNAKSHA:${locationCode}:1`;
    const dataSourceBefore = await prisma.dataSource.findUnique({ where: { name: 'BHUNAKSHA' } });

    t.after(async () => {
        const parcel = await prisma.parcel.findUnique({ where: { sourceSystem_sourceId: { sourceSystem: 'BHUNAKSHA', sourceId } } });
        if (parcel) await prisma.parcel.delete({ where: { id: parcel.id } });
        const dataSource = await prisma.dataSource.findUnique({ where: { name: 'BHUNAKSHA' } });
        if (dataSource && !dataSourceBefore) {
            await prisma.syncLog.deleteMany({ where: { dataSourceId: dataSource.id } });
            await prisma.dataSource.delete({ where: { id: dataSource.id } });
        }
    });

    const result = await syncAssamParcel({ locationCode, dagNo: '1' }, {
        fetchImpl: async () => response(samplePayload)
    });

    assert.equal(result.sourceMetadata.dataOrigin, 'OFFICIAL_API');
    assert.equal(result.dataStatus, 'FRESH');
    assert.equal(result.parcel.sourceSystem, 'BHUNAKSHA');
    assert.equal(result.parcel.dataOrigin, 'OFFICIAL_API');
    assert.equal(result.parcel.dagNo, '1');
    assert.equal(result.parcel.pattaNo, '46');
    assert.equal(result.parcel.owners[0].name, 'Test Pattadar');
    assert.equal(result.parcel.rawSourcePayload.Patta_number, '46');
    assert.equal(result.parcel.rawSourceMetadata.dataOrigin, 'OFFICIAL_API');
    assert.ok(result.parcel.lastSyncedAt);

    const duplicate = await syncAssamParcel({ locationCode, dagNo: '1' }, {
        fetchImpl: async () => response({ ...samplePayload, Pattadar_names: [{ Pattadar_name: 'Updated Pattadar' }] })
    });
    assert.equal(duplicate.parcel.id, result.parcel.id);
    assert.equal(duplicate.parcel.owners.length, 1);
    assert.equal(duplicate.parcel.owners[0].name, 'Updated Pattadar');
    assert.equal(duplicate.dataStatus, 'FRESH');

    const syncLog = await prisma.syncLog.findFirst({
        where: { dataSource: { name: 'BHUNAKSHA' } },
        orderBy: { startedAt: 'desc' }
    });
    assert.equal(syncLog.status, 'COMPLETED');
    assert.equal(syncLog.recordsWritten, 1);
});

test('timeout falls back to the last successful local snapshot', async (t) => {
    const locationCode = `SNAPSHOT-${Date.now()}`;
    const sourceId = `BHUNAKSHA:${locationCode}:1`;

    t.after(async () => {
        const parcel = await prisma.parcel.findUnique({ where: { sourceSystem_sourceId: { sourceSystem: 'BHUNAKSHA', sourceId } } });
        if (parcel) await prisma.parcel.delete({ where: { id: parcel.id } });
    });

    const fresh = await syncAssamParcel({ locationCode, dagNo: '1' }, {
        maxRetries: 0,
        fetchImpl: async () => response(samplePayload)
    });
    const fallback = await syncAssamParcel({ locationCode, dagNo: '1' }, {
        maxRetries: 0,
        fetchImpl: async () => {
            const error = new Error('timed out');
            error.name = 'AbortError';
            throw error;
        }
    });

    assert.equal(fresh.dataStatus, 'FRESH');
    assert.equal(fresh.syncStatus, 'COMPLETED');
    assert.equal(fallback.dataStatus, 'LOCAL_SNAPSHOT');
    assert.equal(fallback.syncStatus, 'FAILED_USING_SNAPSHOT');
    assert.equal(fallback.parcel.id, fresh.parcel.id);
    assert.match(fallback.warning, /last successful snapshot/);
    assert.equal(fallback.error.code, 'ASSAM_API_TIMEOUT');
});
