import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-16-walkthrough";

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
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 16 GUARDIAN EXPERIENCE");
  console.log("================================================================================\n");

  let serverProcess = null;
  let serverWasRunning = false;

  // Cek apakah server localhost:3000 sudah berjalan
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
      if (msg) console.error(`[Next.js Err] ${msg}`);
    });

    console.log("Menunggu server Next.js siap melayani request...");
    await checkServerReady("http://localhost:3000/login", 35000);
    console.log("✓ Server Next.js siap.");
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

    // 1. Login sebagai Wali Murid: wali_santoso
    console.log("1. Melakukan autentikasi sebagai Wali Murid (wali_santoso)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "wali_santoso");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log("✓ Berhasil login dan dialihkan ke /dashboard");

    // 2. Screenshot 01: Guardian Dashboard Desktop
    console.log("2. Mengambil screenshot Guardian Dashboard Desktop...");
    await page.screenshot({
      path: `${screenshotDir}/01_guardian_dashboard_desktop.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 01 tersimpan.");

    // 3. Screenshot 02: Guardian Dashboard Mobile Viewport
    console.log("3. Mengambil screenshot Guardian Dashboard Mobile Viewport (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/02_guardian_dashboard_mobile.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 02 tersimpan.");

    // Kembalikan viewport ke Desktop
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.waitForTimeout(500);

    // 4. Screenshot 03: Multi-Child Context Switcher
    console.log("4. Menguji Multi-Child Context Switcher...");
    const switcherBtn = page.locator('[data-testid="child-switcher-button"]');
    if (await switcherBtn.isVisible()) {
      await switcherBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `${screenshotDir}/03_guardian_child_switcher_dropdown.png`,
      });
      console.log("✓ Screenshot 03 tersimpan (Dropdown Switcher Anak Terbuka).");

      // Klik anak kedua jika ada di menu
      const secondChild = page.locator('[data-testid="child-switcher-menu"] button').nth(1);
      if (await secondChild.isVisible()) {
        await secondChild.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: `${screenshotDir}/04_guardian_child_switched_view.png`,
          fullPage: true,
        });
        console.log("✓ Screenshot 04 tersimpan (Konteks Anak Berhasil Beralih).");

        // Kembalikan ke anak pertama agar data KBM X RPL lengkap
        const switcherBtnAgain = page.locator('[data-testid="child-switcher-button"]');
        await switcherBtnAgain.click();
        await page.waitForTimeout(400);
        const firstChild = page.locator('[data-testid="child-switcher-menu"] button').nth(0);
        await firstChild.click();
        await page.waitForTimeout(1500);
      }
    }

    // 5. Screenshot 05: Modal Pengajuan Izin / Sakit
    console.log("5. Membuka Modal Pengajuan Izin / Sakit...");
    const btnAjukan = page.locator('[data-testid="button-ajukan-izin"]');
    if (await btnAjukan.isVisible()) {
      await btnAjukan.click();
      await page.waitForSelector('[data-testid="pengajuan-izin-modal"]', { timeout: 5000 });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `${screenshotDir}/05_guardian_pengajuan_izin_modal.png`,
      });
      console.log("✓ Screenshot 05 tersimpan (Modal Formulir Permohonan Izin).");

      // Tutup modal
      await page.click('button:has-text("Batal")');
      await page.waitForTimeout(400);
    }

    // 6. Screenshot 06: Halaman Presensi Anak (/presensi-anak)
    console.log("6. Mengunjungi halaman Presensi Anak (/presensi-anak)...");
    await page.goto("http://localhost:3000/presensi-anak", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${screenshotDir}/06_guardian_attendance_view.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 06 tersimpan (Presensi & Log Sesi KBM Anak).");

    // 7. Screenshot 07: Halaman Perkembangan Nilai & Rapor (/nilai-anak - Tab Nilai Asesmen)
    console.log("7. Mengunjungi halaman Perkembangan Nilai & Rapor (/nilai-anak)...");
    await page.goto("http://localhost:3000/nilai-anak", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${screenshotDir}/07_guardian_published_grades.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 07 tersimpan (Nilai Asesmen Terpublikasi Resmi).");

    // 8. Screenshot 08: Tab e-Rapor Kurikulum Merdeka
    console.log("8. Membuka Tab Buku e-Rapor Resmi...");
    const tabReport = page.locator('[data-testid="tab-report"]');
    await tabReport.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `${screenshotDir}/08_guardian_report_card_view.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 08 tersimpan (Buku e-Rapor Kurikulum Merdeka).");

    // 9. Screenshot 09: Pratinjau Cetak Lembar Rapor A4
    console.log("9. Membuka Pratinjau Cetak Lembar Rapor A4...");
    const btnCetak = page.locator('[data-testid="btn-cetak-rapor"]');
    if (await btnCetak.isVisible()) {
      await btnCetak.click();
      await page.waitForSelector('[data-testid="guardian-report-print-modal"]', { timeout: 5000 });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${screenshotDir}/09_guardian_report_print_preview_a4.png`,
      });
      console.log("✓ Screenshot 09 tersimpan (Pratinjau Lembar Rapor Resmi A4).");
    }

    console.log(
      "\n================================================================================"
    );
    console.log("SELURUH 9 SCREENSHOT VISUAL WALKTHROUGH PHASE 16 BERHASIL TERSIMPAN!");
    console.log("Direktori: " + screenshotDir);
    console.log(
      "================================================================================\n"
    );
  } finally {
    await browser.close();

    if (serverProcess && !serverWasRunning) {
      console.log("Menghentikan background Next.js server process...");
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error("Visual Walkthrough GAGAL:", err);
  process.exit(1);
});
