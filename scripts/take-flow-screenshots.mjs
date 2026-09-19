import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const targetDir = path.resolve("docs/phases/screenshots");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch();

  const pages = [
    { url: "http://localhost:3000/forgot-password", name: "flow-01-forgot-password" },
    { url: "http://localhost:3000/ganti-password", name: "flow-02-ganti-password" },
    { url: "http://localhost:3000/register", name: "flow-03-register" },
    { url: "http://localhost:3000/onboarding/pilih-avatar", name: "flow-04-pilih-avatar" },
    {
      url: "http://localhost:3000/onboarding/selesai?avatar=kapten-kosmik",
      name: "flow-05-selesai",
    },
    { url: "http://localhost:3000/login?reset=success", name: "flow-06-login-reset-success" },
  ];

  // 1. Mobile Android viewport (360 x 800)
  const mobileContext = await browser.newContext({
    viewport: { width: 360, height: 800 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileContext.newPage();

  for (const item of pages) {
    await mobilePage.goto(item.url, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(500);
    const savePath = path.join(targetDir, `${item.name}-mobile.png`);
    await mobilePage.screenshot({ path: savePath, fullPage: true });
    console.log(`Saved mobile: ${savePath}`);
  }
  await mobileContext.close();

  // 2. Desktop viewport (1280 x 800)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopContext.newPage();

  for (const item of pages) {
    await desktopPage.goto(item.url, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(500);
    const savePath = path.join(targetDir, `${item.name}-desktop.png`);
    await desktopPage.screenshot({ path: savePath });
    console.log(`Saved desktop: ${savePath}`);
  }
  await desktopContext.close();

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
