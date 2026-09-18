import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // 1. Go to login
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "Password123#");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Logged in successfully to:", page.url());

  // Capture Dashboard screenshot
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "docs/phases/screenshots/superadmin-clean-dashboard.png", fullPage: true });
  console.log("Saved dashboard screenshot.");

  // Test navigating to each menu
  const testMenus = [
    { name: "Pengumuman", path: "/pengumuman" },
    { name: "Sekolah & Lisensi", path: "/sekolah" },
    { name: "Guru & Pengguna SaaS", path: "/guru-pengajaran" },
    { name: "Struktur Kurikulum & Rombel", path: "/struktur-akademik" },
    { name: "Data Kesiswaan", path: "/data-siswa" },
    { name: "Jadwal Pelajaran", path: "/jadwal-sekolah" },
    { name: "Kalender Akademik", path: "/kalender-akademik" },
    { name: "Pusat Integrasi", path: "/integrasi" },
    { name: "CBT & Bank Ujian", path: "/cbt-ujian" },
    { name: "Laporan & Analitik", path: "/pimpinan" },
  ];

  console.log("\n=== TESTING SUPER ADMIN MENU NAVIGATION ===");
  for (const menu of testMenus) {
    await page.goto(`http://localhost:3000${menu.path}`, { waitUntil: "networkidle" });
    const currentUrl = page.url();
    const isRedirectedToDashboard = currentUrl.endsWith("/dashboard") && menu.path !== "/dashboard";
    console.log(`Menu [${menu.name}] -> Requested: ${menu.path} | Actual: ${currentUrl} | Status: ${isRedirectedToDashboard ? "BLOCKED/REDIRECTED TO DASHBOARD" : "SUCCESS (PAGE LOADED)"}`);
  }

  await browser.close();
}

run().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
