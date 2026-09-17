import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import JSONStream from 'JSONStream';
import csvParser from 'csv-parser';
import stripBomStream from 'strip-bom-stream';

const prisma = new PrismaClient();

const DATA_DIR = process.env.ASSAM_DATA_DIR || '/home/sujay-barman/Desktop/Hackathon/SIH 2026/Land-Acquisition-Management-System/Assam_Data';
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('--validate-only');
const isResume = args.includes('--resume');

let targetFile = null;
const fileArg = args.find(a => a.startsWith('--file='));
if (fileArg) targetFile = fileArg.split('=')[1];

const SOURCE_SYSTEM = 'ASSAM_LAND_DATASET';

let batchSizeArg = args.find(a => a.startsWith('--batch-size='));
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg.split('=')[1], 10) : parseInt(process.env.ASSAM_IMPORT_BATCH_SIZE || '500', 10);

const maxRecords = args.includes('--test-run') ? 1500 : Infinity; // For testing

async function createSyncLog(fileName) {
  if (isDryRun) return null;
  let ds = await prisma.dataSource.findUnique({ where: { name: SOURCE_SYSTEM } });
  if (!ds) {
    ds = await prisma.dataSource.create({ data: { name: SOURCE_SYSTEM, description: 'Assam State Land Dataset' } });
  }
  return await prisma.syncLog.create({
    data: {
      dataSourceId: ds.id,
      startedAt: new Date(),
      status: 'RUNNING',
      rawSnapshotRef: fileName
    }
  });
}

async function getResumeSkipCount(fileName) {
  if (!isResume || isDryRun) return 0;
  const lastLog = await prisma.syncLog.findFirst({
    where: { rawSnapshotRef: fileName },
    orderBy: { startedAt: 'desc' }
  });
  if (lastLog && (lastLog.status === 'RUNNING' || lastLog.status === 'FAILED')) {
    return lastLog.recordsRead || 0;
  }
  return 0;
}

async function updateSyncLog(logId, stats, status = 'COMPLETED') {
  if (isDryRun || !logId) return;
  await prisma.syncLog.update({
    where: { id: logId },
    data: {
      completedAt: new Date(),
      status,
      recordsRead: stats.total,
      recordsInserted: stats.inserted,
      recordsUpdated: stats.updated,
      recordsFailed: stats.failed,
      recordsRejected: stats.invalid
    }
  });
}

