import { chromium } from "playwright";
import path from "path";

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const isDarkClassPresent = await page.evaluate(() => {
    return document.documentElement.classList.contains("dark");
  });
  console.log("document.documentElement contains 'dark'?:", isDarkClassPresent);

  const savePath = path.resolve("C:/Users/vitam/.gemini/antigravity-cli/brain/651c150a-16e4-4324-8459-56cbd481e84c/landing_light_verified.png");
  await page.screenshot({ path: savePath });
  console.log("Saved screenshot:", savePath);

  await context.close();
  await browser.close();
}

run().catch(console.error);
