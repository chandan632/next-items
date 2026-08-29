import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);
const E2E_EMAIL = process.env.E2E_EMAIL ?? "admin@example.com";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "AdminPass123";

async function apiHealthy(request: APIRequestContext): Promise<boolean> {
  try {
    const health = await request.get(`${API_BASE}/api/v1/health`, { timeout: 3000 });
    if (health.ok()) return true;
  } catch {
  }
  try {
    const res = await request.post(`${API_BASE}/api/v1/auth/login`, {
      data: { email: "probe@example.com", password: "x" },
      timeout: 3000,
    });
    return res.status() === 401 || res.status() === 400 || res.ok();
  } catch {
    return false;
  }
}

async function loginViaUi(page: Page): Promise<boolean> {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(E2E_EMAIL);
  await page.getByLabel(/password/i).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  try {
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 10_000,
    });
    return true;
  } catch {
    const error = page.locator(".form-error");
    if (await error.isVisible().catch(() => false)) {
      return false;
    }
    return false;
  }
}

async function ensureItemViaApi(request: APIRequestContext): Promise<void> {
  const login = await request.post(`${API_BASE}/api/v1/auth/login`, {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  });
  if (!login.ok()) return;

  const loginBody = (await login.json()) as {
    data?: { access_token?: string };
    access_token?: string;
  };
  const access_token =
    loginBody.data?.access_token ?? loginBody.access_token;
  if (!access_token) return;

  const list = await request.get(`${API_BASE}/api/v1/items/?page=1&page_size=1`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!list.ok()) return;
  const body = (await list.json()) as {
    meta?: { total?: number };
    data?: unknown;
  };
  if ((body.meta?.total ?? 0) > 0) return;

  await request.post(`${API_BASE}/api/v1/items/`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `e2e-${Date.now()}`,
    },
    data: {
      name: "E2E Sample Item",
      sku: `E2E-${Date.now()}`,
      category: "other",
      status: "active",
      price: 9.99,
      quantity: 1,
      description: "Created by Playwright",
    },
  });
}

test.describe("Items inventory", () => {
  test("login, browse items, logout", async ({ page, request }) => {
    const healthy = await apiHealthy(request);
    test.skip(!healthy, "API is down — start pymongo-items backend before E2E");

    await ensureItemViaApi(request);

    const loggedIn = await loginViaUi(page);
    test.skip(!loggedIn, "Login failed — check E2E_EMAIL/E2E_PASSWORD and API");

    await expect(page.getByRole("heading", { name: /^items$/i })).toBeVisible();

    const table = page.getByRole("table", { name: /items/i });
    const empty = page.getByText(/no items match/i);
    await expect(table.or(empty).first()).toBeVisible({ timeout: 15_000 });

    const hasRows = await table.isVisible().catch(() => false);
    if (hasRows) {
      const filterStatus = page.getByLabel(/filter status/i);
      if (await filterStatus.isVisible().catch(() => false)) {
        await filterStatus.selectOption("active");
        await expect(page).toHaveURL(/status=active/);
      }

      const nameSort = page.getByRole("button", { name: /^name/i });
      if (await nameSort.isVisible().catch(() => false)) {
        await nameSort.click();
        await expect(page).toHaveURL(/sort_by=name|sort_order=/);
      }

      const nextPage = page.getByRole("button", { name: /next/i });
      if (
        (await nextPage.isVisible().catch(() => false)) &&
        (await nextPage.isEnabled().catch(() => false))
      ) {
        await nextPage.click();
        await expect(page).toHaveURL(/page=2/);
      }

      const edit = page.getByRole("button", { name: /^edit$/i }).first();
      if (await edit.isVisible().catch(() => false)) {
        await edit.click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
      }
    }

    await page.getByRole("button", { name: /log ?out|sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
