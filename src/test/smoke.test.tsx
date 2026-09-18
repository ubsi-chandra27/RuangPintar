import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "@/app/page";
import LoginPage from "@/app/login/page";
import ForgotPasswordPage from "@/app/forgot-password/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Smoke Test — Project Baseline & Auth Views", () => {
  it("renders HomePage baseline for unauthenticated visitor", async () => {
    const Component = await HomePage();
    render(Component);
    expect(screen.getAllByText("Ruang Pintar")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/School Digital Platform/i)[0]).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /masuk akun/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /coba gratis 30 hari/i })[0]).toBeInTheDocument();
  });

  it("renders LoginPage visual elements and form correctly", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Masuk ke Ruang Pintar");
    expect(screen.getByLabelText(/username/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /masuk/i })).toBeInTheDocument();
  });

  it("renders ForgotPasswordPage guidance correctly", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Lupa Kata Sandi?");
    expect(screen.getByText(/Administrator \/ Operator Sekolah/i)).toBeInTheDocument();
  });
});
