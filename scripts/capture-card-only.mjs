import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "guru_parlindungan_siadari");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1500);

  const card = page.locator("div.relative.overflow-hidden.shrink-0").first();
  const box = await card.boundingBox();
  console.log("Card Utama BoundingBox:", box);
  await card.screenshot({ path: "docs/phases/screenshots/card-utama-cropped.png" });
  console.log("Card cropped screenshot saved to docs/phases/screenshots/card-utama-cropped.png");
  await browser.close();
}

main();
