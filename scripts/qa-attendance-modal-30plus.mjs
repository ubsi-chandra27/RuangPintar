import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("1. Navigating to login page...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "guru_budi");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Logged in successfully as guru_budi.");

  console.log("2. Navigating to /sesi-pembelajaran...");
  await page.goto("http://localhost:3000/sesi-pembelajaran", { waitUntil: "networkidle" });

  // Switch to Tab Presensi Kelas if present
  const tabPresensi = page.locator('button:has-text("Presensi Kelas")');
  if ((await tabPresensi.count()) > 0) {
    await tabPresensi.first().click();
    await page.waitForTimeout(500);
  }

  // Click on Presensi button to open modal
  const presensiButton = page.locator('button:has-text("Presensi")').first();
  if ((await presensiButton.count()) > 0) {
    await presensiButton.click();
    await page.waitForTimeout(1000);
    console.log("Modal opened.");

    // Screenshot 1: Table View (Default Dense Academic Sheet)
    await page.screenshot({
      path: "docs/phases/screenshots/attendance/01-modal-attendance-table-view.png",
    });
    console.log("Captured 01-modal-attendance-table-view.png");

    // Screenshot 2: Switch to Grid View
    const gridViewBtn = page.locator('button:has-text("Kartu Grid")');
    if ((await gridViewBtn.count()) > 0) {
      await gridViewBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: "docs/phases/screenshots/attendance/02-modal-attendance-grid-view.png",
      });
      console.log("Captured 02-modal-attendance-grid-view.png");
    }

    // Switch back to Table View
    const tableViewBtn = page.locator('button:has-text("Tabel Kompak")');
    if ((await tableViewBtn.count()) > 0) {
      await tableViewBtn.click();
      await page.waitForTimeout(300);
    }

    // Screenshot 3: Fullscreen Focus Mode
    const fullscreenBtn = page.locator('button[title*="Layar Penuh"]');
    if ((await fullscreenBtn.count()) > 0) {
      await fullscreenBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: "docs/phases/screenshots/attendance/03-modal-attendance-fullscreen.png",
      });
      console.log("Captured 03-modal-attendance-fullscreen.png");
    }
  }

  await browser.close();
  console.log("Attendance QA script finished.");
}

main().catch(console.error);
