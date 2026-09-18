import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();
  const context1 = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page1 = await context1.newPage();

  // Test 1: Login with username 'wardahulfa'
  console.log("Testing login with username: wardahulfa...");
  await page1.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page1.fill('input[name="username"]', "wardahulfa");
  await page1.fill('input[name="password"]', "Password123#");
  await page1.click('button[type="submit"]');
  await page1.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Login with username SUCCESS! Current URL:", page1.url());

  await page1.screenshot({ path: "docs/phases/screenshots/wardah-dashboard.png" });
  console.log("Captured docs/phases/screenshots/wardah-dashboard.png");

  // Test 2: Login with email 'wardah.ulfah@smapgri1kotabekasi.sch.id'
  const context2 = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page2 = await context2.newPage();
  console.log("\nTesting login with email: wardah.ulfah@smapgri1kotabekasi.sch.id...");
  await page2.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page2.fill('input[name="username"]', "wardah.ulfah@smapgri1kotabekasi.sch.id");
  await page2.fill('input[name="password"]', "Password123#");
  await page2.click('button[type="submit"]');
  await page2.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Login with email SUCCESS! Current URL:", page2.url());

  await browser.close();
  console.log("\nALL WARDAH LOGIN TESTS PASSED 100%!");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
