import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });

  // 1. Capture Login Page (Desktop & Android)
  console.log("Capturing Login Page on Desktop...");
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktopCtx.newPage();
  await page.goto("http://localhost:3000/login", { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "docs/phases/screenshots/fixed-login-desktop.png",
    fullPage: false,
  });

  console.log("Capturing Login Page on Android (360x800)...");
  const androidCtx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });
  const androidPage = await androidCtx.newPage();
  await androidPage.goto("http://localhost:3000/login", { waitUntil: "load" });
  await androidPage.waitForTimeout(1000);
  await androidPage.screenshot({
    path: "docs/phases/screenshots/fixed-login-mobile.png",
    fullPage: false,
  });

  // 2. Login as Super Admin on Desktop and capture dashboard & dropdowns
  console.log("Logging in as Super Admin...");
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1500);

  console.log("Capturing Dashboard (gap widened, stat icons removed, compact searchbar)...");
  await page.screenshot({
    path: "docs/phases/screenshots/fixed-dashboard-desktop.png",
    fullPage: false,
  });

  // 3. Open Notification Dropdown
  console.log("Opening Notification dropdown...");
  await page.click('button[aria-label="Pemberitahuan Sistem"]');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: "docs/phases/screenshots/fixed-notification-open.png",
    fullPage: false,
  });

  // Close Notification and Open User Menu
  await page.click('body', { position: { x: 50, y: 50 } });
  await page.waitForTimeout(400);

  console.log("Opening User Menu dropdown...");
  await page.click('button[aria-label="Menu Pengguna"]');
  await page.waitForTimeout(600);
  await page.screenshot({
    path: "docs/phases/screenshots/fixed-user-menu-open.png",
    fullPage: false,
  });

  // 4. Android Dashboard (Verify Topbar doesn't clip profile)
  console.log("Logging in as Super Admin on Android...");
  await androidPage.fill('input[name="username"]', "superadmin");
  await androidPage.fill('input[name="password"]', "Password123#");
  await androidPage.click('button[type="submit"]');
  await androidPage.waitForURL("**/dashboard", { timeout: 15000 });
  await androidPage.waitForTimeout(1500);

  console.log("Capturing Android Topbar & Dashboard (no profile clipping)...");
  await androidPage.screenshot({
    path: "docs/phases/screenshots/fixed-topbar-android.png",
    fullPage: false,
  });

  await browser.close();
  console.log("All verification screenshots captured successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
