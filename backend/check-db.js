import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const projects = await prisma.project.count();
  const parcels = await prisma.parcel.count();
  const roles = await prisma.role.count();
  console.log(`Users: ${users}\nProjects: ${projects}\nParcels: ${parcels}\nRoles: ${roles}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
