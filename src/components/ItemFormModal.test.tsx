import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ItemFormModal } from "@/components/ItemFormModal";

describe("ItemFormModal", () => {
  it("renders create form and submits valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ItemFormModal open mode="create" onClose={vi.fn()} onSubmit={onSubmit} />,
    );

    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/^Name$/i), "New Lamp");
    await user.type(within(dialog).getByLabelText(/^SKU$/i), "SKU-NEW");
    await user.clear(within(dialog).getByLabelText(/^Price$/i));
    await user.type(within(dialog).getByLabelText(/^Price$/i), "25");
    await user.clear(within(dialog).getByLabelText(/^Quantity$/i));
    await user.type(within(dialog).getByLabelText(/^Quantity$/i), "5");
    await user.click(within(dialog).getByRole("button", { name: /create/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Lamp",
        sku: "SKU-NEW",
        price: 25,
        quantity: 5,
      }),
    );
  });

  it("shows validation error when name missing", async () => {
    const user = userEvent.setup();
    render(
      <ItemFormModal open mode="create" onClose={vi.fn()} onSubmit={vi.fn()} />,
    );

    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/^SKU$/i), "SKU-X");
    await user.clear(within(dialog).getByLabelText(/^Price$/i));
    await user.type(within(dialog).getByLabelText(/^Price$/i), "1");
    await user.click(within(dialog).getByRole("button", { name: /create/i }));

    expect(await within(dialog).findByText(/name is required/i)).toBeInTheDocument();
  });
});
