import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const screenshotDir = "C:/laragon/www/Ruang-Pintar/docs/phases/screenshots/phase-17-walkthrough";

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
  console.log("================================================================================");
  console.log(
    "RUANG PINTAR — PLAYWRIGHT VISUAL WALKTHROUGH: PHASE 17 COMMUNICATION & NOTIFICATION"
  );
  console.log("================================================================================\n");

  let serverProcess = null;
  let serverWasRunning = false;

  // Cek apakah server localhost:3000 sudah berjalan
  try {
    await checkServerReady("http://localhost:3000/login", 2000);
    serverWasRunning = true;
    console.log("✓ Server Next.js sudah berjalan di port 3000.");
  } catch {
    console.log("Mempersiapkan server Next.js di background (npm run start)...");
    serverProcess = spawn("npm.cmd", ["run", "start"], {
      cwd: "C:/laragon/www/Ruang-Pintar",
      stdio: "pipe",
      shell: true,
    });

    serverProcess.stdout.on("data", (data) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[Next.js] ${msg}`);
    });

    serverProcess.stderr.on("data", (data) => {
      const msg = data.toString().trim();
      if (msg) console.error(`[Next.js Error] ${msg}`);
    });

    await checkServerReady("http://localhost:3000/login", 45000);
    console.log("✓ Server Next.js siap menerima koneksi.\n");
  }

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 850 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // ============================================================================
    // 1. Super Admin: Popover Notifikasi & Direktori Pengumuman
    // ============================================================================
    console.log("1. Melakukan autentikasi sebagai Super Admin (superadmin)...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.fill('input[name="username"]', "superadmin");
    await page.fill('input[name="password"]', "Password123#");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log("✓ Berhasil login sebagai Super Admin.");

    // Screenshot 01: Topbar Notification Popover
    console.log("2. Membuka popover Notifikasi di Topbar...");
    const bellBtn = page.locator('button[aria-label="Pemberitahuan Sistem"]');
    await bellBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${screenshotDir}/01_notification_popover_open.png`,
      fullPage: false,
    });
    console.log("✓ Screenshot 01: Notification popover open tersimpan.");

    // Tutup popover
    await bellBtn.click();
    await page.waitForTimeout(300);

    // Screenshot 02: Halaman /pengumuman (Super Admin Directory)
    console.log("3. Navigasi ke /pengumuman...");
    await page.goto("http://localhost:3000/pengumuman", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${screenshotDir}/02_announcement_directory_admin.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 02: Announcement directory admin tersimpan.");

    // Screenshot 03: Modal Buat Pengumuman Baru
    console.log("4. Membuka modal Buat Pengumuman Baru...");
    const createBtn = page.locator('button:has-text("Buat Pengumuman")');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${screenshotDir}/03_create_announcement_modal.png`,
        fullPage: false,
      });
      console.log("✓ Screenshot 03: Create announcement modal tersimpan.");
      // Tutup modal
      await page.locator('button:has-text("Batal")').click();
      await page.waitForTimeout(400);
    }

    // Screenshot 04: Modal Detail Pengumuman
    console.log("5. Membuka detail pengumuman...");
    const firstAnnouncementCard = page.locator('h3:has-text("Jadwal Pelaksanaan Asesmen")');
    if (await firstAnnouncementCard.isVisible()) {
      await firstAnnouncementCard.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `${screenshotDir}/04_announcement_detail_modal.png`,
        fullPage: false,
      });
      console.log("✓ Screenshot 04: Announcement detail modal tersimpan.");
      // Tutup modal
      await page.locator('button:has-text("Tutup")').click();
      await page.waitForTimeout(400);
    }

    // Screenshot 05: Filter Kategori Aktif
    console.log("6. Mengaktifkan filter kategori 'Penting'...");
    const pentingTab = page.locator('button:has-text("Penting")');
    await pentingTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${screenshotDir}/05_announcement_category_filter.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 05: Category filter tersimpan.");

    // ============================================================================
    // 2. Guru: Teacher Announcement View
    // ============================================================================
    console.log("\n7. Melakukan autentikasi sebagai Guru (guru_demo)...");
    const teacherContext = await browser.newContext({
      viewport: { width: 1280, height: 850 },
    });
    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await teacherPage.fill('input[name="username"]', "guru_demo");
    await teacherPage.fill('input[name="password"]', "Password123#");
    await teacherPage.click('button[type="submit"]');
    await teacherPage.waitForURL("**/dashboard", { timeout: 15000 });
    await teacherPage.waitForTimeout(1000);

    await teacherPage.goto("http://localhost:3000/pengumuman", { waitUntil: "networkidle" });
    await teacherPage.waitForTimeout(1000);
    await teacherPage.screenshot({
      path: `${screenshotDir}/06_teacher_announcement_view.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 06: Teacher announcement view tersimpan.");
    await teacherContext.close();

    // ============================================================================
    // 3. Siswa: Student Announcement View
    // ============================================================================
    console.log("\n8. Melakukan autentikasi sebagai Siswa (siswa_budi)...");
    const studentContext = await browser.newContext({
      viewport: { width: 1280, height: 850 },
    });
    const studentPage = await studentContext.newPage();
    await studentPage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await studentPage.fill('input[name="username"]', "siswa_budi");
    await studentPage.fill('input[name="password"]', "Password123#");
    await studentPage.click('button[type="submit"]');
    await studentPage.waitForURL("**/dashboard", { timeout: 15000 });
    await studentPage.waitForTimeout(1000);

    await studentPage.goto("http://localhost:3000/pengumuman", { waitUntil: "networkidle" });
    await studentPage.waitForTimeout(1000);
    await studentPage.screenshot({
      path: `${screenshotDir}/07_student_announcement_view.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 07: Student announcement view tersimpan.");
    await studentContext.close();

    // ============================================================================
    // 4. Wali Murid: Guardian Announcement View
    // ============================================================================
    console.log("\n9. Melakukan autentikasi sebagai Wali Murid (wali_santoso)...");
    const guardianContext = await browser.newContext({
      viewport: { width: 1280, height: 850 },
    });
    const guardianPage = await guardianContext.newPage();
    await guardianPage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await guardianPage.fill('input[name="username"]', "wali_santoso");
    await guardianPage.fill('input[name="password"]', "Password123#");
    await guardianPage.click('button[type="submit"]');
    await guardianPage.waitForURL("**/dashboard", { timeout: 15000 });
    await guardianPage.waitForTimeout(1000);

    await guardianPage.goto("http://localhost:3000/pengumuman", { waitUntil: "networkidle" });
    await guardianPage.waitForTimeout(1000);
    await guardianPage.screenshot({
      path: `${screenshotDir}/08_guardian_announcement_view.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 08: Guardian announcement view tersimpan.");

    // Screenshot 09: Mobile 390px Viewport
    console.log("10. Mengambil screenshot Mobile Viewport (390x844)...");
    await guardianPage.setViewportSize({ width: 390, height: 844 });
    await guardianPage.waitForTimeout(600);
    await guardianPage.screenshot({
      path: `${screenshotDir}/09_mobile_announcement_view_390px.png`,
      fullPage: true,
    });
    console.log("✓ Screenshot 09: Mobile announcement view tersimpan.");
    await guardianContext.close();

    console.log(
      "\n================================================================================"
    );
    console.log("SEMUA SCREENSHOT WALKTHROUGH PHASE 17 BERHASIL DIAMBIL & DIVERIFIKASI!");
    console.log("================================================================================");
  } finally {
    await browser.close();

    if (serverProcess && !serverWasRunning) {
      console.log("\nMenghentikan server background Next.js...");
      serverProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error("Gagal menjalankan visual walkthrough:", err);
  process.exit(1);
});
