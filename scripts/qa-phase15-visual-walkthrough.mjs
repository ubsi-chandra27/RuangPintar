import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-15-walkthrough";

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
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 15 STUDENT EXPERIENCE");
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

    console.log("Menunggu server Next.js siap menerima koneksi...");
    await checkServerReady("http://localhost:3000/login", 35000);
    console.log("✓ Server Next.js berhasil aktif di port 3000.\n");
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // --------------------------------------------------------------------------
    // 1. LOGIN SEBAGAI SISWA & SCREENSHOT DASHBOARD SISWA (DESKTOP)
    // --------------------------------------------------------------------------
    console.log("[1/10] Login sebagai akun siswa (Rian Pratama)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await desktopContext.newPage();

    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "siswa");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${screenshotDir}/01_student_dashboard_desktop.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 01: Dashboard Siswa Desktop tersimpan.");

    // --------------------------------------------------------------------------
    // 2. SCREENSHOT DASHBOARD SISWA (MOBILE VIEWPORT 390x844)
    // --------------------------------------------------------------------------
    console.log("[2/10] Mengambil screenshot tampilan Dashboard Siswa di Mobile...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    const cookies = await desktopContext.cookies();
    await mobileContext.addCookies(cookies);

    await mobilePage.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(1500);

    await mobilePage.screenshot({
      path: `${screenshotDir}/02_student_dashboard_mobile.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 02: Dashboard Siswa Mobile tersimpan.");
    await mobileContext.close();

    // --------------------------------------------------------------------------
    // 3. HALAMAN TUGAS SISWA (/tugas-siswa) - TAB TUGAS KELAS
    // --------------------------------------------------------------------------
    console.log("[3/10] Membuka halaman /tugas-siswa (Tab Tugas Kelas)...");
    await page.goto("http://localhost:3000/tugas-siswa", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `${screenshotDir}/03_student_learning_assignments.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 03: Halaman Tugas Kelas Siswa tersimpan.");

    // --------------------------------------------------------------------------
    // 4. MODAL PENGUMPULAN TUGAS SISWA
    // --------------------------------------------------------------------------
    console.log("[4/10] Membuka Modal Pengumpulan Tugas Siswa...");
    const submitBtn = await page.waitForSelector('button:has-text("Kerjakan Tugas"), button:has-text("Lihat / Edit")', {
      timeout: 5000,
    });
    await submitBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `${screenshotDir}/04_student_submit_assignment_modal.png`,
    });
    console.log("✓ Screenshot 04: Modal Pengumpulan Tugas Siswa tersimpan.");

    // Tutup modal
    const closeSubmitModalBtn = await page.$('button:has-text("Batal"), button:has-text("Tutup"), div[role="dialog"] button:has(svg.lucide-x)');
    if (closeSubmitModalBtn) {
      await closeSubmitModalBtn.click();
      await page.waitForTimeout(500);
    }

    // --------------------------------------------------------------------------
    // 5. TAB MATERI PELAJARAN
    // --------------------------------------------------------------------------
    console.log("[5/10] Beralih ke Tab Materi Pelajaran...");
    const materiTabBtn = await page.waitForSelector('button[role="tab"]:has-text("Materi Pelajaran")', {
      timeout: 5000,
    });
    await materiTabBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `${screenshotDir}/05_student_learning_materials.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 05: Tab Materi Pelajaran tersimpan.");

    // --------------------------------------------------------------------------
    // 6. MODAL DETAIL MATERI PELAJARAN
    // --------------------------------------------------------------------------
    console.log("[6/10] Membuka Modal Detail Materi Siswa...");
    const openMaterialBtn = await page.waitForSelector('button:has-text("Buka Materi")', {
      timeout: 5000,
    });
    await openMaterialBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `${screenshotDir}/06_student_material_detail_modal.png`,
    });
    console.log("✓ Screenshot 06: Modal Pembaca Materi Siswa tersimpan.");

    // Tutup modal materi
    const closeMaterialModalBtn = await page.$('button:has-text("Tutup"), div[role="dialog"] button:has(svg.lucide-x)');
    if (closeMaterialModalBtn) {
      await closeMaterialModalBtn.click();
      await page.waitForTimeout(500);
    }

    // --------------------------------------------------------------------------
    // 7. TAB PRESENSI KELAS SISWA
    // --------------------------------------------------------------------------
    console.log("[7/10] Beralih ke Tab Presensi Kelas Siswa...");
    const presensiTabBtn = await page.waitForSelector('button[role="tab"]:has-text("Presensi")', {
      timeout: 5000,
    });
    await presensiTabBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `${screenshotDir}/07_student_learning_attendance.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 07: Tab Presensi Kelas Siswa tersimpan.");

    // --------------------------------------------------------------------------
    // 8. BUKU NILAI & e-RAPOR SISWA (/rapor-siswa)
    // --------------------------------------------------------------------------
    console.log("[8/10] Membuka halaman Buku Nilai & e-Rapor Siswa (/rapor-siswa)...");
    await page.goto("http://localhost:3000/rapor-siswa", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `${screenshotDir}/08_student_report_card_compilation.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 08: Kompilasi e-Rapor Semester tersimpan.");

    // --------------------------------------------------------------------------
    // 9. MODAL PRATINJAU CETAK RESMI RAPOR A4
    // --------------------------------------------------------------------------
    console.log("[9/10] Membuka Modal Pratinjau Cetak Rapor Resmi A4...");
    const printBtn = await page.waitForSelector('button:has-text("Cetak Lembar Rapor Resmi"), button:has-text("Cetak Rapor Resmi")', {
      timeout: 5000,
    });
    await printBtn.click();
    await page.waitForTimeout(1200);

    await page.screenshot({
      path: `${screenshotDir}/09_student_report_card_print_preview.png`,
    });
    console.log("✓ Screenshot 09: Modal Cetak Rapor Resmi A4 tersimpan.");

    const closePrintModalBtn = await page.$(
      'div[role="dialog"] button:has-text("Tutup")'
    );
    if (closePrintModalBtn) {
      await closePrintModalBtn.click();
      await page.waitForTimeout(800);
    }

    // --------------------------------------------------------------------------
    // 10. TAB RINCIAN ASESMEN TERPUBLIKASI
    // --------------------------------------------------------------------------
    console.log("[10/10] Beralih ke Tab Rincian Asesmen Terpublikasi...");
    const rincianTabBtn = await page.waitForSelector('button[role="tab"]:has-text("Rincian Asesmen Terpublikasi")', {
      timeout: 5000,
    });
    await rincianTabBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `${screenshotDir}/10_student_published_grades_detail.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 10: Rincian Asesmen Terpublikasi tersimpan.");

    await desktopContext.close();
    console.log("\n================================================================================");
    console.log("SELURUH 10 SCREENSHOT WALKTHROUGH PHASE 15 BERHASIL DIAMBIL & TERSIMPAN!");
    console.log("Direktori: docs/phases/screenshots/phase-15-walkthrough/");
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
  console.error("Error during visual walkthrough:", err);
  process.exit(1);
});
