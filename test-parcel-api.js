import { prisma } from './backend/src/config/database.js';
import * as parcelService from './backend/src/services/parcel.service.js';

async function run() {
  const all = await parcelService.listParcels({ dagNo: '123', page: 1, pageSize: 10 });
  console.log('DAG Lookup:', all.meta);

  const village = await parcelService.listParcels({ village: 'demo', page: 1, pageSize: 10 });
  console.log('Village Lookup:', village.meta);

  try {
    await parcelService.getParcel('00000000-0000-0000-0000-000000000000');
  } catch (e) {
    console.log('Invalid ID:', e.message);
  }
}
run().finally(() => prisma.$disconnect());
