import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from "@/app/page";

describe("Smoke Test — Project Baseline", () => {
  it("renders Ruang Pintar baseline page without error", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ruang Pintar");
    expect(screen.getByText("Project baseline aktif.")).toBeInTheDocument();
  });
});
