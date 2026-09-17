import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots";

function checkServerReady(url, timeoutMs = 20000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) resolve(true);
        else setTimeout(check, 500);
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeoutMs) reject(new Error("Timeout"));
        else setTimeout(check, 500);
      });
    };
    check();
  });
}

async function main() {
  let serverProcess = null;
  try {
    await checkServerReady("http://localhost:3000/login", 1500);
  } catch {
    serverProcess = spawn("npm.cmd", ["run", "start"], {
      cwd: "C:/laragon/www/Ruang-Pintar",
      stdio: "ignore",
      shell: true,
      detached: true,
    });
    serverProcess.unref();
    await checkServerReady("http://localhost:3000/login", 30000);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "id-ID",
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: `${screenshotDir}/superadmin-dashboard-view.png`,
  });

  await browser.close();
  console.log("SUPERADMIN_DASHBOARD_CAPTURED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
