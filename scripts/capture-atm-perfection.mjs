import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = path.resolve("docs/phases/screenshots/atm-perfection-walkthrough");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop View (1440x960)
  const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await pageDesktop.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await pageDesktop.waitForTimeout(1000);
  await pageDesktop.screenshot({ path: path.join(outDir, "01-desktop-hero-seamless.png") });

  // 1b. Desktop Scrolled View
  await pageDesktop.evaluate(() => window.scrollBy(0, 400));
  await pageDesktop.waitForTimeout(500);
  await pageDesktop.screenshot({ path: path.join(outDir, "02-desktop-scrolled-sticky.png") });

  // 1c. Desktop Features & Pricing View
  const fiturSec = await pageDesktop.$("#fitur");
  if (fiturSec) {
    await fiturSec.scrollIntoViewIfNeeded();
    await pageDesktop.waitForTimeout(500);
    await pageDesktop.screenshot({ path: path.join(outDir, "03-desktop-features-6-pillars.png") });
  }

  const biayaSec = await pageDesktop.$("#biaya");
  if (biayaSec) {
    await biayaSec.scrollIntoViewIfNeeded();
    await pageDesktop.waitForTimeout(500);
    await pageDesktop.screenshot({ path: path.join(outDir, "04-desktop-pricing-15jt.png") });
  }

  // 2. iPad Portrait View (820x1180)
  const pageTablet = await browser.newPage({ viewport: { width: 820, height: 1180 } });
  await pageTablet.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await pageTablet.waitForTimeout(1000);
  await pageTablet.screenshot({ path: path.join(outDir, "05-ipad-portrait-hero.png") });

  // 3. Mobile View (390x844 iPhone)
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await pageMobile.waitForTimeout(1000);
  await pageMobile.screenshot({ path: path.join(outDir, "06-iphone-mobile-hero.png") });

  // Open mobile menu
  const menuBtn = await pageMobile.$("button[aria-label='Buka Menu Navigasi']");
  if (menuBtn) {
    await menuBtn.click();
    await pageMobile.waitForTimeout(500);
    await pageMobile.screenshot({ path: path.join(outDir, "07-iphone-mobile-drawer.png") });
  }

  await browser.close();
  console.log("All ATM perfection walkthrough screenshots captured successfully in:", outDir);
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
