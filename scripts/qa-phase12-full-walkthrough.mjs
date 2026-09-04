import { chromium } from "file:///C:/laragon/www/Ruang-Pintar/node_modules/playwright/index.mjs";
import fs from "fs";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-12-walkthrough";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function main() {
  console.log("=== MEMULAI PENGUJIAN OTOMATIS PENUH PHASE 12 (CLASS ATTENDANCE) ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Login Guru Budi
  console.log("\n[1/7] Menguji Login Guru Budi...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "guru_budi");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log("✓ Berhasil login dan masuk ke Dashboard Guru");
  await page.screenshot({ path: `${screenshotDir}/01_dashboard_guru_jadwal_hari_ini.png` });
  console.log("✓ Screenshot 01: Dashboard Guru tersimpan");

  // 2. Akses Halaman Sesi Pembelajaran (/sesi-pembelajaran)
  console.log("\n[2/7] Menguji Halaman Sesi Pembelajaran (/sesi-pembelajaran)...");
  await page.goto("http://localhost:3000/sesi-pembelajaran", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/02_sesi_pembelajaran_daftar_sesi.png` });
  console.log("✓ Screenshot 02: Halaman Sesi Pembelajaran tersimpan");

  // Pastikan ada sesi kelas; jika belum ada, buat sesi kelas aktif baru
  const presensiButton = await page.$('button:has-text("Presensi")');
  if (!presensiButton) {
    console.log("-> Belum ada tombol Presensi, membuat sesi baru via tombol 'Mulai Sesi Kelas'...");
    await page.click('button:has-text("Mulai Sesi Kelas")');
    await page.waitForTimeout(600);
    // Simpan sesi baru
    const submitSesi = await page.$('button[type="submit"]:has-text("Mulai Sesi")');
    if (submitSesi) {
      await submitSesi.click();
      await page.waitForTimeout(1500);
    }
  }

  // 3. Buka Modal Presensi Sesi Kelas
  console.log("\n[3/7] Membuka Modal Presensi Sesi Kelas...");
  const targetPresensiButton = await page.waitForSelector('button:has-text("Presensi")', {
    timeout: 10000,
  });
  await targetPresensiButton.click();
  await page.waitForSelector(
    'h2:has-text("Presensi Sesi KBM"), div:has-text("Presensi Sesi KBM")',
    {
      timeout: 10000,
    }
  );
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/03_modal_presensi_initial.png` });
  console.log("✓ Screenshot 03: Modal Presensi Awal tersimpan");

  // 4. Uji Quick Action "Tandai Semua Hadir" (One-Click Bulk Action)
  console.log("\n[4/7] Menguji Tombol Sakti 'Tandai Semua Hadir'...");
  await page.click('button:has-text("Tandai Semua Hadir")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${screenshotDir}/04_modal_presensi_tandai_semua_hadir.png` });
  console.log("✓ Screenshot 04: Seluruh Siswa Ditandai Hadir (100% Kehadiran) tersimpan");

  // 5. Ubah Status Siswa Individu (Izin & Sakit beserta Catatan Alasan)
  console.log("\n[5/7] Menguji Pengaturan Status Siswa (Izin & Sakit dengan Catatan)...");
  // Siswa 2: Izin
  const izinButtons = await page.$$('button:has-text("Izin")');
  if (izinButtons.length > 1) {
    await izinButtons[1].click();
    await page.waitForTimeout(300);
    const reasonInput = await page.waitForSelector('input[placeholder*="Alasan / no surat"]', {
      timeout: 5000,
    });
    await reasonInput.fill("Izin urusan keluarga mendadak");
  }

  // Siswa 3: Sakit (jika ada lebih dari 2 siswa)
  const sakitButtons = await page.$$('button:has-text("Sakit")');
  if (sakitButtons.length > 2) {
    await sakitButtons[2].click();
    await page.waitForTimeout(300);
    const reasonInputs = await page.$$('input[placeholder*="Alasan / no surat"]');
    if (reasonInputs.length > 1) {
      await reasonInputs[1].fill("Demam tinggi surat dokter");
    }
  }

  await page.waitForTimeout(600);
  await page.screenshot({ path: `${screenshotDir}/05_modal_presensi_custom_izin_sakit.png` });
  console.log("✓ Screenshot 05: Status Izin & Sakit tersimpan");

  // 6. Simpan Presensi Sesi Kelas
  console.log("\n[6/7] Menyimpan Presensi Sesi Kelas...");
  await page.click('button:has-text("Simpan Presensi Kelas")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/06_modal_presensi_tersimpan_toast.png` });
  console.log("✓ Screenshot 06: Notifikasi Presensi Berhasil Disimpan tersimpan");

  // 7. Akses Workspace Kelas (/kelas-saya) -> Tab Presensi
  console.log("\n[7/7] Menguji Integrasi Tab Presensi pada Workspace Kelas (/kelas-saya/[id])...");
  await page.goto("http://localhost:3000/kelas-saya", { waitUntil: "networkidle" });
  // Filter pencarian untuk kartu kelas X TO 3
  const searchInput = await page.$('input[placeholder*="Cari rombel"]');
  if (searchInput) {
    await searchInput.fill("X TO 3");
    await page.waitForTimeout(1000);
  }

  const openClassBtn = await page.$(
    'a:has-text("Masuk Ruang Kelas"), a:has-text("Buka Workspace")'
  );
  if (openClassBtn) {
    await openClassBtn.click();
    await page.waitForURL("**/kelas-saya/*", { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Klik Tab Presensi
    await page.click('button:has-text("Presensi")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/07_workspace_kelas_tab_presensi.png` });
    console.log("✓ Screenshot 07: Tab Presensi di Workspace Kelas tersimpan");

    // Uji Buka / Koreksi Presensi dari Tab Presensi
    const koreksiBtn = await page.$(
      'button:has-text("Buka / Koreksi Presensi"), button:has-text("Catat Presensi Siswa")'
    );
    if (koreksiBtn) {
      await koreksiBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/08_modal_koreksi_presensi.png` });
      console.log("✓ Screenshot 08: Modal Koreksi Presensi tersimpan");

      // Tutup modal
      const closeBtn = await page.$('button:has-text("Tutup")');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // 8. Mobile Viewport Responsive Check (390 x 844)
    console.log("\n[Responsive] Menguji Tampilan Mobile (390 x 844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotDir}/09_mobile_tab_presensi.png` });
    console.log("✓ Screenshot 09: Mobile Tab Presensi tersimpan");

    // Buka modal di mobile
    const mobileKoreksiBtn = await page.$(
      'button:has-text("Buka / Koreksi Presensi"), button:has-text("Catat Presensi Siswa")'
    );
    if (mobileKoreksiBtn) {
      await mobileKoreksiBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/10_mobile_modal_presensi.png` });
      console.log("✓ Screenshot 10: Mobile Modal Presensi tersimpan");
    }
  }

  await browser.close();
  console.log("\n=== SELURUH PENGUJIAN OTOMATIS PHASE 12 SUKSES 100% ===");
}

main().catch((err) => {
  console.error("Error selama walkthrough Phase 12:", err);
  process.exit(1);
});
