import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const firmas = await prisma.maintenanceSignature.findMany();
    console.log(firmas);
  } finally {
    await prisma.$disconnect();
  }
}

main();
