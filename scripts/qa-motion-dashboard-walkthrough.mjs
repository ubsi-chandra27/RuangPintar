import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/motion-atm-walkthrough";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function main() {
  console.log("=== Memulai Visual QA Walkthrough Dashboard ATM & Motion ===");
  const appUrl = "http://localhost:3000";

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });
  const page = await context.newPage();

  try {
    // 1. Login sebagai Super Admin
    console.log("1. Login sebagai Super Admin (superadmin)...");
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "superadmin");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes("/dashboard"), {
      timeout: 15000,
    });
    // Tunggu animasi count-up dan ring gauge selesai berputar (2 detik)
    await page.waitForTimeout(2000);

    // 2. Screenshot Super Admin Dashboard (Light Mode)
    console.log("2. Mengambil screenshot Super Admin Dashboard (Light Mode)...");
    await page.screenshot({
      path: path.join(screenshotDir, "01-superadmin-dashboard-light.png"),
      fullPage: false,
    });

    // 3. Buka Drill-down Slide-over Drawer
    console.log("3. Membuka Slide-Over Drawer Attention Center...");
    const inspectBtn = page.locator('button:has-text("Tinjau Kasus Siswa")').first();
    if (await inspectBtn.isVisible()) {
      await inspectBtn.click();
      await page.waitForTimeout(600); // transisi drawer
      console.log("4. Mengambil screenshot Super Admin Drawer Terbuka...");
      await page.screenshot({
        path: path.join(screenshotDir, "02-superadmin-drawer-open.png"),
        fullPage: false,
      });

      // Tutup drawer
      const closeBtn = page.locator('button[aria-label="Tutup panel detail"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // 4. Beralih ke Dark Mode
    console.log("5. Beralih ke Dark Mode...");
    const themeBtn = page.locator('button[aria-label*="Pilih Mode Tampilan"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(400);
      const darkOption = page.locator('button:has-text("Mode Malam")').first();
      if (await darkOption.isVisible()) {
        await darkOption.click();
        await page.waitForTimeout(1000);

        console.log("6. Mengambil screenshot Super Admin Dashboard (Dark Mode)...");
        await page.screenshot({
          path: path.join(screenshotDir, "03-superadmin-dashboard-dark.png"),
          fullPage: false,
        });
      }
    }

    // 5. Logout & Login sebagai Guru (erichandra)
    console.log("7. Mengambil screenshot Teacher Dashboard...");
    await context.clearCookies();
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "erichandra");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes("/dashboard"), {
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotDir, "04-teacher-dashboard.png"),
      fullPage: false,
    });

    console.log("✅ Visual QA Walkthrough selesai. Semua gambar tersimpan di:", screenshotDir);
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat visual QA:", error);
  } finally {
    await browser.close();
  }
}

main();
