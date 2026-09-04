import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Find Eri Chandra or teacher account
  const eriGuru = await prisma.guru.findFirst({
    where: { nama_lengkap: { contains: "Eri Chandra" } },
    include: { pengguna: true },
  });

  let username = "superadmin";
  if (eriGuru && eriGuru.pengguna) {
    username = eriGuru.pengguna.username;
    console.log("Found Eri Chandra account:", username);
    // Ensure password is Password123#
    const hash = await bcrypt.hash("Password123#", 10);
    await prisma.pengguna.update({
      where: { id: eriGuru.pengguna.id },
      data: { password_hash: hash, status_akun: "AKTIF" },
    });
  } else {
    console.log("Eri Chandra user not found, using superadmin or guru_budi");
  }

  const browser = await chromium.launch({ headless: true });
  // iPhone 14 Pro mobile viewport
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log("Logging in as", username);
  await page.goto("http://localhost:3000/login", { waitUntil: "load" });
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Capture /kelas-saya on mobile
  console.log("Capturing /kelas-saya mobile...");
  await page.goto("http://localhost:3000/kelas-saya", { waitUntil: "load" });
  await page.waitForTimeout(1500);

  const artifactDir =
    "C:/Users/vitam/.gemini/antigravity-cli/brain/1c0aa492-265d-4521-a6dd-84bd4969e7c0";
  await page.screenshot({
    path: `${artifactDir}/mobile_kelas_saya_viewport.png`,
    fullPage: false,
  });

  await page.screenshot({
    path: `${artifactDir}/mobile_kelas_saya_fullpage.png`,
    fullPage: true,
  });

  // Click notification bell on mobile
  const notifBtn = await page.$('button[aria-label="Pemberitahuan Sistem"]');
  if (notifBtn) {
    await notifBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${artifactDir}/mobile_notification_popover.png`,
      fullPage: false,
    });
    // Click outside to close
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  // Open first class workspace
  const firstWorkspaceLink = await page.$('a[href^="/kelas-saya/"]');
  if (firstWorkspaceLink) {
    const href = await firstWorkspaceLink.getAttribute("href");
    console.log("Navigating to first workspace:", href);
    await page.goto(`http://localhost:3000${href}`, { waitUntil: "load" });
    await page.waitForTimeout(1500);

    // 1. Tab Ringkasan
    await page.screenshot({
      path: `${artifactDir}/mobile_workspace_tab_ringkasan.png`,
      fullPage: false,
    });

    // 2. Tab Lingkup Materi
    const babTab = await page.$('button:has-text("Lingkup Materi & TP")');
    if (babTab) {
      await babTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `${artifactDir}/mobile_workspace_tab_bab.png`,
        fullPage: false,
      });
    }

    // 3. Tab Jurnal KBM
    const jurnalTab = await page.$('button:has-text("Jurnal KBM")');
    if (jurnalTab) {
      await jurnalTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `${artifactDir}/mobile_workspace_tab_jurnal.png`,
        fullPage: false,
      });
    }
  }

  // Tablet View Capture (iPad: 820x1180)
  console.log("Capturing Tablet view...");
  const tabletContext = await browser.newContext({
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto("http://localhost:3000/login", { waitUntil: "load" });
  await tabletPage.fill('input[name="username"]', username);
  await tabletPage.fill('input[name="password"]', "Password123#");
  await tabletPage.click('button[type="submit"]');
  await tabletPage.waitForURL("**/dashboard", { timeout: 15000 });
  await tabletPage.waitForTimeout(1000);

  await tabletPage.goto("http://localhost:3000/kelas-saya", { waitUntil: "load" });
  await tabletPage.waitForTimeout(1500);
  await tabletPage.screenshot({
    path: `${artifactDir}/tablet_kelas_saya_viewport.png`,
    fullPage: false,
  });

  // Capture workspace on tablet portrait
  const firstTabletWorkspace = await tabletPage.$('a[href^="/kelas-saya/"]');
  if (firstTabletWorkspace) {
    const href = await firstTabletWorkspace.getAttribute("href");
    await tabletPage.goto(`http://localhost:3000${href}`, { waitUntil: "load" });
    await tabletPage.waitForTimeout(1500);
    await tabletPage.screenshot({
      path: `${artifactDir}/tablet_workspace_viewport.png`,
      fullPage: false,
    });
  }

  // Tablet Landscape (iPad Landscape: 1024x768)
  console.log("Capturing iPad Landscape view...");
  const ipadLandscapeContext = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const ipadLandscapePage = await ipadLandscapeContext.newPage();
  await ipadLandscapePage.goto("http://localhost:3000/login", { waitUntil: "load" });
  await ipadLandscapePage.fill('input[name="username"]', username);
  await ipadLandscapePage.fill('input[name="password"]', "Password123#");
  await ipadLandscapePage.click('button[type="submit"]');
  await ipadLandscapePage.waitForURL("**/dashboard", { timeout: 15000 });
  await ipadLandscapePage.waitForTimeout(1000);

  if (firstTabletWorkspace) {
    const href = await firstTabletWorkspace.getAttribute("href");
    await ipadLandscapePage.goto(`http://localhost:3000${href}`, { waitUntil: "load" });
    await ipadLandscapePage.waitForTimeout(1500);

    // Click Penilaian tab like in user's screenshot
    const penilaianBtn = await ipadLandscapePage.$('button:has-text("Penilaian")');
    if (penilaianBtn) {
      await penilaianBtn.click();
      await ipadLandscapePage.waitForTimeout(800);
    }

    await ipadLandscapePage.screenshot({
      path: `${artifactDir}/ipad_landscape_workspace_penilaian.png`,
      fullPage: false,
    });
  }

  await browser.close();
  console.log("Done taking all screenshots!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