function getSafeNumeric(val) {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

function mapCsvToParcel(row) {
  if (!row.district_code || !row.village_code || !row.dag_no) return null;
  const sourceId = `CSV-${row.district_code}-${row.village_code}-${row.dag_no}`;
  
  const areaBigha = getSafeNumeric(row.dag_area_bigha);
  const areaKatha = getSafeNumeric(row.dag_area_katha);
  const areaLessa = getSafeNumeric(row.dag_area_lessa);
  const approxAreaHectares = (areaBigha * 0.1338) + (areaKatha * 0.0268) + (areaLessa * 0.0013);

  return {
    sourceSystem: SOURCE_SYSTEM,
    sourceId: sourceId,
    circle: row.circle_name,
    village: row.village_name,
    dagNo: row.dag_no,
    pattaNo: row.patta_number,
    ulpin: null,
    area: approxAreaHectares,
    dataOrigin: 'IMPORT',
    rawSourceMetadata: {
      patta_type: row.patta_type,
      land_class: row.land_class
    },
    _rawDistCode: row.district_code,
    _rawDistName: row.district_name
  };
}

function mapJsonToParcel(record) {
  if (!record.id) return null;
  return {
    sourceSystem: SOURCE_SYSTEM,
    sourceId: record.id,
    circle: record.attributes?.CIRCLE || 'Unknown Circle',
    village: record.attributes?.VILLAGE || 'Unknown Village',
    dagNo: record.attributes?.TEXTPARCEL || null,
    pattaNo: null,
    ulpin: record.uniqueId || null,
    area: getSafeNumeric(record.area),
    dataOrigin: 'IMPORT',
    rawSourceMetadata: record.attributes,
    _geom: record.geom,
    _rawDistName: record.attributes?.DISTRICT
  };
}

const cache = { state: null, districts: {} };
async function resolveLocation(distName) {
  if (isDryRun) return { stateId: 'dry-run-state', districtId: 'dry-run-dist' };
  
  if (!cache.state) {
    let state = await prisma.state.findUnique({ where: { code: 'AS' } });
    if (!state) state = await prisma.state.create({ data: { code: 'AS', name: 'Assam' } });
    cache.state = state.id;
  }
  
  const dName = (distName || 'UNKNOWN').toUpperCase().trim();
  if (!cache.districts[dName]) {
    let dist = await prisma.district.findFirst({ where: { name: { equals: dName, mode: 'insensitive' }, stateId: cache.state } });
    if (!dist) {
       dist = await prisma.district.create({
         data: { code: `AS-${dName.substring(0,3)}`, name: dName, stateId: cache.state }
       });
    }
    cache.districts[dName] = dist.id;
  }
  
  return { stateId: cache.state, districtId: cache.districts[dName] };
}

async function processBatch(batch, stats) {
  if (batch.length === 0) return;
  if (isDryRun) {
    stats.inserted += batch.length;
    process.stdout.write(`\r[Dry Run] Processed ${stats.total} records...`);
    return;
  }

  try {
    for (const record of batch) {
      const loc = await resolveLocation(record._rawDistName);
      record.stateId = loc.stateId;
      record.districtId = loc.districtId;
    }

    const sourceIds = batch.map(b => b.sourceId);
    const existing = await prisma.parcel.findMany({
      where: { sourceSystem: SOURCE_SYSTEM, sourceId: { in: sourceIds } },
      select: { id: true, sourceId: true }
    });
    
    const existingIds = new Set(existing.map(e => e.sourceId));

    for (const record of batch) {
      const { _geom, _rawDistCode, _rawDistName, ...parcelData } = record;
      const exists = existingIds.has(record.sourceId);
      
      if (!exists) {
        if (_geom) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO "Parcel" ("id", "stateId", "districtId", "circle", "village", "dagNo", "ulpin", "area", "dataOrigin", "sourceSystem", "sourceId", "geometry", "updatedAt")
            VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ST_GeomFromText($11, 32646), NOW())
          `, parcelData.stateId, parcelData.districtId, parcelData.circle, parcelData.village, parcelData.dagNo, parcelData.ulpin, parcelData.area, parcelData.dataOrigin, parcelData.sourceSystem, parcelData.sourceId, _geom);
        } else {
          await prisma.parcel.create({ data: parcelData });
        }
        stats.inserted++;
      } else {
        if (_geom) {
           await prisma.$executeRawUnsafe(`
             UPDATE "Parcel"
             SET "area" = $1, "geometry" = ST_GeomFromText($2, 32646), "updatedAt" = NOW()
             WHERE "sourceSystem" = $3 AND "sourceId" = $4
           `, parcelData.area, _geom, parcelData.sourceSystem, parcelData.sourceId);
        } else {
           const dbRecord = existing.find(e => e.sourceId === record.sourceId);
           await prisma.parcel.update({ where: { id: dbRecord.id }, data: parcelData });
        }
        stats.updated++;
      }
    }
  } catch (error) {
    stats.failed += batch.length;
  }
}

async function processCSV(filePath) {
  const log = await createSyncLog(path.basename(filePath));
  const stats = { total: 0, inserted: 0, updated: 0, failed: 0, invalid: 0 };
  let batch = [];
  
  const skipCount = await getResumeSkipCount(path.basename(filePath));
  if (skipCount > 0) console.log(`[Resume] Fast-forwarding ${skipCount} records...`);

  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = async () => {
      if (finished) return;
      finished = true;
      if (batch.length > 0) await processBatch(batch, stats);
      await updateSyncLog(log?.id, stats, 'COMPLETED');
      console.log(`\n[CSV REPORT] ${path.basename(filePath)} | Total: ${stats.total} | Insert: ${stats.inserted} | Update: ${stats.updated}`);
      resolve();
    };

    const stream = fs.createReadStream(filePath).pipe(stripBomStream()).pipe(csvParser());
    stream.on('data', async (row) => {
      stats.total++;
      if (stats.total <= skipCount) return; // Fast-forward skip
      if (stats.total > maxRecords) return stream.destroy(); // test limit
      
      const mapped = mapCsvToParcel(row);
      if (mapped) {
        batch.push(mapped);
        if (batch.length >= BATCH_SIZE) {
          stream.pause();
          const current = [...batch]; batch = [];
          await processBatch(current, stats);
          stream.resume();
        }
      } else {
        stats.invalid++;
      }
    }).on('close', finish).on('end', finish).on('error', reject);
  });
}

async function processJSON(filePath) {
  const log = await createSyncLog(path.basename(filePath));
  const stats = { total: 0, inserted: 0, updated: 0, failed: 0, invalid: 0 };
  let batch = [];
  
  const skipCount = await getResumeSkipCount(path.basename(filePath));
  if (skipCount > 0) console.log(`[Resume] Fast-forwarding ${skipCount} records...`);

  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = async () => {
      if (finished) return;
      finished = true;
      if (batch.length > 0) await processBatch(batch, stats);
      await updateSyncLog(log?.id, stats, 'COMPLETED');
      console.log(`\n[JSON REPORT] ${path.basename(filePath)} | Total: ${stats.total} | Insert: ${stats.inserted} | Update: ${stats.updated}`);
      resolve();
    };

    const stream = fs.createReadStream(filePath);
    const parser = JSONStream.parse('districts.*.villages.*.parcels.*');
    
    stream.pipe(parser)
      .on('data', async (record) => {
        stats.total++;
        if (stats.total <= skipCount) return; // Fast-forward skip
        if (stats.total > maxRecords) return stream.destroy(); // test limit
        
        const mapped = mapJsonToParcel(record);
        if (mapped) {
          batch.push(mapped);
          if (batch.length >= BATCH_SIZE) {
            stream.pause();
            const current = [...batch]; batch = [];
            await processBatch(current, stats);
            stream.resume();
          }
        } else {
          stats.invalid++;
        }
      }).on('close', finish).on('end', finish).on('error', reject);
  });
}

async function run() {
  if (isDryRun) console.log("--- DRY RUN MODE ---");
  
  if (targetFile) {
    const fullPath = path.resolve(DATA_DIR, targetFile);
    if (!fs.existsSync(fullPath)) throw new Error(`File not found: ${fullPath}`);
    if (fullPath.endsWith('.csv')) await processCSV(fullPath);
    else if (fullPath.endsWith('.json')) await processJSON(fullPath);
  } else {
    // Process one CSV and the JSON for a quick dry/test run
    const dagsDir = path.join(DATA_DIR, 'All Dags Info');
    if (fs.existsSync(dagsDir)) {
      const files = fs.readdirSync(dagsDir).filter(f => f.endsWith('.csv'));
      if (files.length > 0) await processCSV(path.join(dagsDir, files[0]));
    }
    const jsonPath = path.join(DATA_DIR, 'All percel info', 'assam_all_parcels-001 (1).json');
    if (fs.existsSync(jsonPath)) await processJSON(jsonPath);
  }
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
