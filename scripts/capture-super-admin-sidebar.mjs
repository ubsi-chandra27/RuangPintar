import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Super Admin
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });
  const page = await desktopCtx.newPage();

  console.log("Logging in as Super Admin...");
  await page.goto("http://localhost:3000/login", { waitUntil: "load" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1500);

  console.log("Capturing Desktop Super Admin with clean Sidebar...");
  await page.screenshot({
    path: "docs/phases/screenshots/superadmin-sidebar-desktop.png",
    fullPage: false,
  });

  // 2. Mobile Super Admin Drawer
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const mobilePage = await mobileCtx.newPage();

  console.log("Logging in as Super Admin on Mobile...");
  await mobilePage.goto("http://localhost:3000/login", { waitUntil: "load" });
  await mobilePage.fill('input[name="username"]', "superadmin");
  await mobilePage.fill('input[name="password"]', "Password123#");
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL("**/dashboard", { timeout: 15000 });
  await mobilePage.waitForTimeout(1000);

  console.log("Opening Mobile Drawer...");
  // Click mobile drawer hamburger button
  await mobilePage.click('button[aria-label="Buka Menu Navigasi"]');
  await mobilePage.waitForTimeout(600);

  console.log("Capturing Mobile Drawer...");
  await mobilePage.screenshot({
    path: "docs/phases/screenshots/superadmin-sidebar-mobile-drawer.png",
    fullPage: false,
  });

  // 3. Login as Pak Eri Chandra (Guru) to confirm separation
  console.log("Logging in as Pak Eri Chandra (TEACHER)...");
  await desktopCtx.clearCookies();
  await page.goto("http://localhost:3000/login", { waitUntil: "load" });
  await page.fill('input[name="username"]', "erichandra");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1500);

  console.log("Capturing Teacher Sidebar...");
  await page.screenshot({
    path: "docs/phases/screenshots/teacher-sidebar-desktop.png",
    fullPage: false,
  });

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
