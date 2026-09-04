import { chromium } from "file:///C:/laragon/www/Ruang-Pintar/node_modules/playwright/index.mjs";
import fs from "fs";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-13-walkthrough";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function main() {
  console.log("=== MEMULAI PENGUJIAN OTOMATIS PENUH PHASE 13 (ASSESSMENT, TP & GRADEBOOK) ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("PAGE ERROR LOG:", msg.text());
    }
  });

  // 1. Login Guru Budi
  console.log("\n[1/8] Menguji Login Guru Budi...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="username"]', "guru_budi");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log("✓ Berhasil login dan masuk ke Dashboard Guru");
  await page.screenshot({ path: `${screenshotDir}/01_dashboard_guru.png` });

  // 2. Akses Kelas Saya
  console.log("\n[2/8] Menguji Halaman Kelas Saya (/kelas-saya)...");
  await page.goto("http://localhost:3000/kelas-saya", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/02_kelas_saya_list.png` });
  console.log("✓ Screenshot 02: Daftar Kelas Saya tersimpan");

  // Buka kelas X TO 3 (yang memiliki 6 siswa aktif)
  const targetClassUrl = "http://localhost:3000/kelas-saya/01M19MV9C4C878B7D9345R4GTT";
  console.log(`-> Membuka kelas dengan siswa aktif: ${targetClassUrl}`);
  await page.goto(targetClassUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // 3. Pindah ke Tab 8 (Penilaian & Buku Nilai)
  console.log("\n[3/8] Membuka Tab 8: Penilaian & Buku Nilai...");
  const assessmentTabButton = await page.waitForSelector('button[data-tab="PENILAIAN"]', {
    timeout: 10000,
  });
  await assessmentTabButton.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/03_tab_penilaian_initial.png` });
  console.log("✓ Screenshot 03: Tab Penilaian & Buku Nilai Awal tersimpan");

  // 4. Buka Modal Buat Asesmen Baru
  console.log("\n[4/8] Membuat Asesmen Baru Berbasis TP...");
  const createAssessmentBtn = await page.waitForSelector('button:has-text("Buat Asesmen Baru")', {
    timeout: 10000,
  });
  await createAssessmentBtn.click();
  await page.waitForSelector("#create-assessment-title", { timeout: 5000 });
  await page.waitForTimeout(600);

  // Isi form asesmen baru
  await page.fill(
    'input[placeholder*="Formatif TP"]',
    "Formatif TP 1.1: Pemahaman Logika Algoritma"
  );

  // Pilih BAB 1
  const selectBab = await page.$('select:has(option:has-text("Algoritma"))');
  if (selectBab) {
    const options = await selectBab.$$("option");
    if (options.length > 1) {
      await selectBab.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  }

  // Pilih TP 1.1
  const selectTp = await page.$('select:has(option:has-text("Memahami konsep"))');
  if (selectTp) {
    const options = await selectTp.$$("option");
    if (options.length > 1) {
      await selectTp.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  }

  await page.screenshot({ path: `${screenshotDir}/04_modal_buat_asesmen.png` });
  console.log("✓ Screenshot 04: Modal Buat Asesmen Baru tersimpan");

  // Submit form asesmen
  await page.click('button[type="submit"]:has-text("Simpan Asesmen")');
  await page.waitForSelector("#create-assessment-title", { state: "detached", timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/05_daftar_asesmen_terupdate.png` });
  console.log("✓ Screenshot 05: Daftar Asesmen Setelah Ditambahkan tersimpan");

  // 5. Buka Modal Input Nilai Siswa
  console.log("\n[5/8] Membuka Modal Input Nilai Siswa...");
  const inputNilaiButton = await page.waitForSelector('button:has-text("Input Nilai")', {
    timeout: 10000,
  });
  await inputNilaiButton.click();
  await page.waitForSelector("#input-grades-title", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Uji Quick-Fill KKTP
  console.log("-> Menguji Quick Fill KKTP (75)...");
  const quickFillBtn = await page.waitForSelector('button:has-text("Isi KKTP")', { timeout: 5000 });
  if (quickFillBtn) {
    await quickFillBtn.click();
    await page.waitForTimeout(600);
  }

  // Ubah nilai siswa 1 jadi 92 (Tercapai Optimal)
  const scoreInputs = await page.$$('table input[type="number"]');
  if (scoreInputs.length > 0) {
    await scoreInputs[0].fill("92");
  }
  // Siswa terakhir kita kosongkan untuk membuktikan invariant: Missing Grade ≠ Zero Grade
  if (scoreInputs.length > 2) {
    await scoreInputs[scoreInputs.length - 1].fill("");
  }

  await page.screenshot({
    path: `${screenshotDir}/06_modal_input_nilai_missing_grade_handled.png`,
  });
  console.log("✓ Screenshot 06: Input Nilai dengan Missing Grade ≠ 0 tersimpan");

  // Simpan Draf
  console.log("-> Menyimpan Nilai Draf...");
  await page.click('button:has-text("Simpan Draf")');
  await page.waitForSelector("#input-grades-title", { state: "detached", timeout: 15000 });
  await page.waitForTimeout(1500);

  // 6. Publikasikan Nilai
  console.log("\n[6/8] Mempublikasikan Nilai Asesmen...");
  const publishButton = await page.waitForSelector('button:has-text("Publikasi")', {
    timeout: 10000,
  });
  await publishButton.click();
  await page.waitForSelector("#publish-modal-title", { timeout: 10000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${screenshotDir}/07_modal_publikasikan_nilai.png` });

  // Konfirmasi Publikasi
  await page.click('button[type="submit"]:has-text("Publikasikan Sekarang")');
  await page.waitForSelector("#publish-modal-title", { state: "detached", timeout: 15000 });
  await page.waitForTimeout(1500);

  // 7. Pindah ke Tampilan Buku Nilai (Gradebook Matrix)
  console.log("\n[7/8] Menguji Tampilan Matriks Buku Nilai (Gradebook View)...");
  const gradebookViewBtn = await page.waitForSelector(
    'button:has-text("Buku Nilai (Gradebook Matrix)")',
    { timeout: 10000 }
  );
  await gradebookViewBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/08_buku_nilai_matrix_view.png` });
  console.log("✓ Screenshot 08: Tampilan Matriks Buku Nilai tersimpan");

  // 8. Akses Halaman Pusat Penilaian (/penilaian)
  console.log("\n[8/8] Menguji Halaman Pusat Buku Nilai Guru (/penilaian)...");
  await page.goto("http://localhost:3000/penilaian", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/09_penilaian_centralized_overview.png` });
  console.log("✓ Screenshot 09: Halaman Pusat Penilaian Guru tersimpan");

  // 9. Uji Mobile Viewport (iPhone 14 / 390x844)
  console.log("\n[Bonus] Menguji Mobile Viewport & Bottom Navigation Bar...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/10_mobile_penilaian_overview.png` });

  // Buka detail kelas pada mobile view
  await page.goto(targetClassUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const mobileAssessmentTab = await page.waitForSelector('button[data-tab="PENILAIAN"]', {
    timeout: 10000,
  });
  await mobileAssessmentTab.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/11_mobile_kelas_tab_penilaian.png` });
  console.log("✓ Screenshot 10-11: Tampilan Mobile Viewport tersimpan");

  await browser.close();
  console.log("\n=== SELURUH PENGUJIAN OTOMATIS & VISUAL QA PHASE 13 SELESAI DENGAN SUKSES ===");
}

main().catch((err) => {
  console.error("Gagal menjalankan pengujian:", err);
  process.exit(1);
});
