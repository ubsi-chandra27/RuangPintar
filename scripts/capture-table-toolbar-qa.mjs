import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.resolve("docs/phases/screenshots/table-toolbar");
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

  console.log("2. Capturing /data-siswa toolbar...");
  await page.goto("http://localhost:3000/data-siswa", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "01-data-siswa-toolbar.png"), fullPage: false });

  console.log("3. Capturing /data-siswa filter popover...");
  await page.click('button:has-text("Filter")');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outDir, "02-data-siswa-filter-open.png"),
    fullPage: false,
  });

  console.log("4. Capturing /guru-pengajaran toolbar...");
  await page.goto("http://localhost:3000/guru-pengajaran", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "03-data-guru-toolbar.png"), fullPage: false });

  console.log("5. Capturing /data-siswa mobile view...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/data-siswa", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "04-data-siswa-mobile.png"), fullPage: false });

  await browser.close();
  console.log("✓ All table toolbar screenshots captured successfully!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
