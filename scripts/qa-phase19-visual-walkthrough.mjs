import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-19-walkthrough";

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
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 19 LEADERSHIP & REPORTING");
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

    await checkServerReady("http://localhost:3000/login", 45000);
    console.log("✓ Server Next.js siap menerima koneksi.\n");
  }

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 850 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // ============================================================================
    // 1. Headmaster Leadership View (kepsek_demo)
    // ============================================================================
    console.log("1. Login sebagai Kepala Sekolah (kepsek_demo)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "kepsek_demo");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log("✓ Berhasil login sebagai Drs. H. Mulyono, M.Pd. (Kepala Sekolah).");

    console.log("2. Membuka Portal Pimpinan (/pimpinan)...");
    await page.goto("http://localhost:3000/pimpinan", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Screenshot 01: Headmaster Strategic Overview
    console.log("3. Mengambil screenshot dashboard Kepala Sekolah...");
    await page.screenshot({
      path: `${screenshotDir}/01-headmaster-overview-kpi.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 01 tersimpan.");

    // Screenshot 02: Executive Brief Print Modal
    console.log("4. Membuka modal cetak lembar eksekutif pimpinan...");
    const printBtn = page.locator('button:has-text("Cetak Ringkasan A4")');
    if (await printBtn.isVisible()) {
      await printBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `${screenshotDir}/02-headmaster-executive-print-modal.png`,
        fullPage: false,
      });
      console.log("✓ Screenshot 02 tersimpan.");
      // Tutup modal
      const closeBtn = page.getByRole("button", { name: /tutup/i });
      if ((await closeBtn.count()) > 0) {
        await closeBtn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
      }
    }

    // ============================================================================
    // 2. Curriculum Leadership View (wakakur_demo)
    // ============================================================================
    console.log("5. Logout dan login sebagai Wakasek Kurikulum (wakakur_demo)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "wakakur_demo");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto("http://localhost:3000/pimpinan", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    console.log("6. Mengambil screenshot dashboard Wakasek Kurikulum...");
    await page.screenshot({
      path: `${screenshotDir}/03-curriculum-analytics-view.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 03 tersimpan.");

    // ============================================================================
    // 3. Student Affairs Leadership View (wakasis_demo)
    // ============================================================================
    console.log("7. Logout dan login sebagai Wakasek Kesiswaan (wakasis_demo)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "wakasis_demo");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto("http://localhost:3000/pimpinan", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    console.log("8. Mengambil screenshot dashboard Wakasek Kesiswaan...");
    await page.screenshot({
      path: `${screenshotDir}/04-student-affairs-attendance-matrix.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 04 tersimpan.");

    // ============================================================================
    // 4. Program Head View (kaprog_demo)
    // ============================================================================
    console.log("9. Logout dan login sebagai Kepala Program (kaprog_demo)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "kaprog_demo");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto("http://localhost:3000/pimpinan", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    console.log("10. Mengambil screenshot dashboard Kepala Program Keahlian...");
    await page.screenshot({
      path: `${screenshotDir}/05-program-head-cohort-view.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 05 tersimpan.");

    // ============================================================================
    // 5. Super Admin Perspective & Role Switcher (admin_utama)
    // ============================================================================
    console.log("11. Logout dan login sebagai Super Admin (admin_utama)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "admin_utama");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto("http://localhost:3000/pimpinan", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    console.log("12. Mengambil screenshot Super Admin dengan Context Switcher...");
    await page.screenshot({
      path: `${screenshotDir}/06-superadmin-leadership-switcher.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 06 tersimpan.");

    // Switch ke Tab Pusat Rekap & Ekspor Laporan
    console.log("13. Membuka tab Pusat Rekap & Ekspor...");
    const exportTabBtn = page.locator('button:has-text("Pusat Laporan & Ekspor")');
    if (await exportTabBtn.isVisible()) {
      await exportTabBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `${screenshotDir}/07-export-center-and-history.png`,
        fullPage: false,
      });
      console.log("✓ Screenshot 07 tersimpan.");
    }

    // ============================================================================
    // 6. Mobile Responsive View (iPhone 13 - 390x844)
    // ============================================================================
    console.log("14. Menguji tampilan responsif mobile (390 x 844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/pimpinan", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `${screenshotDir}/08-mobile-leadership-portal.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 08 tersimpan.");

    console.log(
      "\n================================================================================"
    );
    console.log("SELURUH TAHAPAN PLAYWRIGHT WALKTHROUGH PHASE 19 SELESAI DENGAN SUKSES!");
    console.log("Tangkapan layar tersimpan di:", screenshotDir);
    console.log(
      "================================================================================\n"
    );
  } finally {
    await browser.close();
    if (serverProcess && !serverWasRunning) {
      console.log("Menghentikan server Next.js lokal...");
      serverProcess.kill("SIGINT");
    }
  }
}

main().catch((err) => {
  console.error("FATAL ERROR pada Playwright Walkthrough:", err);
  process.exit(1);
});
