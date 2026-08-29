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
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ruang Pintar");
    expect(screen.getByText("School Digital Operating Platform")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /masuk ke halaman login/i })).toBeInTheDocument();
  });

  it("renders LoginPage visual elements and form correctly", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Masuk ke Ruang Pintar");
    expect(screen.getByLabelText("Username", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /masuk/i })).toBeInTheDocument();
  });

  it("renders ForgotPasswordPage guidance correctly", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Lupa Kata Sandi?");
    expect(screen.getByText(/Administrator \/ Operator Sekolah/i)).toBeInTheDocument();
  });
});
