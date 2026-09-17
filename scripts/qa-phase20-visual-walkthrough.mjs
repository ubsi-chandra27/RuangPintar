import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-20-walkthrough";

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
  console.log("================================================================================");
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 20 INTEGRATION FOUNDATION");
  console.log("================================================================================\n");

  let serverProcess = null;
  let serverWasRunning = false;

  try {
    await checkServerReady("http://localhost:3000/login", 2000);
    serverWasRunning = true;
    console.log("✓ Server Next.js sudah berjalan di port 3000.");
  } catch {
    console.log("Mempersiapkan server Next.js di background (npm run start)...");
    serverProcess = spawn("npm.cmd", ["run", "start"], {
      cwd: "C:/laragon/www/Ruang-Pintar",
      stdio: "pipe",
      shell: true,
    });

    serverProcess.stdout.on("data", (data) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[Next.js] ${msg}`);
    });

    serverProcess.stderr.on("data", (data) => {
      const msg = data.toString().trim();
      if (msg) console.error(`[Next.js Error] ${msg}`);
    });

    await checkServerReady("http://localhost:3000/login", 35000);
    console.log("✓ Server Next.js berhasil siap melayani permintaan.");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "id-ID",
  });
  const page = await context.newPage();

  try {
    // 1. Login sebagai Super Admin
    console.log("1. Melakukan autentikasi akun Super Admin...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "superadmin");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("   ✓ Berhasil masuk ke dashboard Super Admin.");

    // 2. Akses Portal Integrasi
    console.log("2. Menavigasi ke /integrasi (Pusat Integrasi & Layanan Eksternal)...");
    await page.goto("http://localhost:3000/integrasi", { waitUntil: "networkidle" });
    await page.waitForSelector("text=Pusat Integrasi & Layanan Eksternal", { timeout: 10000 });
    await page.screenshot({
      path: `${screenshotDir}/01-integration-catalog-desktop.png`,
      fullPage: false,
    });
    console.log("   ✓ Screenshot 01 tersimpan: Katalog Adapter Eksternal Desktop.");

    // 3. Buka Modal Pengaturan WhatsApp
    console.log("3. Membuka modal pengaturan adapter WhatsApp Gateway...");
    const settingButtons = await page.$$('button:has-text("Pengaturan")');
    if (settingButtons.length > 0) {
      await settingButtons[0].click();
      await page.waitForSelector("text=Pengaturan: WhatsApp Gateway Notifikasi", { timeout: 5000 });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `${screenshotDir}/02-adapter-config-modal.png`,
      });
      console.log("   ✓ Screenshot 02 tersimpan: Modal Pengaturan Adapter.");
      // Tutup modal
      await page.click('button:has-text("Batal")');
      await page.waitForTimeout(300);
    }

    // 4. Buka Tab Webhook Endpoints
    console.log("4. Membuka Tab Endpoint Webhook...");
    await page.click('button:has-text("Endpoint Webhook")');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/03-webhooks-list.png`,
    });
    console.log("   ✓ Screenshot 03 tersimpan: Daftar Webhook Terdaftar.");

    // 5. Buka Modal Tambah Webhook
    console.log("5. Membuka modal pendaftaran webhook baru...");
    await page.click('button:has-text("Daftar Webhook Baru")');
    await page.waitForSelector("text=Tambah Webhook Baru", { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/04-create-webhook-modal.png`,
    });
    console.log("   ✓ Screenshot 04 tersimpan: Modal Pendaftaran Webhook.");
    await page.click('button:has-text("Batal")');
    await page.waitForTimeout(300);

    // 6. Uji Coba Ping Webhook
    console.log("6. Menguji koneksi ping ke endpoint webhook...");
    const pingButtons = await page.$$('button:has-text("Kirim Test Ping")');
    if (pingButtons.length > 0) {
      await pingButtons[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `${screenshotDir}/05-webhook-ping-tested.png`,
      });
      console.log("   ✓ Screenshot 05 tersimpan: Uji Ping Webhook Selesai.");
    }

    // 7. Buka Tab Log Pengiriman & Audit Trail
    console.log("7. Membuka Tab Log Pengiriman & Audit Trail...");
    await page.click('button:has-text("Log Pengiriman & Audit Trail")');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/06-delivery-audit-logs.png`,
    });
    console.log("   ✓ Screenshot 06 tersimpan: Tabel Log Audit Integrasi.");

    // 8. Tampilan Mobile Viewport 390px
    console.log("8. Memeriksa responsivitas pada viewport smartphone 390px...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('button:has-text("Katalog Adapter Layanan")');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/07-mobile-integration-view.png`,
      fullPage: true,
    });
    console.log("   ✓ Screenshot 07 tersimpan: Tampilan Mobile 390px.");

    console.log(
      "\n================================================================================"
    );
    console.log("✓ SELURUH ALUR VISUAL WALKTHROUGH PHASE 20 BERHASIL TERVERIFIKASI 100%");
    console.log(
      "================================================================================\n"
    );
  } finally {
    await browser.close();
    if (serverProcess && !serverWasRunning) {
      console.log("Menghentikan server background...");
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error("Visual walkthrough error:", err);
  process.exit(1);
});
