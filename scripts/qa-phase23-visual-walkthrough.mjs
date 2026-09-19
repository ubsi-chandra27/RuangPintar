import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import path from "path";
import { spawn } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-23-walkthrough";

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
  console.log("=== MEMULAI VISUAL QA WALKTHROUGH PHASE 23 ===");

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
    // 1. Landing Page: Guru Pro Pricing Card
    console.log("1. Mengambil screenshot Landing Page (Paket Guru Pro)...");
    await page.goto(`${appUrl}/#biaya`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotDir, "01-landing-page-guru-pro-cta.png"),
      fullPage: false,
    });

    // 2. Login sebagai Guru untuk pengujian Checkout QRIS
    console.log("2. Login sebagai Guru (erichandra)...");
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "erichandra");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 3. Buka Modal Checkout QRIS via tombol di Trial Banner
    console.log("3. Membuka modal pembayaran QRIS Guru Pro...");
    const upgradeBtn = page.locator('button:has-text("Upgrade Guru Pro")').first();
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();
      await page.waitForSelector('h3:has-text("Pembayaran Paket Guru Pro")', { timeout: 5000 });
      await page.waitForTimeout(800);

      console.log("4. Mengambil screenshot Barcode QRIS & Rincian Rp 15.000...");
      await page.screenshot({
        path: path.join(screenshotDir, "02-subscription-qris-checkout-modal.png"),
        fullPage: false,
      });

      // 4. Lakukan Simulasi Bayar QRIS Sukses
      console.log("5. Menekan tombol simulasi pembayaran sukses...");
      const simulateBtn = page.locator('button:has-text("Simulasi Bayar QRIS Sukses")').first();
      if (await simulateBtn.isVisible()) {
        await simulateBtn.click();
        await page.waitForSelector("text=Pembayaran Berhasil Diterima!", { timeout: 5000 });
        await page.waitForTimeout(600);

        console.log("6. Mengambil screenshot status pembayaran sukses (Guru Pro Aktif)...");
        await page.screenshot({
          path: path.join(screenshotDir, "03-subscription-payment-success.png"),
          fullPage: false,
        });

        // Tutup modal
        const closeSuccessBtn = page
          .locator('button:has-text("Mulai Mengajar dengan Guru Pro")')
          .first();
        if (await closeSuccessBtn.isVisible()) {
          await closeSuccessBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // 5. Buka Halaman Panduan & Promosi (/panduan) - Tab 1: Panduan Cepat Guru
    console.log("7. Membuka halaman /panduan (Tab 1: Panduan Cepat Guru)...");
    await page.goto(`${appUrl}/panduan`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "04-panduan-quick-start-guide.png"),
      fullPage: false,
    });

    // 6. Buka Tab 2: Template Siaran WhatsApp (3 Variasi Copywriting)
    console.log("8. Berpindah ke Tab 2: Template Siaran WhatsApp...");
    const broadcastTab = page.locator('button:has-text("Template Siaran WhatsApp")').first();
    await broadcastTab.click();
    await page.waitForTimeout(600);

    console.log("9. Mengambil screenshot Template Siaran WhatsApp...");
    await page.screenshot({
      path: path.join(screenshotDir, "05-panduan-whatsapp-broadcast-templates.png"),
      fullPage: false,
    });

    console.log("=== SELURUH SCREENSHOT PHASE 23 BERHASIL DISIMPAN! ===");
  } finally {
    await browser.close();
    await prisma.$disconnect();
    if (devServer) {
      devServer.kill();
    }
  }
}

main().catch((err) => {
  console.error("Error visual walkthrough Phase 23:", err);
  process.exit(1);
});
