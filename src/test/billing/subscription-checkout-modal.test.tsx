import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionCheckoutModal } from "@/modules/billing/presentation/subscription-checkout-modal";

vi.mock("@/app/actions/billing-actions", () => ({
  initiateProCheckoutAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: "TRANS-01",
      order_id: "RP-PRO-20260918-TEST99",
      pengguna_id: "USER-01",
      paket: "GURU_PRO_BULANAN",
      nominal: 15000,
      biaya_admin: 0,
      total_bayar: 15000,
      metode_pembayaran: "QRIS",
      status: "PENDING",
      waktu_transaksi: new Date(),
      durasi_bulan: 1,
      is_simulator: true,
    },
  }),
  checkOrderStatusAction: vi.fn().mockResolvedValue({
    success: true,
    data: { status: "PENDING" },
  }),
  simulatePaymentSuccessAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: "TRANS-01",
      order_id: "RP-PRO-20260918-TEST99",
      status: "PAID",
      nominal: 15000,
      total_bayar: 15000,
    },
  }),
}));

describe("SubscriptionCheckoutModal Component (M23)", () => {
  it("tidak boleh merender apapun jika isOpen bernilai false", () => {
    const { container } = render(<SubscriptionCheckoutModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("harus merender modal QRIS, order ID dan rincian harga Rp 15.000 saat isOpen true", async () => {
    render(<SubscriptionCheckoutModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Pembayaran Paket Guru Pro")).toBeInTheDocument();
    expect(screen.getByText(/Otomatis via QRIS/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("RP-PRO-20260918-TEST99")).toBeInTheDocument();
      expect(screen.getAllByText("Rp 15.000").length).toBeGreaterThan(0);
      expect(screen.getByText(/Mode Pengujian & Demonstrasi SaaS/i)).toBeInTheDocument();
    });
  });

  it("harus merender tombol simulasi pembayaran sukses pada mode simulator", async () => {
    render(<SubscriptionCheckoutModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      const simulateBtn = screen.getByText(/Simulasi Bayar QRIS Sukses/i);
      expect(simulateBtn).toBeInTheDocument();
    });
  });
});
