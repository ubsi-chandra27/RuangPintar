import { chromium } from "playwright";
import fs from "fs";

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Capture Desktop 1920x1080 (User Monitor Size)
  {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    console.log("Navigasi ke login (Desktop 1920x1080)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "guru_parlindungan_siadari");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Collapse sidebar if toggle button exists
    const toggleBtn = page.locator('button[aria-label="Ciutkan Sidebar"]');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(500);
    }

    const screenshotPath = "docs/phases/screenshots/teacher-dashboard-1920x1080.png";
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log("Screenshot Desktop 1920x1080 disimpan ke:", screenshotPath);

    // Click the 3-dots ellipsis button to test the action menu
    const ellipsisBtn = page.locator('button[aria-label="Menu Aksi Sesi"]');
    if (await ellipsisBtn.isVisible()) {
      await ellipsisBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: "docs/phases/screenshots/teacher-dashboard-dropdown-open.png",
      });
      console.log("Screenshot Dropdown Action Menu disimpan!");
    }

    await context.close();
  }

  // 2. Capture Mobile (iPhone 12/13/14 standard 390x844)
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    console.log("Navigasi ke login (Mobile)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "guru_parlindungan_siadari");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(2000);

    const screenshotPath = "docs/phases/screenshots/teacher-dashboard-mobile.png";
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log("Screenshot Mobile disimpan ke:", screenshotPath);

    // Scroll container or window
    await page.evaluate(() => {
      const scrollable =
        document.querySelector("main") || document.documentElement || document.body;
      scrollable.scrollTop = 550;
      window.scrollTo(0, 550);
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: "docs/phases/screenshots/teacher-dashboard-mobile-scroll1.png" });

    await page.evaluate(() => {
      const scrollable =
        document.querySelector("main") || document.documentElement || document.body;
      scrollable.scrollTop = 1200;
      window.scrollTo(0, 1200);
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: "docs/phases/screenshots/teacher-dashboard-mobile-scroll2.png" });

    await context.close();
  }

  await browser.close();
}

capture().catch((err) => {
  console.error("Gagal capture:", err);
  process.exit(1);
});
