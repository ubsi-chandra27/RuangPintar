import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { hashPassword } from "../src/shared/lib/password.ts";
import { generateUlid } from "../src/shared/lib/ulid.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("=== STEP 1: BACKUP DATABASE ===");
  const dbPath = path.resolve("prisma/data/ruang-pintar.db");
  const backupDir = path.resolve("prisma/data/backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `ruang-pintar-before-reset-zero-${timestamp}.db`);
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Backup saved to: ${backupPath}`);

  console.log("\n=== STEP 2: QUERY ALL USER TABLES ===");
  const tables = await prisma.$queryRawUnsafe(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_prisma_%'
  `);
  console.log(`Found ${tables.length} tables to clean.`);

  console.log("\n=== STEP 3: WIPE ALL TABLES (FOREIGN_KEYS = OFF) ===");
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF;");
  for (const t of tables) {
    const tableName = t.name;
    await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}";`);
  }
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
  console.log("All tables truncated successfully.");

  console.log("\n=== STEP 4: SEED PRISTINE SUPER_ADMIN ACCOUNT ===");
  const superadminId = generateUlid();
  const passwordHash = await hashPassword("Password123#");

  await prisma.pengguna.create({
    data: {
      id: superadminId,
      username: "superadmin",
      email: "superadmin@ruangpintar.id",
      nama_lengkap: "Super Administrator",
      peran_dasar: "SUPER_ADMIN",
      password_hash: passwordHash,
      status_akun: "AKTIF",
      harus_ganti_password: false,
      percobaan_login_gagal: 0,
      sekolah_id: null,
      tipe_lisensi: "SEKOLAH",
    },
  });
  console.log("Super Admin account seeded with username 'superadmin' and password 'Password123#'.");

  console.log("\n=== STEP 5: VERIFY COUNTS ===");
  const sekolahCount = await prisma.sekolah.count();
  const guruCount = await prisma.pengguna.count({ where: { peran_dasar: "TEACHER" } });
  const siswaCount = await prisma.siswa.count();
  const rombelCount = await prisma.rombel.count();
  const penggunaCount = await prisma.pengguna.count();
  const superAdminUser = await prisma.pengguna.findFirst({
    where: { username: "superadmin" },
    select: { id: true, username: true, email: true, peran_dasar: true, sekolah_id: true },
  });

  console.log({
    sekolahCount,
    guruCount,
    siswaCount,
    rombelCount,
    penggunaCount,
    superAdminUser,
  });

  if (
    sekolahCount === 0 &&
    guruCount === 0 &&
    siswaCount === 0 &&
    rombelCount === 0 &&
    penggunaCount === 1
  ) {
    console.log("\n SUCCESS: Database is 100% clean with genuine 0 data across all SaaS metrics!");
  } else {
    console.error("\n WARNING: Unexpected counts remaining!");
  }
}

main()
  .catch((err) => {
    console.error("Error during database reset:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
