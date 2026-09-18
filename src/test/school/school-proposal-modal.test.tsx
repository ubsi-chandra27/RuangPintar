import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SchoolProposalModal } from "@/modules/school/presentation/school-proposal-modal";

describe("SchoolProposalModal Component", () => {
  it("tidak boleh merender apapun jika isOpen bernilai false", () => {
    const { container } = render(<SchoolProposalModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("harus merender KOP proposal, nama sekolah dan perincian dana BOS saat isOpen bernilai true", () => {
    render(
      <SchoolProposalModal
        isOpen={true}
        onClose={vi.fn()}
        namaSekolah="SMK Negeri 1 Contoh"
        namaPengusul="Pak Guru Budi"
      />
    );

    expect(
      screen.getByText("Dokumen Usulan Pengadaan Lisensi Sekolah (Dana BOS)")
    ).toBeInTheDocument();
    expect(screen.getByText("RUANG PINTAR EDUTECH INDONESIA")).toBeInTheDocument();
    expect(screen.getAllByText("SMK Negeri 1 Contoh")[0]).toBeInTheDocument();
    expect(screen.getByText(/Pak Guru Budi/i)).toBeInTheDocument();
    expect(screen.getByText(/Skema Pembiayaan & Kepatuhan SPJ Dana BOS/i)).toBeInTheDocument();
  });

  it("harus memanggil window.print() ketika tombol cetak diklik", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(
      <SchoolProposalModal isOpen={true} onClose={vi.fn()} namaSekolah="SMA PGRI 1 Kota Bekasi" />
    );

    const printButtons = screen.getAllByRole("button", { name: /cetak/i });
    fireEvent.click(printButtons[0]);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it("harus memanggil onClose ketika tombol tutup (X) diklik", () => {
    const onCloseMock = vi.fn();
    render(<SchoolProposalModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByTitle("Tutup");
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
