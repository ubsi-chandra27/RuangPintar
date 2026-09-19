import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import path from "path";
import { spawn } from "child_process";

const screenshotDir =
  "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/camply-landing-walkthrough";

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

function checkServerReady(url, timeoutMs = 15000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve(true);
        } else {
          setTimeout(check, 500);
        }
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error("Timeout waiting for server to start at " + url));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

async function main() {
  console.log("=== CAPTURING CAMPLY MAP & FEATURES QA SCREENSHOTS ===");

  const appUrl = "http://localhost:3000";
  let devServer = null;

  try {
    await checkServerReady(appUrl, 3000);
    console.log("Dev server sudah aktif di http://localhost:3000");
  } catch {
    console.log("Menjalankan dev server port 3000...");
    devServer = spawn("npm.cmd", ["run", "dev"], {
      cwd: "C:/laragon/www/Ruang-Pintar",
      stdio: "pipe",
      shell: true,
    });
    await checkServerReady(appUrl, 35000);
    console.log("Dev server siap.");
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Context (1440x960)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });
  const page = await desktopContext.newPage();

  try {
    console.log("Loading landing page...");
    await page.goto(`${appUrl}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // 1. Fitur Section (Top view showing heading and 3D icons)
    console.log("Capturing #fitur with navbar offset...");
    await page.evaluate(() => {
      const el = document.querySelector("#fitur");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 85;
        window.scrollTo({ top, behavior: "instant" });
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "qa-01-features-trio.png"),
    });

    // 2. Open World Map Section with Dotted Halftone & Pins
    console.log("Capturing Open World Map with Pins...");
    await page.evaluate(() => {
      const el = document.querySelector("#fitur");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + 180;
        window.scrollTo({ top, behavior: "instant" });
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "qa-02-open-world-map.png"),
    });

    // 3. Seamless Transition between Map and Testimoni
    console.log("Capturing seamless transition between map and testimonials...");
    await page.evaluate(() => {
      const el = document.querySelector("#fitur");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + 520;
        window.scrollTo({ top, behavior: "instant" });
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "qa-04-map-to-testimonial-flow.png"),
    });

    // 4. Testimonials Section
    console.log("Capturing #testimoni...");
    await page.evaluate(() => {
      const el = document.querySelector("#testimoni");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 85;
        window.scrollTo({ top, behavior: "instant" });
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "qa-03-testimonials.png"),
    });

    // 5. Mobile Viewport (390x844)
    console.log("Capturing mobile views...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${appUrl}/`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(2000);

    // Mobile Features
    await mobilePage.evaluate(() => {
      const el = document.querySelector("#fitur");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: "instant" });
      }
    });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "qa-05-mobile-features.png"),
    });

    // Mobile Map
    await mobilePage.evaluate(() => {
      const el = document.querySelector("#fitur");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + 450;
        window.scrollTo({ top, behavior: "instant" });
      }
    });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "qa-06-mobile-map.png"),
    });

    // Mobile Testimonials
    await mobilePage.evaluate(() => {
      const el = document.querySelector("#testimoni");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: "instant" });
      }
    });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "qa-07-mobile-testimonials.png"),
    });

    console.log("=== ALL QA SCREENSHOTS CAPTURED SUCCESSFULLY! ===");
  } finally {
    await browser.close();
    if (devServer) {
      devServer.kill();
    }
  }
}

main().catch((err) => {
  console.error("QA Capture error:", err);
  process.exit(1);
});
