import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { ulid } from "ulidx";
import crypto from "crypto";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.pengguna.findUnique({
    where: { username: "guru_chandra" },
  });

  if (!user) {
    console.error("guru_chandra not found");
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const sessionId = ulid();

  await prisma.sesiPengguna.create({
    data: {
      id: sessionId,
      pengguna_id: user.id,
      token_hash: tokenHash,
      berlaku_sampai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ip_address: "127.0.0.1",
      user_agent: "Playwright Verification",
    },
  });

  const browser = await chromium.launch();

  // 1. Desktop View
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    await context.addCookies([
      {
        name: "ruang_pintar_session",
        value: rawToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await context.newPage();
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const outDesktop = path.resolve("docs/phases/screenshots/guru-chandra-dashboard-revised.png");
    await page.screenshot({ path: outDesktop, fullPage: false });
    console.log("Desktop screenshot saved to:", outDesktop);

    // Click "Buat Rombel Manual" to open the modal
    const btn = page.locator('button:has-text("Buat Rombel Manual")').first();
    await btn.click();
    await page.waitForTimeout(600);

    const outModal = path.resolve("docs/phases/screenshots/guru-chandra-modal-manual-class.png");
    await page.screenshot({ path: outModal, fullPage: false });
    console.log("Modal screenshot saved to:", outModal);

    await context.close();
  }

  // 2. Mobile View (iPhone 14 / standard 390x844)
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await context.addCookies([
      {
        name: "ruang_pintar_session",
        value: rawToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    const page = await context.newPage();
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
    const card = page.locator("text=Inisialisasi Rombel Belajar").first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const outMobile = path.resolve("docs/phases/screenshots/guru-chandra-dashboard-mobile.png");
    await page.screenshot({ path: outMobile, fullPage: false });
    console.log("Mobile screenshot saved to:", outMobile);

    await context.close();
  }

  await browser.close();
  await prisma.$disconnect();
}

main().catch(console.error);
