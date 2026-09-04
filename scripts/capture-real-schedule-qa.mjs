import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const outputDir = path.resolve("docs/phases/screenshots/phase-10-real-data");
fs.mkdirSync(outputDir, { recursive: true });

async function login(page, username, password) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await login(page, "superadmin", "Password123#");

  await page.goto(`${baseUrl}/jadwal-sekolah`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page
    .locator("option:checked")
    .filter({ hasText: "Jadwal Pelajaran 2026/2027 - 19 Agustus 2026" })
    .waitFor({ state: "attached" });
  await page.screenshot({
    path: path.join(outputDir, "01-desktop-jadwal-riil.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(outputDir, "02-mobile-jadwal-riil.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/guru-pengajaran`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Wali Kelas/i }).click();
  await page.getByText("21", { exact: true }).first().waitFor();
  await page.screenshot({
    path: path.join(outputDir, "03-desktop-wali-kelas-riil.png"),
    fullPage: true,
  });

  await context.clearCookies();
  await page.setViewportSize({ width: 768, height: 1024 });
  await login(page, "guru_budi", "Password123#");
  await page.getByText("Eri Chandra A", { exact: false }).first().waitFor();
  await page.screenshot({
    path: path.join(outputDir, "04-tablet-dashboard-guru-riil.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${baseUrl}/jadwal-saya`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^SENIN/ }).click();
  await page.getByText("Koding dan Kecerdasan Artifisial", { exact: false }).first().waitFor();
  await page.screenshot({
    path: path.join(outputDir, "05-tablet-landscape-jadwal-guru-riil.png"),
    fullPage: true,
  });

  await browser.close();
  if (pageErrors.length) throw new Error(`Page errors: ${pageErrors.join(" | ")}`);
  console.log(`Visual QA PASS - 5 screenshot tersimpan di ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
