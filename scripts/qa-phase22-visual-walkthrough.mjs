import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import path from "path";
import { spawn } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-22-walkthrough";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

function checkServerReady(url, timeoutMs = 30000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve(true);
        } else {
          setTimeout(check, 500);
        }
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error("Timeout waiting for server to start at " + url));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function main() {
  console.log("=== MEMULAI VISUAL QA WALKTHROUGH PHASE 22 ===");

  const appUrl = "http://localhost:3000";
  let devServer = null;

  try {
    await checkServerReady(appUrl, 3000);
    console.log("Dev server sudah aktif di http://localhost:3000");
  } catch {
    console.log("Menjalankan dev server port 3000...");
    devServer = spawn("npm.cmd", ["run", "dev"], {
      cwd: "C:/laragon/www/Ruang-Pintar",
      stdio: "pipe",
      shell: true,
    });
    await checkServerReady(appUrl, 35000);
    console.log("Dev server siap.");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    // 1. Landing Page: Hero & Top Section
    console.log("1. Mengambil screenshot Landing Page (Hero)...");
    await page.goto(`${appUrl}/`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(screenshotDir, "01-landing-page-hero.png"),
      fullPage: false,
    });

    // 2. Landing Page: Features & Testimonials
    console.log("2. Mengambil screenshot Fitur & Testimoni Guru...");
    const testimoniEl = page.locator("#testimoni");
    await testimoniEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotDir, "02-landing-page-features-and-testimonials.png"),
      fullPage: false,
    });

    // 3. Landing Page: Pricing & FAQ
    console.log("3. Mengambil screenshot Coba Gratis 30 Hari & FAQ...");
    const biayaEl = page.locator("#biaya");
    await biayaEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotDir, "03-landing-page-pricing-and-faq.png"),
      fullPage: false,
    });

    // 4. Login sebagai Super Admin untuk melihat Widget Device Tracking
    console.log("4. Login sebagai Super Admin...");
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "superadmin");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1000);

    console.log("5. Mengambil screenshot Dashboard Super Admin (Widget Device Tracking)...");
    await page.screenshot({
      path: path.join(screenshotDir, "04-superadmin-dashboard-device-distribution.png"),
      fullPage: false,
    });

    // 5. Buka Menu /guru-pengajaran untuk melihat Indikator Device & Presence Guru
    console.log("6. Membuka /guru-pengajaran...");
    await page.goto(`${appUrl}/guru-pengajaran`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, "05-guru-pengajaran-device-and-presence.png"),
      fullPage: false,
    });

    // 6. Login sebagai Guru Uji Coba untuk membuka Modal Usulan Proposal ke Kepsek
    console.log("7. Buka dashboard guru (Pak Eri Chandra)...");
    await context.clearCookies();
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "erichandra");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Buka Modal Proposal
    const proposalBtn = page.locator('button:has-text("Cetak Usulan ke Kepsek")').first();
    if (await proposalBtn.isVisible()) {
      await proposalBtn.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(500);
      console.log("8. Mengambil screenshot Modal Usulan Proposal Sekolah...");
      await page.screenshot({
        path: path.join(screenshotDir, "06-school-proposal-modal.png"),
        fullPage: false,
      });
    }

    console.log("=== SELURUH SCREENSHOT PHASE 22 BERHASIL DISIMPAN! ===");
  } finally {
    await browser.close();
    await prisma.$disconnect();
    if (devServer) {
      devServer.kill();
    }
  }
}

main().catch((err) => {
  console.error("Error visual walkthrough:", err);
  process.exit(1);
});
