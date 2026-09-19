import { chromium } from "playwright";
import path from "path";

const artifactDir = "C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c";
const appUrl = "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440x960
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(appUrl, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);

  const desktopHeroPath = path.join(artifactDir, "desktop_large_mockup_live.png");
  await desktopPage.screenshot({ path: desktopHeroPath });
  console.log("Saved Desktop Hero:", desktopHeroPath);

  // 2. Mobile 390x844 (iPhone 14)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(appUrl, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);

  const mobileTopPath = path.join(artifactDir, "mobile_large_mockup_top.png");
  await mobilePage.screenshot({ path: mobileTopPath });
  console.log("Saved Mobile Top:", mobileTopPath);

  // Mobile scroll to mockup
  await mobilePage.evaluate(() => window.scrollBy(0, 320));
  await mobilePage.waitForTimeout(600);
  const mobileScrolledPath = path.join(artifactDir, "mobile_large_mockup_scrolled.png");
  await mobilePage.screenshot({ path: mobileScrolledPath });
  console.log("Saved Mobile Scrolled:", mobileScrolledPath);

  await browser.close();
  console.log("Done capture!");
}

run().catch(console.error);
