import { chromium } from "playwright";

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Login as Super Admin
  console.log("Logging in as Super Admin...");
  await page.goto("http://localhost:3000/login", { waitUntil: "load" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1000);

  // 2. Capture Kalender Akademik
  console.log("Capturing Kalender Akademik...");
  await page.goto("http://localhost:3000/kalender-akademik", { waitUntil: "load" });
  await page.waitForSelector("h1", { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "C:/Users/vitam/.gemini/antigravity-cli/brain/5c203a37-e73c-4b09-8a80-1d188533023a/phase10_kalender_akademik.png",
    fullPage: false,
  });

  // 3. Capture Master Jadwal Sekolah
  console.log("Capturing Master Jadwal Sekolah...");
  await page.goto("http://localhost:3000/jadwal-sekolah", { waitUntil: "load" });
  await page.waitForSelector("h1", { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "C:/Users/vitam/.gemini/antigravity-cli/brain/5c203a37-e73c-4b09-8a80-1d188533023a/phase10_jadwal_sekolah.png",
    fullPage: false,
  });

  // 4. Capture Sesi Pembelajaran
  console.log("Capturing Sesi Pembelajaran...");
  await page.goto("http://localhost:3000/sesi-pembelajaran", { waitUntil: "load" });
  await page.waitForSelector("h1", { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "C:/Users/vitam/.gemini/antigravity-cli/brain/5c203a37-e73c-4b09-8a80-1d188533023a/phase10_sesi_pembelajaran.png",
    fullPage: false,
  });

  // 5. Capture Jadwal Saya as Teacher
  console.log("Logging in as Teacher (Budi Santoso)...");
  await context.clearCookies();
  await page.goto("http://localhost:3000/login", { waitUntil: "load" });
  await page.fill('input[name="username"]', "guru_budi");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1000);

  console.log("Capturing Teacher Dashboard with Real Schedule...");
  await page.screenshot({
    path: "C:/Users/vitam/.gemini/antigravity-cli/brain/5c203a37-e73c-4b09-8a80-1d188533023a/phase10_teacher_dashboard.png",
    fullPage: false,
  });

  console.log("Capturing Jadwal Saya...");
  await page.goto("http://localhost:3000/jadwal-saya", { waitUntil: "load" });
  await page.waitForSelector("h1", { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "C:/Users/vitam/.gemini/antigravity-cli/brain/5c203a37-e73c-4b09-8a80-1d188533023a/phase10_jadwal_saya.png",
    fullPage: false,
  });

  await browser.close();
  console.log("All Phase 10 visual QA screenshots captured successfully inside AcademicShell!");
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
