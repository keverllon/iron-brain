import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  dbReady: boolean | undefined;
};

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2000,
  });
}

const pool: Pool = globalForPrisma.pool ?? createPool();
globalForPrisma.pool = pool;

export function isDatabaseAvailable(): boolean {
  return globalForPrisma.dbReady ?? false;
}

if (globalForPrisma.dbReady === undefined) {
  globalForPrisma.dbReady = false;
  pool.connect()
    .then((client) => {
      globalForPrisma.dbReady = true;
      client.release();
    })
    .catch(() => {
      globalForPrisma.dbReady = false;
    });
}

const adapter = globalForPrisma.prisma
  ? undefined
  : new PrismaPg(pool);

const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export { prisma, pool };
