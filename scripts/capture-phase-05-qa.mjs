import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const outDir = path.resolve("docs/phases/screenshots/phase-05");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function seedPhase05Users() {
  const schoolId = "01JA0000000000000000000001";
  await prisma.sekolah.upsert({
    where: { id: schoolId },
    update: {},
    create: {
      id: schoolId,
      nama: "SMK Negeri 1 Ruang Pintar",
      jenjang: "SMK",
    },
  });

  const passwordHash = await bcrypt.hash("Password123", 10);

  // 1. Teacher
  await prisma.pengguna.upsert({
    where: { username: "guru_ahmad" },
    update: { password_hash: passwordHash, status_akun: "AKTIF", harus_ganti_password: false },
    create: {
      id: "01JA000000000000000000TEACH1",
      sekolah_id: schoolId,
      username: "guru_ahmad",
      password_hash: passwordHash,
      nama_lengkap: "Ahmad Dahlan, S.Pd.",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });

  // 2. Student
  await prisma.pengguna.upsert({
    where: { username: "siswa_budi" },
    update: { password_hash: passwordHash, status_akun: "AKTIF", harus_ganti_password: false },
    create: {
      id: "01JA000000000000000000STUD01",
      sekolah_id: schoolId,
      username: "siswa_budi",
      password_hash: passwordHash,
      nama_lengkap: "Budi Santoso",
      peran_dasar: "STUDENT",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });

  // 3. Guardian
  await prisma.pengguna.upsert({
    where: { username: "wali_santoso" },
    update: { password_hash: passwordHash, status_akun: "AKTIF", harus_ganti_password: false },
    create: {
      id: "01JA000000000000000000GUAR01",
      sekolah_id: schoolId,
      username: "wali_santoso",
      password_hash: passwordHash,
      nama_lengkap: "Santoso Wijaya",
      peran_dasar: "GUARDIAN",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });

  // 4. Staff
  const staffId = "01JA000000000000000000STAF01";
  await prisma.pengguna.upsert({
    where: { username: "staf_operator" },
    update: { password_hash: passwordHash, status_akun: "AKTIF", harus_ganti_password: false },
    create: {
      id: staffId,
      sekolah_id: schoolId,
      username: "staf_operator",
      password_hash: passwordHash,
      nama_lengkap: "Siti Rahma, S.Kom.",
      peran_dasar: "SCHOOL_STAFF",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });

  // Assign capability bundles to staff
  await prisma.kemampuanStaff.upsert({
    where: {
      pengguna_id_kode_kemampuan: { pengguna_id: staffId, kode_kemampuan: "ACADEMIC_OPERATOR" },
    },
    update: {},
    create: {
      id: "01JA000000000000000000CAP001",
      pengguna_id: staffId,
      kode_kemampuan: "ACADEMIC_OPERATOR",
    },
  });
  await prisma.kemampuanStaff.upsert({
    where: {
      pengguna_id_kode_kemampuan: { pengguna_id: staffId, kode_kemampuan: "STUDENT_DATA_OPERATOR" },
    },
    update: {},
    create: {
      id: "01JA000000000000000000CAP002",
      pengguna_id: staffId,
      kode_kemampuan: "STUDENT_DATA_OPERATOR",
    },
  });

  // 5. Super Admin
  await prisma.pengguna.upsert({
    where: { username: "admin_utama" },
    update: { password_hash: passwordHash, status_akun: "AKTIF", harus_ganti_password: false },
    create: {
      id: "01JA000000000000000000ADMN01",
      sekolah_id: schoolId,
      username: "admin_utama",
      password_hash: passwordHash,
      nama_lengkap: "Administrator Utama",
      peran_dasar: "SUPER_ADMIN",
      status_akun: "AKTIF",
      harus_ganti_password: false,
    },
  });
}

async function loginAs(page, username) {
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 8000 });
}

async function runPhase05Qa() {
  console.log("Seeding test accounts for Phase 05 QA...");
  await seedPhase05Users();

  console.log("Launching Chromium browser...");
  const browser = await chromium.launch();

  // 1. Teacher Dashboard across 4 Viewports
  const viewports = [
    { width: 1440, height: 900, name: "phase-05-teacher-1440x900.png" },
    { width: 1024, height: 768, name: "phase-05-teacher-1024x768.png" },
    { width: 768, height: 1024, name: "phase-05-teacher-768x1024.png" },
    { width: 390, height: 844, name: "phase-05-teacher-390x844.png" },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await loginAs(page, "guru_ahmad");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, vp.name), fullPage: false });
    console.log(`Saved screenshot: ${vp.name}`);
    await context.close();
  }

  // 2. Desktop Compact Rail Mode
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await loginAs(page, "guru_ahmad");
    await page.click('button[aria-label*="Ciutkan"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, "phase-05-compact-rail-1440x900.png") });
    console.log("Saved screenshot: phase-05-compact-rail-1440x900.png");
    await context.close();
  }

  // 3. Mobile Navigation Drawer Open
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await loginAs(page, "guru_ahmad");
    await page.click('button[aria-label="Buka Menu Navigasi"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, "phase-05-mobile-drawer-390x844.png") });
    console.log("Saved screenshot: phase-05-mobile-drawer-390x844.png");
    await context.close();
  }

  // 4. Staff Dashboard
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await loginAs(page, "staf_operator");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "phase-05-staff-dashboard-1440x900.png") });
    console.log("Saved screenshot: phase-05-staff-dashboard-1440x900.png");
    await context.close();
  }

  // 5. Student Dashboard
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await loginAs(page, "siswa_budi");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "phase-05-student-dashboard-1440x900.png") });
    console.log("Saved screenshot: phase-05-student-dashboard-1440x900.png");
    await context.close();
  }

  // 6. Guardian Dashboard
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await loginAs(page, "wali_santoso");
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, "phase-05-guardian-dashboard-1440x900.png") });
    console.log("Saved screenshot: phase-05-guardian-dashboard-1440x900.png");
    await context.close();
  }

  // 7. Super Admin Dashboard
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await loginAs(page, "admin_utama");
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(outDir, "phase-05-superadmin-dashboard-1440x900.png"),
    });
    console.log("Saved screenshot: phase-05-superadmin-dashboard-1440x900.png");
    await context.close();
  }

  await browser.close();
  await prisma.$disconnect();
  console.log("Phase 05 Browser QA completed successfully!");
}

runPhase05Qa().catch((err) => {
  console.error("Phase 05 QA script failed:", err);
  process.exit(1);
});
