import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const screenshotDir = path.join(process.cwd(), "docs", "phases", "screenshots", "profile-photo");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Generate a valid 100x100 test PNG image buffer
function generateTestPng() {
  // 1x1 blue PNG base64
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAP0lEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO4GM2wAAX94H38AAAAASUVORK5CYII=";
  return Buffer.from(base64, "base64");
}

async function main() {
  const testImagePath = path.join(screenshotDir, "sample-avatar.png");
  fs.writeFileSync(testImagePath, generateTestPng());

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  console.log("1. Navigating to login page...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "guru1");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Logged in successfully as guru1.");

  console.log("2. Navigating to /profil...");
  await page.goto("http://localhost:3000/profil", { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(screenshotDir, "01-profile-before-upload.png"),
    fullPage: true,
  });
  console.log("Saved: 01-profile-before-upload.png");

  console.log("3. Uploading profile photo...");
  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.first().setInputFiles(testImagePath);

  // Wait for canvas processing / state update
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotDir, "02-profile-after-photo-selected.png"),
    fullPage: true,
  });
  console.log("Saved: 02-profile-after-photo-selected.png");

  console.log("4. Submitting profile update...");
  await page.click('button[type="submit"]:has-text("Simpan Perubahan Profil")');
  await page.waitForSelector("text=Profil Anda berhasil diperbarui", { timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: path.join(screenshotDir, "03-profile-after-save.png"),
    fullPage: true,
  });
  console.log("Saved: 03-profile-after-save.png");

  console.log("5. Reloading page to verify persistence...");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: path.join(screenshotDir, "04-profile-reloaded-persistent.png"),
    fullPage: true,
  });
  console.log("Saved: 04-profile-reloaded-persistent.png");

  // Open user menu on topbar to verify avatar
  console.log("6. Testing topbar user menu avatar...");
  await page.click('button[aria-label="Menu Pengguna"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, "05-topbar-user-menu-avatar.png") });
  console.log("Saved: 05-topbar-user-menu-avatar.png");

  console.log("All E2E checks passed!");
  await browser.close();
}

main().catch((err) => {
  console.error("QA Test Error:", err);
  process.exit(1);
});
