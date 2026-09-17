import { chromium } from "playwright";
import http from "http";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots";

function checkServerReady(url, timeoutMs = 15000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) resolve(true);
        else setTimeout(check, 500);
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeoutMs) reject(new Error("Timeout"));
        else setTimeout(check, 500);
      });
    };
    check();
  });
}

async function main() {
  await checkServerReady("http://localhost:3000/login");

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Context (1440x900)
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "id-ID",
  });
  const page = await desktopCtx.newPage();

  // Login as Super Admin
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  await page.waitForTimeout(600);

  // Switch explicitly to Mode Siang (Light Mode)
  const themeButton = page.locator('button[aria-label*="Pilih Mode Tampilan"]');
  await themeButton.click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${screenshotDir}/polish-theme-switcher-open.png`,
  });
  console.log("Captured polish-theme-switcher-open.png");

  // Select Mode Siang
  await page.click('button:has-text("Mode Siang")');
  await page.waitForTimeout(500);

  // Capture Desktop Light Mode
  await page.screenshot({
    path: `${screenshotDir}/polish-desktop-light.png`,
    fullPage: false,
  });
  console.log("Captured polish-desktop-light.png");

  // Switch explicitly to Mode Malam (Dark Mode)
  await themeButton.click();
  await page.waitForTimeout(300);
  await page.click('button:has-text("Mode Malam")');
  await page.waitForTimeout(500);

  // Capture Desktop Dark Mode
  await page.screenshot({
    path: `${screenshotDir}/polish-desktop-dark.png`,
    fullPage: false,
  });
  console.log("Captured polish-desktop-dark.png");

  // Open Signal Indicator popover
  const signalButton = page.locator('button[aria-label*="Status Operasional"]');
  await signalButton.click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${screenshotDir}/polish-signal-indicator-open.png`,
  });
  console.log("Captured polish-signal-indicator-open.png");

  // 2. Mobile Context (390x844 - iPhone standard)
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: "id-ID",
  });
  const mobilePage = await mobileCtx.newPage();

  // Login on Mobile
  await mobilePage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await mobilePage.fill('input[name="username"]', "superadmin");
  await mobilePage.fill('input[name="password"]', "Password123#");
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL("**/dashboard", { timeout: 10000 });
  await mobilePage.waitForTimeout(600);

  // Set Light Mode on Mobile
  const mobileThemeBtn = mobilePage.locator('button[aria-label*="Pilih Mode Tampilan"]');
  await mobileThemeBtn.click();
  await mobilePage.waitForTimeout(300);
  await mobilePage.click('button:has-text("Mode Siang")');
  await mobilePage.waitForTimeout(500);

  // Capture Mobile View (Light Mode)
  await mobilePage.screenshot({
    path: `${screenshotDir}/polish-mobile-light.png`,
    fullPage: false,
  });
  console.log("Captured polish-mobile-light.png");

  // Set Dark Mode on Mobile
  await mobileThemeBtn.click();
  await mobilePage.waitForTimeout(300);
  await mobilePage.click('button:has-text("Mode Malam")');
  await mobilePage.waitForTimeout(500);

  // Capture Mobile View (Dark Mode)
  await mobilePage.screenshot({
    path: `${screenshotDir}/polish-mobile-dark.png`,
    fullPage: false,
  });
  console.log("Captured polish-mobile-dark.png");

  await browser.close();
  console.log("ALL_POLISH_SCREENSHOTS_CAPTURED_SUCCESSFULLY");
}

main().catch((err) => {
  console.error("CAPTURE_ERROR:", err);
  process.exit(1);
});
