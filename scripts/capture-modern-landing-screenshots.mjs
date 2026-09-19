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

function checkServerReady(url, timeoutMs = 30000) {
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
  console.log("=== MEMULAI CAPTURE VISUAL LANDING PAGE INSPIRASI CAMPLY ===");

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

  // 1. Desktop Context (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });
  const page = await desktopContext.newPage();

  try {
    // 1. Hero & Navbar at top
    console.log("1. Mengambil screenshot Hero & Navbar (posisi awal)...");
    await page.goto(`${appUrl}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, "01-landing-hero-and-navbar-top.png"),
      fullPage: false,
    });

    // 2. Scroll Down: Verifikasi Sticky Header tetap ada + Blue Stats Ribbon & Features
    console.log("2. Scroll ke bawah dan verifikasi Sticky Header tetap aktif...");
    await page.evaluate(() => window.scrollTo({ top: 750, behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "02-landing-scrolled-sticky-navbar.png"),
      fullPage: false,
    });

    // 3. Peta Jangkauan & Quick Role Selector
    console.log("3. Mengambil screenshot Peta Jangkauan & Role Selector...");
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "03-landing-interactive-map-and-role-finder.png"),
      fullPage: false,
    });

    // 4. Komunitas & Ekosistem Orbit
    console.log("4. Mengambil screenshot Komunitas & Ekosistem Orbit...");
    await page.evaluate(() => window.scrollTo({ top: 2300, behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "04-landing-community-and-orbit-ecosystem.png"),
      fullPage: false,
    });

    // 5. Testimonial Slider & Question / FAQ Card
    console.log("5. Mengambil screenshot Testimonial & Question Card...");
    await page.evaluate(() => window.scrollTo({ top: 3100, behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "05-landing-testimonials-and-faq-card.png"),
      fullPage: false,
    });

    // 6. Lisensi & Biaya + Royal Blue Footer
    console.log("6. Mengambil screenshot Lisensi & Biaya serta Royal Blue Footer...");
    await page.evaluate(() => window.scrollTo({ top: 4100, behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(screenshotDir, "06-landing-pricing-and-royal-blue-footer.png"),
      fullPage: false,
    });

    // 7. Mobile Viewport (390x844 iPhone 14)
    console.log("7. Mengambil screenshot responsif Mobile (390x844)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${appUrl}/`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "07-landing-mobile-viewport-390px.png"),
      fullPage: false,
    });

    // 8. Mobile Scrolled Sticky Header
    await mobilePage.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "08-landing-mobile-scrolled-sticky.png"),
      fullPage: false,
    });

    console.log("=== SEMUA SCREENSHOT LANDING PAGE BERHASIL DIAMBIL! ===");
  } finally {
    await browser.close();
    if (devServer) {
      devServer.kill();
    }
  }
}

main().catch((err) => {
  console.error("Error visual screenshot capture:", err);
  process.exit(1);
});
