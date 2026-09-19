import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/teacher-cockpit-mockup";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function main() {
  console.log("=== Mengambil Screenshot Teacher Cockpit, Profile, & Classes ===");
  const appUrl = "http://localhost:3000";

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });
  const page = await context.newPage();

  try {
    // 1. Login sebagai Guru
    console.log("1. Login sebagai Guru (erichandra)...");
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "erichandra");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    // Tunggu navigasi SPA ke /dashboard
    await page.waitForFunction(() => window.location.pathname.includes("/dashboard"), {
      timeout: 15000,
    });
    await page.waitForTimeout(2500);

    // 2. Screenshot Mode Terang (Light Mode)
    console.log("2. Mengambil screenshot Teacher Dashboard (Light Mode)...");
    await page.screenshot({
      path: path.join(screenshotDir, "01-teacher-cockpit-light-mode.png"),
      fullPage: false,
    });

    // 3. Switch ke Dark Mode via Theme Switcher
    console.log("3. Beralih ke Dark Mode...");
    const themeBtn = page.locator('button[aria-label*="Pilih Mode Tampilan"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(400);
      const darkOption = page.locator('button:has-text("Mode Malam")').first();
      if (await darkOption.isVisible()) {
        await darkOption.click();
        await page.waitForTimeout(1500);

        console.log("4. Mengambil screenshot Teacher Dashboard (Dark Mode)...");
        await page.screenshot({
          path: path.join(screenshotDir, "02-teacher-cockpit-dark-mode.png"),
          fullPage: false,
        });
      }
    }

    // 4. Mobile Viewport Screenshot
    console.log("5. Mengambil screenshot Mobile Viewport (iPhone 14)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(screenshotDir, "03-teacher-cockpit-mobile-dark.png"),
      fullPage: false,
    });

    // Reset ke desktop viewport
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.waitForTimeout(600);

    // 5. Buka Halaman Profil Guru (/profil)
    console.log("6. Mengambil screenshot Halaman Profil Guru (/profil)...");
    await page.goto(`${appUrl}/profil`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(screenshotDir, "04-teacher-profile-dark-mode.png"),
      fullPage: false,
    });

    // 6. Buka Halaman Kelas Saya (/kelas-saya)
    console.log("7. Mengambil screenshot Halaman Kelas Saya (/kelas-saya)...");
    await page.goto(`${appUrl}/kelas-saya`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(screenshotDir, "05-teacher-classes-dark-mode.png"),
      fullPage: false,
    });

    // 7. Buka Modal Tambah Kelas Manual di /kelas-saya
    console.log("8. Membuka Modal Tambah Kelas Manual...");
    const tambahKelasBtn = page.locator('button:has-text("+ Tambah Kelas Manual")').first();
    if (await tambahKelasBtn.isVisible()) {
      await tambahKelasBtn.click();
      await page.waitForTimeout(1000);
      console.log("9. Mengambil screenshot Modal Tambah Kelas Manual...");
      await page.screenshot({
        path: path.join(screenshotDir, "06-manual-create-class-modal.png"),
        fullPage: false,
      });
    }

    console.log("=== Seluruh screenshot berhasil disimpan di " + screenshotDir + " ===");
  } catch (err) {
    console.error("Gagal mengambil screenshot:", err);
  } finally {
    await browser.close();
  }
}

main();
