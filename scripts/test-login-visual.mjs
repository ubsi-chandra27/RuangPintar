import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();

  // 1. Exact user display resolution (1794 x 889)
  const contextUser = await browser.newContext({
    viewport: { width: 1794, height: 889 },
  });
  const pageUser = await contextUser.newPage();
  await pageUser.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await pageUser.screenshot({
    path: "docs/phases/screenshots/login-gradasi-user-res.png",
    fullPage: false,
  });
  console.log("Captured login-gradasi-user-res.png (1794x889)");
  await contextUser.close();

  // 2. Full HD Desktop (1920 x 1080)
  const contextDesktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await pageDesktop.screenshot({
    path: "docs/phases/screenshots/login-gradasi-desktop-1080p.png",
    fullPage: false,
  });
  console.log("Captured login-gradasi-desktop-1080p.png (1920x1080)");
  await contextDesktop.close();

  // 3. Mobile (390 x 844)
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await pageMobile.screenshot({
    path: "docs/phases/screenshots/login-gradasi-mobile.png",
    fullPage: false,
  });
  console.log("Captured login-gradasi-mobile.png (390x844)");
  await contextMobile.close();

  await browser.close();
  console.log("All visual tests complete!");
}

run().catch((e) => {
  console.error("Error capturing screenshots:", e);
  process.exit(1);
});
