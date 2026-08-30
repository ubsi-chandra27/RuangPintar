import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.resolve("docs/phases/screenshots/dashboard-modern");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // 1. Login as Super Admin
  console.log("Navigating to login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123");
  await page.waitForTimeout(300);
  await Promise.all([
    page.waitForURL("**/dashboard", { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);

  // 2. Capture Desktop 1440x900 (Expanded)
  console.log("Capturing Desktop 1440x900 (Expanded)...");
  await page.screenshot({
    path: path.join(outDir, "01_superadmin_desktop_1440x900.png"),
    fullPage: false,
  });

  // 2b. Capture Desktop 1440x900 (Collapsed Rail)
  console.log("Capturing Desktop 1440x900 (Collapsed Rail)...");
  await page.click('button[aria-label="Ciutkan Sidebar"]');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "04_superadmin_desktop_collapsed_rail.png"),
    fullPage: false,
  });
  // Expand back
  await page.click('button[aria-label="Perluas Sidebar"]');
  await page.waitForTimeout(600);

  // 3. Capture Tablet 1024x768
  console.log("Capturing Tablet 1024x768...");
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "02_superadmin_tablet_1024x768.png"),
    fullPage: false,
  });

  // 4. Capture Mobile 390x844
  console.log("Capturing Mobile 390x844...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "03_superadmin_mobile_390x844.png"),
    fullPage: false,
  });

  // 5. Capture Logout Modal on Desktop
  console.log("Capturing Logout Modal Dialog...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Menu Pengguna"]');
  await page.waitForTimeout(300);
  await page.click('text="Keluar dari Akun"');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, "05_logout_confirmation_modal.png"),
    fullPage: false,
  });

  // Cancel logout modal
  await page.click('button:has-text("Batal")');
  await page.waitForTimeout(400);

  // 6. Capture /sekolah Page with 3D Pop-Out Hero Card
  console.log("Capturing /sekolah Hero Card Desktop...");
  await page.goto("http://localhost:3000/sekolah", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(outDir, "06_sekolah_hero_card_desktop.png"),
    fullPage: false,
  });

  // 7. Capture /sekolah Mobile
  console.log("Capturing /sekolah Mobile 390x844...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "08_sekolah_mobile_390x844.png"),
    fullPage: false,
  });

  // 8. Capture Floating Toast on Profile Update (Desktop)
  console.log("Capturing Floating Toast on Profile Update...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.click('button:has-text("Simpan Perubahan")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "09_school_profile_toast_success.png"),
    fullPage: false,
  });

  // 9. Capture Unit Organisasi with Table Toolbar & Pagination (Desktop)
  console.log("Capturing Unit Organisasi Table Toolbar & Pagination...");
  await page.click('button:has-text("Unit Organisasi")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "10_sekolah_unit_organisasi_desktop.png"),
    fullPage: false,
  });

  // 10. Capture Unit Organisasi Mobile (390x844)
  console.log("Capturing Unit Organisasi Mobile 390x844...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = 550;
    window.scrollTo(0, 550);
  });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "11_unit_organisasi_mobile.png"),
    fullPage: false,
  });

  // 11. Capture Master Jabatan (Desktop 1440x900)
  console.log("Capturing Master Jabatan Desktop...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.click('button:has-text("Master Jabatan")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "12_sekolah_master_jabatan_desktop.png"),
    fullPage: false,
  });

  // 12. Capture Master Jabatan Mobile (390x844)
  console.log("Capturing Master Jabatan Mobile 390x844...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = 550;
    window.scrollTo(0, 550);
  });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "13_sekolah_master_jabatan_mobile.png"),
    fullPage: false,
  });

  // 13. Capture Penugasan Personil (Desktop 1440x900)
  console.log("Capturing Penugasan Personil Desktop...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.click('button:has-text("Penugasan Personil")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "14_sekolah_penugasan_personil_desktop.png"),
    fullPage: false,
  });

  // 14. Capture Penugasan Personil Mobile (390x844)
  console.log("Capturing Penugasan Personil Mobile 390x844...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = 550;
    window.scrollTo(0, 550);
  });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "15_sekolah_penugasan_personil_mobile.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
