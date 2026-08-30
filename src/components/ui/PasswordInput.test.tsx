import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "@/components/ui/PasswordInput";

describe("PasswordInput", () => {
  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="pwd" value="secret" onChange={() => {}} aria-label="Password" />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });
});
