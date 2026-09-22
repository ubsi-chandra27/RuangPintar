import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/app/actions/smart-onboarding-actions", () => ({
  getTeacherTrialStatusAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      is_trial: true,
      tipe_lisensi: "FREEMIUM",
      days_remaining: 30,
      max_rombel: 5,
      current_rombel_count: 0,
      can_create_rombel: true,
      is_expired: false,
    },
  }),
  processClassPhotoAction: vi.fn(),
  confirmClassCreationAction: vi.fn(),
}));

import { TrialBanner } from "@/modules/ai-assistant/presentation/trial-banner";

describe("Onboarding guru mandiri", () => {
  it("membuka modal Foto Absen AI saat event aksi foto dipicu", async () => {
    render(<TrialBanner />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent("open-ai-photo-modal"));
    });

    await waitFor(() => {
      expect(screen.getByText("Buat Kelas Otomatis via Foto AI")).toBeInTheDocument();
    });
  });
});
