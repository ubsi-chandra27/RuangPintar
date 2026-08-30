import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const outDir = path.resolve("docs/phases/screenshots/phase-07");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function ensureUsers() {
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  const school = await prisma.sekolah.findFirst();
  const schoolId = school.id;
  const passwordHash = await bcrypt.hash("Password123", 10);

  // Super Admin
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
}

async function main() {
  console.log("Setting up data for Phase 07 Visual QA...");
  await ensureUsers();

  const baseUrl = "http://localhost:3000";
  const browser = await chromium.launch({ headless: true });

  const viewports = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 390, height: 844 },
  };

  const context = await browser.newContext({
    viewport: viewports.desktop,
  });
  const page = await context.newPage();

  console.log("Navigating to login...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[name="username"]');
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard", { timeout: 15000 });
  console.log("Logged in successfully. Navigating to /struktur-akademik...");

  await page.goto(`${baseUrl}/struktur-akademik`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // 1. Desktop - Tab Tahun Ajaran
  console.log("Capturing 01-desktop-academic-years.png...");
  await page.screenshot({
    path: path.join(outDir, "01-desktop-academic-years.png"),
    fullPage: true,
  });

  // 2. Desktop - Tab Tingkat & Fase (Subtab Tingkat)
  console.log("Capturing 02-desktop-grade-levels.png...");
  await page.click('button:has-text("Tingkat & Fase")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "02-desktop-grade-levels.png"),
    fullPage: true,
  });

  // 3. Desktop - Tab Tingkat & Fase (Subtab Fase)
  console.log("Capturing 03-desktop-phases.png...");
  await page.click('button:has-text("Fase Kurikulum")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "03-desktop-phases.png"),
    fullPage: true,
  });

  // 4. Desktop - Tab Program Keahlian
  console.log("Capturing 04-desktop-programs.png...");
  await page.click('button:has-text("Program / Jurusan")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "04-desktop-programs.png"),
    fullPage: true,
  });

  // 5. Desktop - Tab Rombongan Belajar
  console.log("Capturing 05-desktop-rombels.png...");
  await page.click('button:has-text("Rombongan Belajar")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "05-desktop-rombels.png"),
    fullPage: true,
  });

  // 6. Modal Tambah Rombel
  console.log("Capturing 06-modal-create-rombel.png...");
  await page.click('button:has-text("Bentuk Rombel")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "06-modal-create-rombel.png"),
  });
  await page.click('button[aria-label="Tutup modal"]');
  await page.waitForTimeout(300);

  // 7. Modal Tambah Tahun Ajaran
  console.log("Capturing 07-modal-create-year.png...");
  await page.click('button:has-text("Tahun Ajaran & Semester")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Tambah Tahun Ajaran")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "07-modal-create-year.png"),
  });
  await page.click('button[aria-label="Tutup modal"]');
  await page.waitForTimeout(300);

  // 8. Tablet View (768x1024)
  console.log("Capturing 08-tablet-academic-view.png...");
  await page.setViewportSize(viewports.tablet);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "08-tablet-academic-view.png"),
    fullPage: true,
  });

  // 9. Mobile View (390x844) - Symmetrical Grid Tabs & Years
  console.log("Capturing 09-mobile-years-cards.png...");
  await page.setViewportSize(viewports.mobile);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "09-mobile-years-cards.png"),
    fullPage: true,
  });

  // 10. Mobile View (390x844) - Rombels Cards
  console.log("Capturing 10-mobile-rombels-cards.png...");
  await page.click('button:has-text("Rombongan Belajar")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "10-mobile-rombels-cards.png"),
    fullPage: true,
  });

  console.log("All 10 Visual QA screenshots captured successfully!");
  await browser.close();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("QA Capture failed:", err);
  process.exit(1);
});
