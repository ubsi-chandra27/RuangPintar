import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { generateUlid } from "@/shared/lib/ulid";
import { subscriptionService } from "@/modules/billing/application/subscription-service";

describe("SubscriptionService (M23)", () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = generateUlid();
    const schoolId = generateUlid();

    await prisma.sekolah.create({
      data: {
        id: schoolId,
        nama: "SMA Uji Coba Billing",
        npsn: `99${Date.now().toString().slice(-6)}`,
        jenjang: "SMA",
      },
    });

    await prisma.pengguna.create({
      data: {
        id: testUserId,
        sekolah_id: schoolId,
        username: `guru_${Date.now()}`,
        email: `guru_${Date.now()}@example.com`,
        password_hash: "hash",
        nama_lengkap: "Guru Pengetes Billing",
        peran_dasar: "TEACHER",
        tipe_lisensi: "FREEMIUM",
        trial_berakhir_pada: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 hari lagi
      },
    });
  });

  it("harus berhasil membuat pesanan Pro dengan status PENDING dan nominal Rp 15.000", async () => {
    const order = await subscriptionService.createProOrder(testUserId, 1);

    expect(order.order_id).toContain("RP-PRO-");
    expect(order.nominal).toBe(15000);
    expect(order.total_bayar).toBe(15000);
    expect(order.status).toBe("PENDING");
    expect(order.metode_pembayaran).toBe("QRIS");

    const savedInDb = await prisma.transaksiLangganan.findUnique({
      where: { order_id: order.order_id },
    });
    expect(savedInDb).not.toBeNull();
    expect(savedInDb?.status).toBe("PENDING");
  });

  it("harus memperbarui lisensi pengguna menjadi PRO saat simulasi pembayaran berhasil", async () => {
    const order = await subscriptionService.createProOrder(testUserId, 1);
    const completed = await subscriptionService.simulatePaymentSuccess(order.order_id, testUserId);

    expect(completed.status).toBe("PAID");
    expect(completed.dibayar_pada).toBeDefined();

    const user = await prisma.pengguna.findUnique({
      where: { id: testUserId },
    });

    expect(user?.tipe_lisensi).toBe("PRO");
    expect(user?.trial_berakhir_pada).toBeDefined();
    // Masa aktif harus bertambah setidaknya 30 hari
    const remainingDays = Math.ceil(
      ((user?.trial_berakhir_pada?.getTime() || 0) - Date.now()) / (1000 * 60 * 60 * 24)
    );
    expect(remainingDays).toBeGreaterThan(25);
  });
});
