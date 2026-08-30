import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const outDir = path.resolve("docs/phases/screenshots/phase-08");

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
  console.log("Setting up data for Phase 08 Visual QA...");
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

  console.log("Navigating to login...");
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[name="username"]');
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard", { timeout: 15000 });
  console.log("Logged in successfully. Navigating to /data-siswa...");

  await page.goto(`${baseUrl}/data-siswa`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // 1. Desktop (1440x900) - Tab Daftar Siswa
  console.log("Capturing 01-desktop-student-directory.png...");
  await page.setViewportSize(viewports.desktop);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "01-desktop-student-directory.png"),
    fullPage: true,
  });

  // 2. Desktop - Modal Detail & Timeline Siswa
  console.log("Capturing 02-desktop-student-detail-timeline-modal.png...");
  const detailBtn = page.locator('button[title="Lihat Detail & Riwayat"]').first();
  if (await detailBtn.count()) {
    await detailBtn.click();
    await page.waitForTimeout(800);
    const timelineTab = page.locator('button:has-text("Riwayat Akademik")');
    if (await timelineTab.count()) {
      await timelineTab.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({
      path: path.join(outDir, "02-desktop-student-detail-timeline-modal.png"),
      fullPage: false,
    });
    await page.locator('button:has-text("Tutup")').click();
    await page.waitForTimeout(600);
  }

  // 3. Desktop - Modal Tambah Siswa Baru
  console.log("Capturing 03-desktop-student-create-modal.png...");
  const createBtn = page.locator('button:has-text("Tambah Siswa")');
  if (await createBtn.count()) {
    await createBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(outDir, "03-desktop-student-create-modal.png"),
      fullPage: false,
    });
    await page.locator('button:has-text("Batal")').last().click();
    await page.waitForTimeout(600);
  }

  // 4. Desktop - Tab Keikutsertaan Akademik
  console.log("Capturing 04-desktop-student-enrollments.png...");
  await page.click('button:has-text("Keikutsertaan Akademik")');
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, "04-desktop-student-enrollments.png"),
    fullPage: true,
  });

  // 5. Desktop - Tab Penempatan Rombel
  console.log("Capturing 05-desktop-student-placements.png...");
  await page.click('button:has-text("Penempatan Rombel")');
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, "05-desktop-student-placements.png"),
    fullPage: true,
  });

  // 6. Desktop - Modal Penempatan Massal (Bulk Placement)
  console.log("Capturing 06-desktop-bulk-placement-modal.png...");
  const bulkBtn = page.locator('button:has-text("Penempatan Massal")');
  if (await bulkBtn.count()) {
    await bulkBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(outDir, "06-desktop-bulk-placement-modal.png"),
      fullPage: false,
    });
    await page.locator('button:has-text("Batal")').last().click();
    await page.waitForTimeout(600);
  }

  // 7. Laptop (1024x768) - Tab Daftar Siswa
  console.log("Capturing 07-laptop-student-directory.png...");
  await page.setViewportSize(viewports.laptop);
  await page.click('button:has-text("Daftar Siswa")');
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, "07-laptop-student-directory.png"),
    fullPage: true,
  });

  // 8. Tablet (768x1024) - Tab Daftar Siswa
  console.log("Capturing 08-tablet-student-directory.png...");
  await page.setViewportSize(viewports.tablet);
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, "08-tablet-student-directory.png"),
    fullPage: true,
  });

  // 9. Mobile (390x844) - Tab Daftar Siswa
  console.log("Capturing 09-mobile-student-directory.png...");
  await page.setViewportSize(viewports.mobile);
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, "09-mobile-student-directory.png"),
    fullPage: true,
  });

  // 10. Mobile (390x844) - Tab Penempatan Rombel
  console.log("Capturing 10-mobile-student-placements.png...");
  await page.click('button:has-text("Penempatan Rombel")');
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outDir, "10-mobile-student-placements.png"),
    fullPage: true,
  });

  await browser.close();
  console.log("All 10 Phase 08 QA screenshots captured successfully!");
}

main()
  .catch((e) => {
    console.error("QA Capture error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
