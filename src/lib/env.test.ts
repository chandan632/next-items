import { afterEach, describe, expect, it, vi } from "vitest";

import { getDefaultUserPassword } from "@/lib/env";

describe("getDefaultUserPassword", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads NEXT_PUBLIC_DEFAULT_USER_PASSWORD", () => {
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_USER_PASSWORD", "TempPass1");
    expect(getDefaultUserPassword()).toBe("TempPass1");
  });

  it("falls back in development", () => {
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_USER_PASSWORD", "");
    expect(getDefaultUserPassword()).toBe("password");
  });
});
