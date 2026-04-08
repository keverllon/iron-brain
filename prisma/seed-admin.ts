/**
 * Script para criar um usuário admin padrão
 * Execute após `npx prisma db push`
 *
 * Usage: npx ts-node --project tsconfig.seed.json prisma/seed-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/ironbrain",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔧 Criando usuário admin...");

  const adminEmail = "admin@ironbrain.com";
  const adminPassword = "admin123";

  // Verificar se admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✅ Admin já existe:", adminEmail);
    return;
  }

  // Criar admin
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "ADMIN" as any,
      subscriptionStatus: "ACTIVE" as any,
    },
  });

  console.log("✅ Admin criado com sucesso!");
  console.log("   Email:", adminEmail);
  console.log("   Senha:", adminPassword);
  console.log("   ID:", admin.id);
  console.log("\n⚠️  Altere a senha padrão após o primeiro login!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
