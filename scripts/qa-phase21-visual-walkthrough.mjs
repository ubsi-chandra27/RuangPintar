import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import path from "path";
import { spawn } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-21-walkthrough";

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

async function cleanupTestUser() {
  const testEmail = "ahmad.fauzi@sma1coba.sch.id";
  const existingUser = await prisma.pengguna.findUnique({
    where: { email: testEmail },
    include: { sekolah: true },
  });

  if (existingUser) {
    const sekolahId = existingUser.sekolah_id;
    await prisma.sesiPengguna.deleteMany({ where: { pengguna_id: existingUser.id } });
    await prisma.permintaanSetupKelasAi.deleteMany({ where: { pengguna_id: existingUser.id } });
    if (sekolahId) {
      await prisma.penempatanRombel.deleteMany({
        where: { rombel: { sekolah_id: sekolahId } },
      });
      await prisma.keikutsertaanSiswa.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.siswa.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.rombel.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.penugasanMengajar.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.guru.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.mataPelajaran.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.tingkatKelas.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.fase.deleteMany({
        where: { sekolah_id: sekolahId },
      });
      await prisma.semester.deleteMany({
        where: { tahun_ajaran: { sekolah_id: sekolahId } },
      });
      await prisma.tahunAjaran.deleteMany({
        where: { sekolah_id: sekolahId },
      });
    }
    await prisma.pengguna.delete({ where: { id: existingUser.id } });
    if (sekolahId) {
      await prisma.sekolah.delete({ where: { id: sekolahId } });
    }
    console.log("✓ Data pengujian akun ahmad.fauzi berhasil dibersihkan dari database.");
  }
}

async function main() {
  console.log("================================================================================");
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 21 AI VISION & SAAS TRIAL");
  console.log("================================================================================\n");

  await cleanupTestUser();

  let serverProcess = null;

  try {
    await checkServerReady("http://localhost:3000/login", 2000);
    console.log("✓ Server Next.js sudah aktif di port 3000.");
  } catch {
    console.log("Menjalankan server Next.js di background (npm run start)...");
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
    console.log("✓ Server Next.js berhasil siap.");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "id-ID",
  });
  const page = await context.newPage();

  // Create temporary sample image for file upload test
  const tempImgPath = path.join(screenshotDir, "sample-attendance-sheet.png");
  // 1x1 transparent png buffer
  const samplePngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  fs.writeFileSync(tempImgPath, samplePngBuffer);

  try {
    // 1. Kunjungi Halaman Registrasi Mandiri Guru
    console.log("1. Mengakses halaman registrasi /register...");
    await page.goto("http://localhost:3000/register", { waitUntil: "networkidle" });
    await page.waitForSelector("text=Coba Gratis 30 Hari", { timeout: 10000 });
    await page.screenshot({
      path: `${screenshotDir}/01-register-page-clean.png`,
    });
    console.log("   ✓ Screenshot 01 tersimpan: Halaman registrasi bersih (4 field).");

    // 2. Isi Formulir Pendaftaran Super Cepat (4 Field)
    console.log("2. Mengisi 4 kolom pendaftaran mandiri...");
    await page.fill('input[name="nama_lengkap"]', "Ahmad Fauzi, S.Pd");
    await page.fill('input[name="email"]', "ahmad.fauzi@sma1coba.sch.id");
    await page.fill('input[name="password"]', "Password123#");
    await page.fill('input[name="nama_sekolah"]', "SMA Negeri 1 Coba");
    await page.screenshot({
      path: `${screenshotDir}/02-register-page-filled.png`,
    });
    console.log("   ✓ Screenshot 02 tersimpan: Formulir terisi lengkap.");

    // 3. Submit Pendaftaran & Redirect Otomatis ke Dashboard
    console.log("3. Menyerahkan formulir dan memverifikasi login otomatis...");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForSelector("text=Paket Guru Mandiri — Uji Coba Gratis", { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${screenshotDir}/03-teacher-dashboard-trial-active.png`,
    });
    console.log("   ✓ Screenshot 03 tersimpan: Dashboard Guru dengan Banner Trial 30 Hari Aktif.");

    // 4. Buka Modal AI Photo Scanning
    console.log("4. Membuka modal pemindai foto kelas berbasis Asisten AI...");
    await page.click('button:has-text("+ Buat Kelas via Foto AI")');
    await page.waitForSelector("text=Buat Kelas Otomatis via Foto AI", { timeout: 5000 });
    await page.waitForTimeout(500);

    // Unggah gambar sampel & isi hint
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(tempImgPath);
    }
    await page.fill('input[placeholder*="X MIPA 1"]', "X MIPA 1");
    await page.fill('input[placeholder*="Matematika"]', "Matematika");
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${screenshotDir}/04-smart-photo-modal-ready.png`,
    });
    console.log("   ✓ Screenshot 04 tersimpan: Modal unggah foto siap proses.");

    // 5. Ekstraksi AI & Tampilkan Modal Pratinjau Siswa (Human-in-the-Loop)
    console.log("5. Menjalankan pemindaian ekstraksi AI...");
    await page.click('button:has-text("Pindai Lembar Absensi via AI")');
    await page.waitForSelector("text=Hasil Ekstraksi Asisten AI", { timeout: 20000 });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${screenshotDir}/05-ai-preview-table-modal.png`,
    });
    console.log("   ✓ Screenshot 05 tersimpan: Pratinjau daftar siswa hasil ekstraksi AI.");

    // 6. Konfirmasi & Terbitkan Kelas
    console.log("6. Mengonfirmasi dan menerbitkan kelas ke database...");
    await page.click('button:has-text("Setujui & Terbitkan Kelas")');
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: `${screenshotDir}/06-class-created-and-quota-updated.png`,
    });
    console.log("   ✓ Screenshot 06 tersimpan: Kelas terbit, kuota rombel ter-update.");

    // 7. Pengujian Tampilan Responsif Mobile
    console.log("7. Menguji tampilan responsif pada perangkat mobile (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      locale: "id-ID",
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://localhost:3000/register", { waitUntil: "networkidle" });
    await mobilePage.waitForSelector("text=Coba Gratis 30 Hari", { timeout: 10000 });
    await mobilePage.screenshot({
      path: `${screenshotDir}/07-mobile-register-responsive.png`,
    });
    console.log("   ✓ Screenshot 07 tersimpan: Tampilan responsif mobile /register.");

    await mobileContext.close();
    console.log("\n================================================================================");
    console.log("WALKTHROUGH SUKSES: SELURUH 7 ARTIFAK VISUAL PHASE 21 BERHASIL DIAMBIL!");
    console.log("================================================================================");
  } catch (err) {
    console.error("Gagal saat walkthrough:", err);
    throw err;
  } finally {
    await browser.close();
    await prisma.$disconnect();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
