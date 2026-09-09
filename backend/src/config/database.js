import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function checkDatabaseHealth() {
  await prisma.$queryRaw`SELECT 1`;
  const postgisResult = await prisma.$queryRaw`
    SELECT PostGIS_Full_Version() AS version
  `;

  return {
    database: 'connected',
    postgis: postgisResult[0]?.version ? 'available' : 'unavailable'
  };
}
