import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const outDir = path.resolve("docs/phases/screenshots/phase-09");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function ensureUsers() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  const school = await prisma.sekolah.findFirst();
  const schoolId = school.id;
  const passwordHash = await bcrypt.hash("Password123", 10);

  // 1. Super Admin
  await prisma.pengguna.upsert({
    where: { username: "superadmin" },
    update: {
      password_hash: passwordHash,
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    },
    create: {
      id: "01JA000000000000000000ADM001",
      sekolah_id: schoolId,
      username: "superadmin",
      password_hash: passwordHash,
      nama_lengkap: "Administrator Utama",
      peran_dasar: "SUPER_ADMIN",
      status_akun: "AKTIF",
    },
  });

  // 2. Teacher User (guru1)
  const teacherUser = await prisma.pengguna.upsert({
    where: { username: "guru1" },
    update: {
      password_hash: passwordHash,
      status_akun: "AKTIF",
      sekolah_id: schoolId,
    },
    create: {
      id: "01JA000000000000000000TCH001",
      sekolah_id: schoolId,
      username: "guru1",
      password_hash: passwordHash,
      nama_lengkap: "Budi Santoso",
      peran_dasar: "TEACHER",
      status_akun: "AKTIF",
    },
  });

  // Link teacher profile to teacherUser
  const teacherProfile = await prisma.guru.findFirst({
    where: { sekolah_id: schoolId, nama_lengkap: "Budi Santoso" },
  });
  if (teacherProfile) {
    await prisma.guru.update({
      where: { id: teacherProfile.id },
      data: { pengguna_id: teacherUser.id },
    });
  }
}

async function main() {
  console.log("Setting up data for Phase 09 Visual QA...");
  await ensureUsers();

  const baseUrl = "http://localhost:3000";
  const browser = await chromium.launch({ headless: true });

  const viewports = {
    desktop: { width: 1440, height: 900 },
    laptop: { width: 1024, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 390, height: 844 },
  };

  const context = await browser.newContext({ viewport: viewports.desktop });
  const page = await context.newPage();

  console.log("1. Logging in as superadmin...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[name="username"]');
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  console.log("✓ Logged in as superadmin.");

  // Navigate to /guru-pengajaran
  console.log("2. Navigating to /guru-pengajaran...");
  await page.goto(`${baseUrl}/guru-pengajaran`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Pendidik & Penugasan Akademik", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Capture Tab 1: Data Guru Desktop
  console.log("3. Capturing Data Guru Desktop...");
  await page.screenshot({
    path: path.join(outDir, "01-guru-tab-desktop.png"),
    fullPage: true,
  });

  // Open Detail Modal
  console.log("4. Capturing Guru Detail Modal...");
  const eyeButtons = await page.$$('button[title*="Detail"]');
  if (eyeButtons.length > 0) {
    await eyeButtons[0].click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outDir, "02-guru-detail-modal.png"),
      fullPage: false,
    });
    // Close detail modal
    const closeBtn = await page.$('button:has-text("Tutup")');
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(400);
  }

  // Open Create Teacher Modal
  console.log("5. Capturing Tambah Guru Modal...");
  const addTeacherBtn = await page.$('button:has-text("Tambah Guru Baru")');
  if (addTeacherBtn) {
    await addTeacherBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outDir, "03-guru-create-modal.png"),
      fullPage: false,
    });
    const cancelBtn = await page.$('button:has-text("Batal")');
    if (cancelBtn) await cancelBtn.click();
    await page.waitForTimeout(400);
  }

  // Switch to Tab 2: Mata Pelajaran
  console.log("6. Capturing Mata Pelajaran Tab...");
  await page.click('button:has-text("Mata Pelajaran")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "04-mapel-tab-desktop.png"),
    fullPage: true,
  });

  // Switch to Tab 3: Penugasan Mengajar
  console.log("7. Capturing Penugasan Mengajar Tab...");
  await page.click('button:has-text("Penugasan Mengajar")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "05-penugasan-tab-desktop.png"),
    fullPage: true,
  });

  // Switch to Tab 4: Wali Kelas
  console.log("8. Capturing Wali Kelas Tab...");
  await page.click('button:has-text("Wali Kelas")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "06-wali-kelas-tab-desktop.png"),
    fullPage: true,
  });

  // Mobile viewport for Data Guru
  console.log("9. Capturing Data Guru Mobile...");
  await page.setViewportSize(viewports.mobile);
  await page.click('button:has-text("Data Guru")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "07-guru-tab-mobile.png"),
    fullPage: true,
  });

  // Logout and login as Teacher (guru1) to capture Teacher Dashboard with Real Data
  console.log("10. Logging in as Teacher (guru1) to test Teacher Dashboard Real Data...");
  await context.clearCookies();
  await page.setViewportSize(viewports.desktop);
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[name="username"]');
  await page.fill('input[name="username"]', "guru1");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1000);

  console.log("11. Capturing Teacher Dashboard Real Data...");
  await page.screenshot({
    path: path.join(outDir, "08-teacher-dashboard-real-data.png"),
    fullPage: true,
  });

  console.log("✓ All Phase 09 Visual QA screenshots captured successfully!");
  await browser.close();
}

main()
  .catch((e) => {
    console.error("QA Capture Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
