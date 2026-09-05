import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const targetDirs = [
  "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-14-enhancements",
  "C:/Users/vitam/.gemini/antigravity-cli/brain/f69c38c0-29d6-4fd6-a7e5-a3e07c98d119/screenshots",
];

targetDirs.forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

async function saveScreenshot(page, filename, options = {}) {
  for (const dir of targetDirs) {
    const fullPath = path.join(dir, filename);
    await page.screenshot({ path: fullPath, ...options });
    console.log(`Saved screenshot: ${fullPath}`);
  }
}

async function main() {
  console.log("=== RUANG PINTAR: CAPTURING VISUAL QA SCREENSHOTS ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // 1. Login
    console.log("1. Logging in as guru_budi...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "guru_budi");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 20000 });

    // 2. Capture A4 Print: Naskah Soal
    console.log("2. Navigating to A4 Print View (/cbt/cetak/01M1PMVKP7HKCBHPPBYFGR0XXA)...");
    await page.goto("http://localhost:3000/cbt/cetak/01M1PMVKP7HKCBHPPBYFGR0XXA", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1500);
    await saveScreenshot(page, "01_cetak_a4_naskah_soal.png");

    // 3. Switch to Lembar Jawab (LJM)
    console.log("3. Switching to Lembar Jawab Siswa (LJM)...");
    const ljmBtn = page.locator('button:has-text("Lembar Jawab (LJM)")').first();
    if (await ljmBtn.isVisible()) {
      await ljmBtn.click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, "02_cetak_a4_ljm_siswa.png");
    }

    // 4. Switch to Kunci Jawaban Guru
    console.log("4. Switching to Kunci Jawaban & Rubrik Guru...");
    const kunciBtn = page.locator('button:has-text("Kunci Jawaban Guru")').first();
    if (await kunciBtn.isVisible()) {
      await kunciBtn.click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, "03_cetak_a4_kunci_guru.png");
    }

    // 5. Navigate to Asisten AI Guru Studio (/asisten-ai)
    console.log("5. Navigating to Asisten AI Guru (/asisten-ai)...");
    await page.goto("http://localhost:3000/asisten-ai", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await saveScreenshot(page, "04_asisten_ai_paket_soal.png");

    // 6. Asisten AI - Generate Sample Soal
    console.log("6. Generating sample AI paket soal...");
    const topikInput = page.locator('input[placeholder*="Perangkat Keras"]').first();
    if (await topikInput.isVisible()) {
      await topikInput.fill("Arsitektur Komputer, Gerbang Logika & Jaringan Dasar");
      const genBtn = page.locator('button:has-text("Buat Paket Soal Otomatis")').first();
      if (await genBtn.isVisible()) {
        await genBtn.click();
        await page.waitForTimeout(2000);
        await saveScreenshot(page, "05_asisten_ai_paket_soal_hasil.png");
      }
    }

    // 7. Asisten AI - Tab 2: Modul Ajar / RPP
    console.log("7. Switching to Asisten AI Tab: Modul Ajar & RPP...");
    const rppTab = page.locator('button:has-text("Modul Ajar & RPP")').first();
    if (await rppTab.isVisible()) {
      await rppTab.click();
      await page.waitForTimeout(1000);

      const rppInput = page.locator('input[placeholder*="Algoritma Pencarian"]').first();
      if (await rppInput.isVisible()) {
        await rppInput.fill("Konsep Berpikir Komputasional dan Pemrograman Dasar");
        const rppGenBtn = page.locator('button:has-text("Buat Modul Ajar")').first();
        if (await rppGenBtn.isVisible()) {
          await rppGenBtn.click();
          await page.waitForTimeout(2000);
        }
      }
      await saveScreenshot(page, "06_asisten_ai_modul_rpp.png");
    }

    // 8. Asisten AI - Tab 4: Pengaturan Model & Gemini 2.0
    console.log("8. Switching to Asisten AI Tab: Pengaturan Model Gemini 2.0...");
    const settingsTab = page.locator('button:has-text("Pengaturan Model & API")').first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, "07_asisten_ai_settings_gemini.png");
    }

    // 9. CBT Class Page - Bank Soal Multi-type Import Preview
    console.log("9. Navigating to Kelas CBT & Opening Multi-type Import Tab...");
    const penugasanId = "01M19MV9BYJTTFTR1Z02JE8AEV";
    await page.goto(`http://localhost:3000/kelas-saya/${penugasanId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);

    const cbtTabButton = await page.waitForSelector('button[data-tab="CBT"]', {
      timeout: 10000,
    });
    await cbtTabButton.click();
    await page.waitForTimeout(1500);

    const bankSoalBtn = page.locator('button:has-text("Bank Soal")').first();
    if (await bankSoalBtn.isVisible()) {
      await bankSoalBtn.click();
      await page.waitForTimeout(1200);

      const excelTab = page.locator('button:has-text("Import Excel / CSV")').first();
      if (await excelTab.isVisible()) {
        await excelTab.click();
        await page.waitForTimeout(800);

        const sampleMultiType = `[BAGIAN A: PILIHAN GANDA]
No\tSoal\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tPilihan E\tTingkat Kesulitan\tJawaban Benar
1\tOrganel respirasi sel penghasil ATP?\tMitokondria\tKloroplas\tLisosom\tVakuola\tSentriol\tC2\tA
2\tPengendali seluruh kegiatan metabolisme sel?\tSitoplasma\tNukleus\tRibosom\tDinding Sel\tGolgi\tC1\tB

[BAGIAN B: MENJODOHKAN]
No\tPremis (Pertanyaan)\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tPilihan E\tTingkat Kesulitan\tTarget Jawaban
1\tMitokondria\t\t\t\t\t\tC2\tRespirasi Sel & ATP
2\tKloroplas\t\t\t\t\t\tC2\tFotosintesis & Klorofil

[BAGIAN C: ESSAY]
No\tSoal Uraian\tPilihan A\tPilihan B\tPilihan C\tPilihan D\tPilihan E\tTingkat Kesulitan\tRubrik / Kunci Jawaban
1\tJelaskan perbedaan sel prokariotik dan eukariotik!\t\t\t\t\t\tC4\tMembran inti, organel membran`;

        const textarea = page.locator("textarea").first();
        if (await textarea.isVisible()) {
          await textarea.fill(sampleMultiType);
          await page.waitForTimeout(600);
        }
        await saveScreenshot(page, "08_bank_soal_multi_type_import.png");

        const previewBtn = page.locator('button:has-text("Pratinjau Data Soal")').first();
        if (await previewBtn.isVisible()) {
          await previewBtn.click();
          await page.waitForTimeout(1000);
          await saveScreenshot(page, "09_bank_soal_multi_type_table.png");
        }
      }
    }

    console.log("=== VISUAL QA SCREENSHOT CAPTURE COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("Error during visual QA:", err);
  } finally {
    await browser.close();
  }
}

main();
