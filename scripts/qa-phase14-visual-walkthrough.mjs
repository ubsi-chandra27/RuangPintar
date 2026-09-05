import { chromium } from "playwright";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-14-walkthrough";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function main() {
  console.log("================================================================================");
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 14 CBT");
  console.log("================================================================================\n");

  const penugasanId = "01M19MV9BYJTTFTR1Z02JE8AEV";
  const penugasan = await prisma.penugasanMengajar.findUnique({
    where: { id: penugasanId },
    include: { guru: true, rombel: true, mata_pelajaran: true },
  });
  if (!penugasan) throw new Error("Penugasan X TO 1 tidak ditemukan");

  // Pastikan ada Ujian CBT Published
  const exam = await prisma.ujianCbt.findFirst({
    where: {
      penugasan_mengajar_id: penugasanId,
      status: { in: ["DIPUBLIKASI", "DITERBITKAN", "PUBLISHED"] },
    },
    include: { snapshot_ujian: true },
  });
  if (!exam) throw new Error("Ujian CBT Published tidak ditemukan");

  // Link student Abdullah Azami to siswa_budi
  const siswa = await prisma.siswa.findFirst({
    where: { nis: "20261045" },
  });
  if (siswa) {
    await prisma.siswa.update({
      where: { id: siswa.id },
      data: { pengguna_id: "01JA000000000000000000STUD01" },
    });

    // Clean up previous attempts for clean test run
    const prevSessions = await prisma.sesiUjianSiswa.findMany({
      where: { ujian_cbt_id: exam.id, siswa_id: siswa.id },
      select: { id: true },
    });
    for (const sess of prevSessions) {
      await prisma.hasilUjianCbt.deleteMany({ where: { sesi_ujian_id: sess.id } });
      await prisma.eventIntegritasUjian.deleteMany({ where: { sesi_ujian_id: sess.id } });
      await prisma.jawabanSiswa.deleteMany({ where: { sesi_ujian_id: sess.id } });
      await prisma.sesiUjianSiswa.delete({ where: { id: sess.id } });
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // --------------------------------------------------------------------------
    // 1. LOGIN GURU & BUKA PORTAL CBT (/cbt-ujian)
    // --------------------------------------------------------------------------
    console.log("[1/10] Login sebagai Guru Budi & membuka /cbt-ujian...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "guru_budi");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await page.waitForTimeout(1000);

    // Buka /cbt-ujian
    await page.goto("http://localhost:3000/cbt-ujian", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotDir}/01_portal_cbt_guru.png` });
    console.log("✓ Screenshot 01: Portal CBT Guru tersimpan");

    // --------------------------------------------------------------------------
    // 2. MODAL BANK SOAL
    // --------------------------------------------------------------------------
    console.log("[2/10] Membuka Modal Bank Soal...");
    const bankBtn = await page.waitForSelector('button:has-text("Buka Bank Soal")', {
      timeout: 5000,
    });
    await bankBtn.click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${screenshotDir}/02_modal_bank_soal.png` });
    console.log("✓ Screenshot 02: Modal Bank Soal tersimpan");

    const closeBankBtn = await page.$(
      'button:has-text("Tutup"), button[aria-label="Close"], button:has-text("Batal"), div[role="dialog"] button:has(svg.lucide-x)'
    );
    if (closeBankBtn) {
      await closeBankBtn.click();
      await page.waitForTimeout(500);
    }

    // --------------------------------------------------------------------------
    // 3. BUKA WORKSPACE KELAS X TO 1 & TAB CBT
    // --------------------------------------------------------------------------
    console.log("[3/10] Membuka Workspace Kelas X TO 1 Tab CBT...");
    await page.goto(`http://localhost:3000/kelas-saya/${penugasanId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);

    const cbtTabButton = await page.waitForSelector('button[data-tab="CBT"]', {
      timeout: 10000,
    });
    await cbtTabButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotDir}/03_kelas_tab_cbt.png` });
    console.log("✓ Screenshot 03: Workspace Kelas Tab CBT tersimpan");

    // --------------------------------------------------------------------------
    // 4. MODAL BUAT UJIAN CBT (BLUEPRINT COMPOSER)
    // --------------------------------------------------------------------------
    console.log("[4/10] Membuka Modal Susun Ujian CBT...");
    const createExamBtn = await page.waitForSelector('button:has-text("Susun Ujian")', {
      timeout: 5000,
    });
    await createExamBtn.click();
    await page.waitForTimeout(1000);
    const judulInput = await page.$('input[placeholder*="Penilaian Sumatif"]');
    if (judulInput) {
      await judulInput.fill("Penilaian Sumatif Akhir Semester (SAS) Ganjil");
    }
    await page.screenshot({ path: `${screenshotDir}/04_modal_buat_ujian_blueprint.png` });
    console.log("✓ Screenshot 04: Modal Buat Ujian Blueprint tersimpan");

    const closeCreateBtn = await page.$('button:has-text("Batal")');
    if (closeCreateBtn) {
      await closeCreateBtn.click();
      await page.waitForTimeout(500);
    }

    // --------------------------------------------------------------------------
    // 5. MODAL MONITORING HASIL PROCTOR
    // --------------------------------------------------------------------------
    console.log("[5/10] Membuka Modal Monitoring & Hasil Proctor...");
    const monitorBtn = await page.waitForSelector('button:has-text("Monitor & Hasil")', {
      timeout: 5000,
    });
    await monitorBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotDir}/05_modal_monitoring_hasil_proctor.png` });
    console.log("✓ Screenshot 05: Modal Monitoring Hasil Proctor tersimpan");

    const closeMonitorBtn = await page.$(
      'div[role="dialog"] button:has(svg), button:has(svg.lucide-x)'
    );
    if (closeMonitorBtn) {
      await closeMonitorBtn.click();
      await page.waitForTimeout(500);
    }

    // --------------------------------------------------------------------------
    // 6. LOGIN SISWA BUDI & LIHAT PORTAL UJIAN SISWA
    // --------------------------------------------------------------------------
    console.log("\n[6/10] Login sebagai Siswa Abdullah Azami (siswa_budi)...");
    await context.clearCookies();
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "siswa_budi");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await page.waitForTimeout(1000);

    await page.goto("http://localhost:3000/cbt-ujian", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/06_portal_cbt_siswa.png` });
    console.log("✓ Screenshot 06: Portal CBT Siswa tersimpan");

    // --------------------------------------------------------------------------
    // 7. CBT PLAYER SISWA
    // --------------------------------------------------------------------------
    console.log("\n[7/10] Meluncurkan CBT Player Siswa...");
    await page.fill('input[placeholder*="Cari judul ujian"]', "Logika");
    await page.waitForTimeout(800);

    const startExamBtn = await page.waitForSelector(`a[href*="${exam.id}"]`, {
      timeout: 8000,
    });
    await startExamBtn.click();
    await page.waitForURL(
      (url) => url.pathname.startsWith("/cbt/") && url.pathname !== "/cbt/start",
      { timeout: 20000 }
    );
    await page.waitForSelector('button:has-text("Selesai")', { timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotDir}/07_cbt_player_desktop.png` });
    console.log("✓ Screenshot 07: CBT Player Desktop tersimpan");

    // --------------------------------------------------------------------------
    // 8. PILIH JAWABAN & AUTOSAVE
    // --------------------------------------------------------------------------
    console.log("[8/10] Menjawab butir soal pilihan ganda (do-while loop)...");
    const choiceBtn = await page.waitForSelector('button:has-text("do-while loop")', {
      timeout: 5000,
    });
    await choiceBtn.click();
    await page.waitForTimeout(1500); // Autosave wait

    // --------------------------------------------------------------------------
    // 9. RESPONSIVE MOBILE VIEW (390x844)
    // --------------------------------------------------------------------------
    console.log("[9/10] Menguji Responsivitas Mobile (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${screenshotDir}/09_cbt_player_mobile.png` });
    console.log("✓ Screenshot 09: CBT Player Mobile tersimpan");

    // Kembalikan viewport ke desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(800);

    // --------------------------------------------------------------------------
    // 10. SIMULASI INTEGRITY WARNING & SUBMIT UJIAN
    // --------------------------------------------------------------------------
    console.log("[10/10] Simulasi Pelanggaran Integritas (Strike 1) & Menyelesaikan Ujian CBT...");
    await page.evaluate(() => {
      window.dispatchEvent(new Event("blur"));
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/08_cbt_anti_cheat_warning_strike.png` });
    console.log("✓ Screenshot 08: Anti-Cheat Warning Strike tersimpan");

    const continueBtn = await page.$('button:has-text("Saya Mengerti & Kembali ke Layar Penuh")');
    if (continueBtn) {
      await continueBtn.click();
      await page.waitForTimeout(800);
    }

    const finishBtn = await page.waitForSelector(
      'button:has-text("Selesai"), button:has-text("Selesaikan Ujian Sekarang")',
      { timeout: 5000 }
    );
    await finishBtn.click();
    await page.waitForTimeout(1000);

    const confirmBtn = await page.waitForSelector('button:has-text("Ya, Kumpulkan Sekarang")', {
      timeout: 5000,
    });
    await confirmBtn.click();
    await page.waitForTimeout(4000);

    await page.screenshot({ path: `${screenshotDir}/10_cbt_layar_selesai.png` });
    console.log("✓ Screenshot 10: Layar Selesai CBT tersimpan");

    console.log(
      "\n================================================================================"
    );
    console.log("SELURUH PENGUJIAN VISUAL & SCREENSHOT PHASE 14 SELESAI DENGAN SUKSES!");
    console.log(`Direktori Bukti: ${screenshotDir}`);
    console.log(
      "================================================================================\n"
    );
  } catch (error) {
    console.error("Gagal saat menjalankan pengujian visual:", error);
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main();
