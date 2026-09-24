import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Ensure tests always run against dedicated test database, never touching development
process.env.DATABASE_URL = "file:./data/ruang-pintar-test.db";

// Mock next/navigation for client components
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
