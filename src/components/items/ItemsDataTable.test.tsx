import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ItemListResponse } from "@/lib/types";

const replace = vi.fn();
const fetchItems = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "u1",
      email: "editor@example.com",
      role: "editor",
      created_at: "2024-01-01T00:00:00Z",
    },
    accessToken: "token",
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    canEdit: true,
    canAdmin: false,
  }),
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  fetchItems: (...args: unknown[]) => fetchItems(...args),
  bulkAction: vi.fn(),
  createItem: vi.fn(),
  deleteItem: vi.fn(),
  downloadExport: vi.fn(),
  seedItems: vi.fn(),
  updateItem: vi.fn(),
  updateItemStatus: vi.fn(),
}));

import { ItemsDataTable } from "@/components/items/ItemsDataTable";

const samplePage: ItemListResponse = {
  data: [
    {
      id: "item-1",
      name: "Oak Desk",
      sku: "DESK-1",
      category: "home",
      status: "active",
      price: 199,
      quantity: 4,
      description: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "item-2",
      name: "Cotton Tee",
      sku: "TEE-2",
      category: "clothing",
      status: "draft",
      price: 25,
      quantity: 12,
      description: null,
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    },
  ],
  meta: { page: 1, page_size: 10, total: 42, total_pages: 5 },
};

describe("ItemsDataTable", () => {
  beforeEach(() => {
    fetchItems.mockReset();
    replace.mockReset();
    fetchItems.mockResolvedValue(samplePage);

    if (typeof globalThis.ResizeObserver === "undefined") {
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;
    }
  });

  it("renders rows, selects a row, and select-all matching count", async () => {
    const user = userEvent.setup();
    render(<ItemsDataTable />);

    await waitFor(() => {
      expect(screen.getByText("Oak Desk")).toBeInTheDocument();
    });
    expect(screen.getByText("Cotton Tee")).toBeInTheDocument();
    expect(screen.getByText(/42 records/i)).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /select oak desk/i }));
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /select all 42 matching/i }),
    );
    expect(
      screen.getByText("42 matching records selected"),
    ).toBeInTheDocument();

    const table = screen.getByRole("table", { name: /items/i });
    expect(within(table).getByText("Oak Desk")).toBeInTheDocument();
  });
});
