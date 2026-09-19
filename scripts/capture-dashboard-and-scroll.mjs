import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const brainDir = "C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c";

async function main() {
  console.log("=== CAPTURE DASHBOARD SUPER ADMIN & LANDING SCROLL MOTION ===");
  const browser = await chromium.launch({ headless: true });
  
  // 1. Landing Page with Scroll Motion Animations
  const landingContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const landingPage = await landingContext.newPage();
  
  console.log("Loading landing page...");
  await landingPage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await landingPage.waitForTimeout(1000);
  
  // Capture Top
  await landingPage.screenshot({
    path: path.join(brainDir, "landing_scroll_top.png"),
    fullPage: false,
  });
  console.log("Saved: landing_scroll_top.png");

  // Scroll down 1500px to trigger progress bar, floating scroll-to-top, and revealed elements
  await landingPage.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
  await landingPage.waitForTimeout(1000);
  await landingPage.screenshot({
    path: path.join(brainDir, "landing_scroll_mid.png"),
    fullPage: false,
  });
  console.log("Saved: landing_scroll_mid.png");

  // Scroll down to Testimonials & Community
  await landingPage.evaluate(() => window.scrollTo({ top: 3200, behavior: "instant" }));
  await landingPage.waitForTimeout(1000);
  await landingPage.screenshot({
    path: path.join(brainDir, "landing_scroll_testimonials.png"),
    fullPage: false,
  });
  console.log("Saved: landing_scroll_testimonials.png");

  await landingContext.close();

  // 2. Dashboard Super Admin (Behance LMS Style)
  const dashboardContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1.5,
  });
  const page = await dashboardContext.newPage();

  console.log("Logging in as Super Admin...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Capture Dashboard Overview (Top section: Metrics, Top Courses, Concentric Rings, Recent Activity)
  await page.screenshot({
    path: path.join(brainDir, "super_admin_dashboard_top.png"),
    fullPage: false,
  });
  console.log("Saved: super_admin_dashboard_top.png");

  // Scroll main element down to view Important Alerts & Dual Wave Chart
  await page.locator("main").evaluate((el) => el.scrollTo({ top: 550, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(brainDir, "super_admin_dashboard_mid.png"),
    fullPage: false,
  });
  console.log("Saved: super_admin_dashboard_mid.png");

  // Scroll main element to bottom to view Dual Wave Chart & Sekolah Terbaru table
  await page.locator("main").evaluate((el) => el.scrollTo({ top: 1200, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(brainDir, "super_admin_dashboard_bottom.png"),
    fullPage: false,
  });
  console.log("Saved: super_admin_dashboard_bottom.png");

  await dashboardContext.close();
  await browser.close();
  console.log("=== ALL SCREENSHOTS CAPTURED SUCCESSFULLY ===");
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
