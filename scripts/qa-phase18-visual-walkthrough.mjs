import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-18-walkthrough";

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
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 18 STUDENT MONITORING & HOMEROOM");
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
    // 1. Teacher Dashboard: Homeroom KPI & Quick Access Link
    // ============================================================================
    console.log("1. Login sebagai Guru Wali Kelas (guru_demo)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "guru_demo");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log("✓ Berhasil login sebagai Marhanih, S.Pd (guru_demo).");

    // Screenshot 01: Teacher Dashboard with Homeroom KPI Card & Shortcut
    console.log("2. Mengambil screenshot dashboard guru dengan KPI wali kelas...");
    await page.screenshot({
      path: `${screenshotDir}/01-teacher-dashboard-homeroom-kpi.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 01 tersimpan.");

    // ============================================================================
    // 2. Homeroom Portal: Overview Banner & 4 KPI Cards
    // ============================================================================
    console.log("3. Mengunjungi Portal Wali Kelas (/wali-kelas)...");
    await page.goto("http://localhost:3000/wali-kelas", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Screenshot 02: Portal Overview & KPI Cards
    console.log("4. Mengambil screenshot overview portal wali kelas...");
    await page.screenshot({
      path: `${screenshotDir}/02-homeroom-portal-overview.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 02 tersimpan.");

    // ============================================================================
    // 3. Roster Table: Holistic Indicators & Status Badges
    // ============================================================================
    console.log("5. Mengambil screenshot tabel roster siswa dengan indikator presensi, tugas, nilai...");
    await page.screenshot({
      path: `${screenshotDir}/03-roster-student-indicators.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 03 tersimpan.");

    // ============================================================================
    // 4. Attention Center Tab
    // ============================================================================
    console.log("6. Berpindah ke tab Pusat Perhatian (Attention Center)...");
    const attentionTabBtn = page.locator('button:has-text("Pusat Perhatian (Attention)")');
    await attentionTabBtn.click();
    await page.waitForTimeout(600);

    // Screenshot 04: Attention Center with Early Intervention Cards
    await page.screenshot({
      path: `${screenshotDir}/04-attention-center-tab.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 04 tersimpan.");

    // ============================================================================
    // 5. Holistic Student Detail Modal: Presensi Sesi Tab
    // ============================================================================
    console.log("7. Membuka modal investigasi holistik siswa (Aditya Pratama)...");
    const detailBtn = page.locator('button:has-text("Investigasi Detail")').first();
    await detailBtn.click();
    await page.waitForTimeout(1000);

    // Screenshot 05: Modal Presensi Sesi
    await page.screenshot({
      path: `${screenshotDir}/05-student-detail-modal-attendance.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 05 tersimpan.");

    // ============================================================================
    // 6. Holistic Student Detail Modal: Tugas & Nilai Asesmen Tabs
    // ============================================================================
    console.log("8. Melihat tab Tugas dan Nilai Asesmen di dalam modal detail...");
    const modalTugasBtn = page.locator('div.fixed button:has-text("Tugas")');
    if (await modalTugasBtn.count() > 0) {
      await modalTugasBtn.click();
      await page.waitForTimeout(600);
    }

    // Screenshot 06: Detail Modal Tugas
    await page.screenshot({
      path: `${screenshotDir}/06-student-detail-modal-assignments-and-grades.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 06 tersimpan.");

    // Tutup modal detail
    const closeDetailModalBtn = page.locator('div.fixed button.p-1\\.5:has(svg.lucide-x)').first();
    if (await closeDetailModalBtn.count() > 0) {
      await closeDetailModalBtn.click();
      await page.waitForTimeout(500);
    }

    // ============================================================================
    // 7. Modal Catatan Pembinaan Siswa
    // ============================================================================
    console.log("9. Membuka modal 'Buat Catatan Pembinaan'...");
    const createNoteHeroBtn = page.locator('button:has-text("Buat Catatan Pembinaan")').first();
    await createNoteHeroBtn.click();
    await page.waitForTimeout(600);

    // Screenshot 07: Create Note Modal
    await page.screenshot({
      path: `${screenshotDir}/07-create-monitoring-note-modal.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 07 tersimpan.");

    // Tutup modal catatan
    const closeNoteModalBtn = page.locator('div.fixed button.p-1\\.5:has(svg.lucide-x)').first();
    if (await closeNoteModalBtn.count() > 0) {
      await closeNoteModalBtn.click();
      await page.waitForTimeout(500);
    }

    // ============================================================================
    // 8. Tab Catatan Pembinaan & Follow-Up
    // ============================================================================
    console.log("10. Membuka tab Catatan Pembinaan & Follow-Up...");
    const notesTabBtn = page.locator('button:has-text("Catatan Pembinaan & Follow-Up")');
    await notesTabBtn.click();
    await page.waitForTimeout(600);

    // Screenshot 08: Guidance Notes & Follow-Up Actions
    await page.screenshot({
      path: `${screenshotDir}/08-notes-and-followup-tab.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 08 tersimpan.");

    // ============================================================================
    // 9. Super Admin: Multi-Rombel Selector (Supervisi Sekolah)
    // ============================================================================
    console.log("11. Login sebagai Super Admin untuk pengujian supervisi multi-rombel...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "superadmin");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.goto("http://localhost:3000/wali-kelas", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Screenshot 09: Super Admin Multi-Rombel Selector
    await page.screenshot({
      path: `${screenshotDir}/09-superadmin-homeroom-supervision.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 09 tersimpan.");

    // ============================================================================
    // 10. Mobile Responsiveness View (390 x 844)
    // ============================================================================
    console.log("12. Menguji tampilan responsif mobile (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    // Screenshot 10: Mobile View
    await page.screenshot({
      path: `${screenshotDir}/10-mobile-homeroom-view.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 10 tersimpan.");

    console.log("\n================================================================================");
    console.log("✓ PLAYWRIGHT VISUAL WALKTHROUGH PHASE 18 SELESAI DENGAN SUKSES!");
    console.log(`✓ 10 screenshot tersimpan di: ${screenshotDir}`);
    console.log("================================================================================\n");
  } finally {
    await browser.close();

    if (serverProcess && !serverWasRunning) {
      console.log("Menghentikan server Next.js background...");
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error("Kesalahan fatal saat walkthrough:", err);
  process.exit(1);
});
