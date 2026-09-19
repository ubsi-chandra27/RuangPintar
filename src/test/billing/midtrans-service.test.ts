import { describe, it, expect } from "vitest";
import { MidtransService } from "@/modules/billing/infrastructure/midtrans-service";
import crypto from "crypto";

describe("MidtransService (M23)", () => {
  it("harus beralih ke simulator jika MIDTRANS_SERVER_KEY belum dikonfigurasi", async () => {
    const service = new MidtransService();
    const result = await service.createTransaction({
      order_id: "TEST-ORDER-001",
      gross_amount: 15000,
      item_name: "Paket Guru Pro",
      customer_name: "Pak Guru Budi",
    });

    expect(result.is_simulator).toBe(true);
    expect(result.token).toContain("SNAP-SIM-");
    expect(result.redirect_url).toContain("TEST-ORDER-001");
  });

  it("harus memvalidasi signature SHA-512 dengan tepat dalam mode terkonfigurasi", () => {
    const originalKey = process.env.MIDTRANS_SERVER_KEY;
    process.env.MIDTRANS_SERVER_KEY = "SB-Mid-server-TESTKEY123";

    try {
      const service = new MidtransService();
      const orderId = "ORDER-12345";
      const statusCode = "200";
      const grossAmount = "15000.00";
      const serverKey = "SB-Mid-server-TESTKEY123";

      const validSignature = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");

      const isValid = service.verifySignature({
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: validSignature,
        transaction_status: "settlement",
      });

      expect(isValid).toBe(true);

      const isInvalid = service.verifySignature({
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: "invalid-signature-hash",
        transaction_status: "settlement",
      });

      expect(isInvalid).toBe(false);
    } finally {
      process.env.MIDTRANS_SERVER_KEY = originalKey;
    }
  });
});
