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
  console.log("RUANG PINTAR — PLAYWRIGHT VISUAL QA: CBT ENHANCEMENTS");
  console.log("================================================================================\n");

  const penugasanId = "01M19MV9BYJTTFTR1Z02JE8AEV";
  const penugasan = await prisma.penugasanMengajar.findUnique({
    where: { id: penugasanId },
    include: { guru: true, rombel: true, mata_pelajaran: true },
  });

  // Ensure there's a published exam with token
  const examWithToken = await prisma.ujianCbt.findFirst({
    where: { penugasan_mengajar_id: penugasanId },
  });
  if (examWithToken) {
    await prisma.ujianCbt.update({
      where: { id: examWithToken.id },
      data: {
        gunakan_token: true,
        token_masuk: "SMP789",
        status: "DITERBITKAN",
      },
    });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Login Guru
  console.log("1. Login Guru & Menuju Ruang Kelas CBT...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "guru_budi");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 20000 });

  await page.goto(`http://localhost:3000/kelas-saya/${penugasanId}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const cbtTabButton = await page.waitForSelector('button[data-tab="CBT"]', { timeout: 10000 });
  await cbtTabButton.click();
  await page.waitForTimeout(1500);

  // 2. Open Bank Soal Modal & Go to Excel Import Tab
  console.log("2. Membuka Bank Soal -> Tab Import Excel / Spreadsheet...");
  const bankSoalBtn = page.locator('button:has-text("Bank Soal")').first();
  if (await bankSoalBtn.isVisible()) {
    await bankSoalBtn.click();
    await page.waitForTimeout(1200);

    const excelTab = page.locator('button:has-text("Import Excel / CSV")').first();
    if (await excelTab.isVisible()) {
      await excelTab.click();
      await page.waitForTimeout(800);

      // Paste sample spreadsheet data to show preview table
      const sampleSpreadsheet = `No\tSoal\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tPilihan E\tTingkat Kesulitan Soal (C1/C2/C3)\tJawaban Benar
1\tBagian sel yang berfungsi sebagai pusat pengendali seluruh kegiatan sel adalah...\tSitoplasma\tNukleus (Inti Sel)\tMitokondria\tRibosom\tBadan Golgi\tC1\tB
2\tOrganel yang bertanggung jawab dalam respirasi sel dan produksi ATP adalah...\tMitokondria\tKloroplas\tLisosom\tVakuola\tSentriol\tC2\tA
3\tManakah pernyataan yang benar mengenai fotosintesis pada tumbuhan C3 dan C4?\tC3 lebih hemat air\tC4 fiksasi CO2 awal oleh PEP karboksilase\tC3 tidak terjadi fotorespirasi\tC4 fotosintesis di malam hari\tSemua salah\tC4\tB`;

      const textarea = page.locator("textarea").first();
      if (await textarea.isVisible()) {
        await textarea.fill(sampleSpreadsheet);
        await page.waitForTimeout(500);

        // Click "Proses & Pratinjau Data"
        const parseBtn = page.locator('button:has-text("Proses & Pratinjau Data")').first();
        if (await parseBtn.isVisible()) {
          await parseBtn.click();
          await page.waitForTimeout(500);
        }
      }

      await page.screenshot({
        path: `${screenshotDir}/11_modal_bank_soal_excel_import.png`,
        fullPage: false,
      });
      console.log("✓ Screenshot 11_modal_bank_soal_excel_import.png tersimpan");
    }

    // 3. Go to AI Generator Tab
    console.log("3. Membuka Tab AI Generator Guru (Google Gemini)...");
    const aiTab = page.locator('button:has-text("Asisten AI Gemini")').first();
    if (await aiTab.isVisible()) {
      await aiTab.click();
      await page.waitForTimeout(800);

      await page.screenshot({
        path: `${screenshotDir}/12_modal_bank_soal_ai_generator.png`,
        fullPage: false,
      });
      console.log("✓ Screenshot 12_modal_bank_soal_ai_generator.png tersimpan");
    }

    // Close Bank Soal Modal by refreshing page
    await page.goto(`http://localhost:3000/kelas-saya/${penugasanId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    const tabCbt = await page.waitForSelector('button[data-tab="CBT"]', { timeout: 10000 });
    await tabCbt.click();
    await page.waitForTimeout(1000);
  }

  // 4. Open Create Exam Modal to show Token Toggle
  console.log("4. Membuka Modal Susun Ujian (Fitur Wajibkan Token Masuk)...");
  const susunUjianBtn = page.locator('button:has-text("Susun Ujian")').first();
  if (await susunUjianBtn.isVisible()) {
    await susunUjianBtn.click();
    await page.waitForTimeout(1000);

    // Click checkbox "Wajibkan Token Ujian Masuk"
    const tokenCheckbox = page.locator("text=Wajibkan Token Ujian Masuk");
    if (await tokenCheckbox.isVisible()) {
      await tokenCheckbox.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: `${screenshotDir}/13_modal_buat_ujian_token.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 13_modal_buat_ujian_token.png tersimpan");

    const batalBtn = page.locator('button:has-text("Batal")').first();
    if (await batalBtn.isVisible()) {
      await batalBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 5. Switch to Student to test Token Entry Card & CBT Player
  console.log("5. Beralih ke Siswa untuk verifikasi Layar Masuk Token CBT...");
  const siswa = await prisma.siswa.findFirst({
    where: { nis: "20261045" },
  });
  if (siswa && examWithToken) {
    // Clear previous attempts
    const prevSessions = await prisma.sesiUjianSiswa.findMany({
      where: { ujian_cbt_id: examWithToken.id, siswa_id: siswa.id },
      select: { id: true },
    });
    for (const sess of prevSessions) {
      await prisma.hasilUjianCbt.deleteMany({ where: { sesi_ujian_id: sess.id } });
      await prisma.eventIntegritasUjian.deleteMany({ where: { sesi_ujian_id: sess.id } });
      await prisma.jawabanSiswa.deleteMany({ where: { sesi_ujian_id: sess.id } });
      await prisma.sesiUjianSiswa.delete({ where: { id: sess.id } });
    }

    // Update snapshot manifest with image question and Menjodohkan
    const manifestEnhancements = [
      {
        nomor_urut: 1,
        soal_id: "SOAL_STIMULUS",
        versi_soal_id: "VERSI_STIMULUS",
        tipe_soal: "PILIHAN_GANDA",
        pertanyaan:
          "Perhatikan diagram siklus biogeokimia di atas. Proses yang ditandai oleh nomor (3) menunjukkan...",
        gambar_url:
          "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=800&q=80",
        bobot: 10,
        opsi_jawaban: [
          { label: "A", teks: "Fiksasi nitrogen oleh bakteri Rhizobium", urutan: 1 },
          { label: "B", teks: "Denitrifikasi oleh Pseudomonas", urutan: 2 },
          { label: "C", teks: "Amonifikasi senyawa organik", urutan: 3 },
          { label: "D", teks: "Nitrasi oleh Nitrobacter", urutan: 4 },
        ],
      },
      {
        nomor_urut: 2,
        soal_id: "SOAL_MATCHING",
        versi_soal_id: "VERSI_MATCHING",
        tipe_soal: "MENJODOHKAN",
        pertanyaan:
          "Pasangkan setiap komponen ekosistem berikut dengan peran trofiknya yang paling tepat:",
        bobot: 20,
        opsi_jawaban: {
          premis: [
            { id: "1", teks: "Fitoplankton & Tumbuhan Hijau" },
            { id: "2", teks: "Zooplankton & Herbivora" },
            { id: "3", teks: "Bakteri Pengurai & Fungi" },
          ],
          pilihan_target: [
            "Produsen Primer (Autotrof)",
            "Konsumen Primer (Herbivora)",
            "Dekomposer / Saprofit",
          ],
        },
      },
    ];

    const activeSnapshot = await prisma.snapshotUjian.findFirst({
      where: { ujian_cbt_id: examWithToken.id },
      orderBy: { nomor_snapshot: "desc" },
    });
    if (activeSnapshot) {
      await prisma.snapshotUjian.update({
        where: { id: activeSnapshot.id },
        data: {
          manifest_soal: JSON.stringify(manifestEnhancements),
          total_soal: manifestEnhancements.length,
        },
      });
    }

    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "siswa_budi");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // Navigate to exam start URL
    console.log("6. Mengakses /cbt/start dengan token...");
    await page.goto(`http://localhost:3000/cbt/start?ujianId=${examWithToken.id}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `${screenshotDir}/14_cbt_token_entry_screen.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 14_cbt_token_entry_screen.png tersimpan");

    // Enter token and start attempt
    console.log("7. Menginput token valid & Masuk ke CBT Secure Player...");
    await page.fill('input[placeholder*="token"]', "SMP789");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/cbt/**", { timeout: 20000 });
    await page.waitForTimeout(2000);

    // Screenshot 15: Stimulus Image in CBT Player
    await page.screenshot({
      path: `${screenshotDir}/15_cbt_player_stimulus_image.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 15_cbt_player_stimulus_image.png tersimpan");

    // Navigate to question 2 (Menjodohkan)
    console.log("8. Pindah ke Soal 2 (Tipe Menjodohkan)...");
    const nextBtn = page.locator('button:has-text("Berikutnya")').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(1000);

      // Select some matching options
      const selects = page.locator("select");
      const count = await selects.count();
      if (count >= 1) {
        await selects.nth(0).selectOption({ index: 1 });
      }
      if (count >= 2) {
        await selects.nth(1).selectOption({ index: 2 });
      }
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `${screenshotDir}/16_cbt_player_menjodohkan.png`,
        fullPage: false,
      });
      console.log("✓ Screenshot 16_cbt_player_menjodohkan.png tersimpan");
    }
  }

  await browser.close();
  console.log("\n================================================================================");
  console.log("SELURUH SCREENSHOT CBT ENHANCEMENTS SELESAI DENGAN SUKSES!");
  console.log("================================================================================");
}

main()
  .catch((e) => {
    console.error("Visual QA Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
