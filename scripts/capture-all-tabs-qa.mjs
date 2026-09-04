import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.resolve("docs/phases/screenshots/all-tabs");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("1. Logging in as superadmin...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10000 });

  // 1. Data Guru Tab
  console.log("2. Capturing Data Guru...");
  await page.goto("http://localhost:3000/guru-pengajaran", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "01-data-guru.png"), fullPage: false });

  // 2. Mata Pelajaran Tab
  console.log("3. Capturing Mata Pelajaran...");
  await page.click('button:has-text("Mata Pelajaran")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "02-mata-pelajaran.png"), fullPage: false });
  await page.click('button:has-text("Filter")');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, "02b-mata-pelajaran-filter-open.png"),
    fullPage: false,
  });
  await page.click('button:has-text("Filter")'); // close

  // 3. Penugasan Mengajar Tab
  console.log("4. Capturing Penugasan Mengajar...");
  await page.click('button:has-text("Penugasan Mengajar")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "03-penugasan-mengajar.png"), fullPage: false });
  await page.click('button:has-text("Sort")');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, "03b-penugasan-mengajar-sort-open.png"),
    fullPage: false,
  });
  await page.click('button:has-text("Sort")'); // close

  // 4. Wali Kelas Tab
  console.log("5. Capturing Wali Kelas...");
  await page.click('button:has-text("Wali Kelas")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "04-wali-kelas.png"), fullPage: false });
  await page.click('button:has-text("Filter")');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, "04b-wali-kelas-filter-open.png"),
    fullPage: false,
  });

  // 5. Data Siswa
  console.log("6. Capturing Data Siswa...");
  await page.goto("http://localhost:3000/data-siswa", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "05-data-siswa.png"), fullPage: false });

  // 6. Keikutsertaan Akademik
  console.log("7. Capturing Keikutsertaan Akademik...");
  await page.click('button:has-text("Keikutsertaan Akademik")');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, "06-keikutsertaan-akademik.png"),
    fullPage: false,
  });

  // 7. Penempatan Rombel
  console.log("8. Capturing Penempatan Rombel...");
  await page.click('button:has-text("Penempatan Rombel")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, "07-penempatan-rombel.png"), fullPage: false });

  await browser.close();
  console.log("✓ All tabs captured successfully!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
