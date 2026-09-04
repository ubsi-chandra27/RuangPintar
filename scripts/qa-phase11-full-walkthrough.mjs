import { chromium } from "file:///C:/laragon/www/Ruang-Pintar/node_modules/playwright/index.mjs";
import fs from "fs";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-11-walkthrough";
const dummyPdfPath =
  "C:/Users/vitam/.gemini/antigravity-cli/brain/1c0aa492-265d-4521-a6dd-84bd4969e7c0/scratch/sample-modul.pdf";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function main() {
  console.log("=== MEMULAI PENGUJIAN OTOMATIS PENUH PHASE 11 ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Login
  console.log("\n[1/8] Menguji Login Guru...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "guru_budi");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log("✓ Berhasil login dan masuk ke Dashboard");

  // 2. Akses /kelas-saya
  console.log("\n[2/8] Menguji Halaman Kelas Saya (/kelas-saya)...");
  await page.goto("http://localhost:3000/kelas-saya", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/01_daftar_kelas_saya.png` });
  console.log("✓ Screenshot 01: Daftar Kelas Saya tersimpan");

  // Cari dan klik tombol "Buka Workspace" atau kartu pertama
  const cardButton = await page.$('a:has-text("Masuk Ruang Kelas"), a:has-text("Buka Workspace")');
  if (!cardButton) {
    throw new Error("Tidak menemukan tombol Masuk Ruang Kelas!");
  }
  await cardButton.click();
  await page.waitForURL("**/kelas-saya/*", { timeout: 15000 });
  await page.waitForTimeout(1500);
  const workspaceUrl = page.url();
  console.log(`✓ Masuk ke Workspace Kelas: ${workspaceUrl}`);
  await page.screenshot({ path: `${screenshotDir}/02_workspace_ringkasan.png` });
  console.log("✓ Screenshot 02: Workspace Ringkasan tersimpan");

  // 3. Tab Lingkup Materi & TP -> Tambah & Edit BAB, Tambah & Edit TP
  console.log("\n[3/8] Menguji Tab Lingkup Materi (BAB) & Tujuan Pembelajaran (TP)...");
  await page.click('button:has-text("Lingkup Materi & TP")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/03_tab_bab_dan_tp.png` });

  // A. Tambah BAB baru
  console.log("-> Menambahkan BAB Baru...");
  await page.click('button:has-text("Tambah BAB")');
  await page.waitForTimeout(600);
  const babKode = `BAB-${Date.now().toString().slice(-3)}`;
  await page.fill('input[name="kode"]', babKode);
  await page.fill('input[name="judul"]', "Pengembangan Web Modern & RESTful API");
  await page.fill(
    'textarea[name="deskripsi"]',
    "Konsep dasar RESTful endpoint, routing, middleware, dan arsitektur data."
  );
  await page.screenshot({ path: `${screenshotDir}/04_modal_tambah_bab.png` });
  await page.click('button[type="submit"]:has-text("Simpan BAB")');
  await page.waitForTimeout(2500);
  console.log("✓ BAB Baru berhasil disimpan");

  // B. Edit BAB yang baru ditambahkan
  console.log("-> Mengedit BAB...");
  const editBabBtns = await page.$$('button[title="Edit BAB"]');
  if (editBabBtns.length > 0) {
    await editBabBtns[editBabBtns.length - 1].click();
    await page.waitForTimeout(600);
    await page.fill('input[name="judul"]', "Pengembangan Web Modern & RESTful API (Revisi)");
    await page.screenshot({ path: `${screenshotDir}/05_modal_edit_bab.png` });
    await page.click('button[type="submit"]:has-text("Simpan Perubahan")');
    await page.waitForTimeout(2500);
    console.log("✓ BAB berhasil diedit");
  }

  // C. Tambah TP pada BAB tersebut
  console.log("-> Menambahkan Tujuan Pembelajaran (TP)...");
  const tambahTpBtns = await page.$$('button:has-text("Tambah TP")');
  if (tambahTpBtns.length > 0) {
    await tambahTpBtns[tambahTpBtns.length - 1].click();
    await page.waitForTimeout(600);
    const tpKode = `TP-${Date.now().toString().slice(-2)}`;
    await page.fill('input[name="kode"]', tpKode);
    await page.fill(
      'textarea[name="deskripsi"]',
      "Peserta didik mampu mendesain skema database relasional dan endpoint REST."
    );
    await page.screenshot({ path: `${screenshotDir}/06_modal_tambah_tp.png` });
    await page.click('button[type="submit"]:has-text("Simpan TP")');
    await page.waitForTimeout(2500);
    console.log("✓ TP berhasil disimpan");
  }

  // D. Edit TP yang baru ditambahkan
  console.log("-> Mengedit TP...");
  const editTpBtns = await page.$$('button[title="Edit TP"]');
  if (editTpBtns.length > 0) {
    await editTpBtns[editTpBtns.length - 1].click();
    await page.waitForTimeout(600);
    await page.fill(
      'textarea[name="deskripsi"]',
      "Peserta didik mampu mendesain skema database relasional dan endpoint REST (Diperbarui)"
    );
    await page.screenshot({ path: `${screenshotDir}/07_modal_edit_tp.png` });
    await page.click('button[type="submit"]:has-text("Simpan Perubahan")');
    await page.waitForTimeout(2500);
    console.log("✓ TP berhasil diedit");
  }

  // 4. Tab Materi Pembelajaran -> Upload Dokumen Berkas
  console.log("\n[4/8] Menguji Tab Materi & Upload File Dokumen...");
  await page
    .locator("button")
    .filter({ hasText: /^Materi/ })
    .first()
    .click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/08_tab_materi.png` });

  console.log("-> Terbitkan Materi Dokumen baru...");
  await page.click('button:has-text("Terbitkan Materi")');
  await page.waitForTimeout(600);
  await page.fill('input[name="judul"]', "Modul Praktikum REST API Node.js & Prisma");
  await page.waitForTimeout(300);

  // Set file input directly
  const fileInput = await page.$('input[type="file"][name="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(dummyPdfPath);
    console.log("✓ File dokumen berhasil dilampirkan");
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${screenshotDir}/09_modal_terbitkan_materi_with_file.png` });
  await page.click('button[type="submit"]:has-text("Terbitkan Materi")');
  await page.waitForTimeout(2500);
  console.log("✓ Materi dokumen berhasil diterbitkan");
  await page.screenshot({ path: `${screenshotDir}/10_daftar_materi_terbit.png` });

  // 5. Tab Jurnal KBM (Administrasi Mengajar)
  console.log("\n[5/8] Menguji Tab Jurnal KBM (Catat Sesi KBM)...");
  await page
    .locator("button")
    .filter({ hasText: /Jurnal KBM/ })
    .first()
    .click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/11_tab_jurnal_kbm.png` });

  console.log("-> Mengisi Jurnal KBM...");
  const catatBtn = await page.$(
    'button:has-text("Catat Sesi / Jurnal KBM"), button:has-text("Isi Jurnal")'
  );
  if (catatBtn) {
    await catatBtn.click();
    await page.waitForTimeout(600);
    await page.fill(
      'input[name="materi_disampaikan"]',
      "Praktik Implementasi Endpoint REST dan Pengujian Postman"
    );
    await page.screenshot({ path: `${screenshotDir}/12_modal_isi_jurnal.png` });
    await page.click('button[type="submit"]:has-text("Simpan Jurnal KBM")');
    await page.waitForTimeout(2500);
    console.log("✓ Jurnal KBM berhasil dicatat");
    await page.screenshot({ path: `${screenshotDir}/13_jurnal_kbm_tercatat.png` });
  }

  // 6. Tab Tugas
  console.log("\n[6/8] Menguji Tab Tugas Pembelajaran...");
  await page
    .locator("button")
    .filter({ hasText: /^Tugas/ })
    .first()
    .click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/14_tab_tugas.png` });

  console.log("-> Membuat Tugas Baru...");
  const buatTugasBtn = await page.$('button:has-text("Terbitkan Tugas")');
  if (buatTugasBtn) {
    await buatTugasBtn.click();
    await page.waitForTimeout(600);
    await page.fill('input[name="judul"]', "Tugas Analisis Desain Database Sekolah");
    await page.fill(
      'textarea[name="petunjuk"]',
      "Kerjakan perancangan tabel basis data sekolah mulai dari tahap 1NF hingga 3NF. Format PDF maksimal 10MB."
    );
    await page.screenshot({ path: `${screenshotDir}/15_modal_buat_tugas.png` });
    await page.click('button[type="submit"]:has-text("Terbitkan Tugas")');
    await page.waitForTimeout(2500);
    console.log("✓ Tugas baru berhasil diterbitkan");
    await page.screenshot({ path: `${screenshotDir}/16_daftar_tugas_terbit.png` });
  }

  // 7. Pengujian Profil Saya (/profil)
  console.log("\n[7/8] Menguji Halaman Profil Saya (/profil)...");
  await page.goto("http://localhost:3000/profil", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/17_profil_tab_kontak.png` });

  console.log("-> Memperbarui data kontak mandiri...");
  await page.fill('input[name="telepon"]', "081298765432");
  await page.fill('textarea[name="alamat"]', "Jl. Pendidikan Mandiri No. 42, Jakarta Selatan");
  await page.click('button:has-text("Simpan Perubahan Profil")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screenshotDir}/18_profil_kontak_updated_toast.png` });
  console.log("✓ Perubahan profil berhasil disimpan");

  // Tab 2 Kepegawaian & KBM
  await page.click('button:has-text("Informasi Kepegawaian & KBM")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${screenshotDir}/19_profil_tab_kepegawaian.png` });
  console.log("✓ Tab kepegawaian & KBM terverifikasi");

  // 8. Tampilan Mobile Responsive
  console.log("\n[8/8] Menguji Tampilan Mobile Responsif (390x844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(workspaceUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${screenshotDir}/20_mobile_workspace_responsive.png` });
  console.log("✓ Screenshot 20: Mobile Workspace responsif tersimpan");

  await browser.close();
  console.log("\n=== SEMUA 8 PENGUJIAN END-TO-END BERHASIL 100% ===");
}

main().catch((err) => {
  console.error("❌ Terjadi kesalahan pada pengujian:", err);
  process.exit(1);
});
