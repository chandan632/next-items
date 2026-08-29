"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BulkActionBar } from "@/components/items/BulkActionBar";
import { ColumnsPanel } from "@/components/items/ColumnsPanel";
import { ItemsTableHeader } from "@/components/items/ItemsTableHeader";
import { ItemsTableRow } from "@/components/items/ItemsTableRow";
import { ItemsToolbar } from "@/components/items/ItemsToolbar";
import { Pager } from "@/components/items/Pager";
import type { RangeDraft } from "@/components/items/filters/registry";
import { ItemFormModal } from "@/components/ItemFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useColumnPrefs } from "@/hooks/useColumnPrefs";
import { useDebounce } from "@/hooks/useDebounce";
import { useItemSelection } from "@/hooks/useItemSelection";
import { useItemsData } from "@/hooks/useItemsData";
import { filterKey, useItemsUrlState } from "@/hooks/useItemsUrlState";
import { useVirtualWindow } from "@/hooks/useVirtualWindow";
import {
  ApiError,
  bulkAction,
  createItem,
  deleteItem,
  downloadExport,
  seedItems,
  updateItem,
  updateItemStatus,
} from "@/lib/api";
import type { ColumnId, Item, ItemStatus } from "@/lib/types";

type ConfirmState = {
  message: string;
  danger?: boolean;
  run: () => Promise<void>;
} | null;

export function ItemsDataTable() {
  const router = useRouter();
  const { user, canEdit, canAdmin, logout } = useAuth();
  const { query, setQuery } = useItemsUrlState();
  const { data, error, initialLoading, refreshing, reload } = useItemsData(query);
  const selection = useItemSelection();
  const columns = useColumnPrefs();

  const [searchInput, setSearchInput] = useState(query.q);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [rangeDraft, setRangeDraft] = useState<RangeDraft>({
    min_price: query.min_price,
    max_price: query.max_price,
    min_quantity: query.min_quantity,
    max_quantity: query.max_quantity,
  });
  const debouncedRange = useDebounce(rangeDraft, 400);

  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null,
  );
  const [showColumns, setShowColumns] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const lastFilterKey = useRef(filterKey(query));
  const queryRef = useRef(query);
  const clearSelection = selection.clear;
  queryRef.current = query;

  useEffect(() => {
    if (debouncedSearch !== queryRef.current.q) {
      setQuery({ q: debouncedSearch }, { resetPage: true });
    }
  }, [debouncedSearch, setQuery]);

  useEffect(() => {
    setSearchInput(query.q);
  }, [query.q]);

  useEffect(() => {
    setRangeDraft({
      min_price: query.min_price,
      max_price: query.max_price,
      min_quantity: query.min_quantity,
      max_quantity: query.max_quantity,
    });
  }, [query.min_price, query.max_price, query.min_quantity, query.max_quantity]);

  useEffect(() => {
    const current = queryRef.current;
    const same =
      debouncedRange.min_price === current.min_price &&
      debouncedRange.max_price === current.max_price &&
      debouncedRange.min_quantity === current.min_quantity &&
      debouncedRange.max_quantity === current.max_quantity;
    if (same) return;
    setQuery(
      {
        min_price: debouncedRange.min_price,
        max_price: debouncedRange.max_price,
        min_quantity: debouncedRange.min_quantity,
        max_quantity: debouncedRange.max_quantity,
      },
      { resetPage: true },
    );
  }, [debouncedRange, setQuery]);

  useEffect(() => {
    const key = filterKey(query);
    if (key !== lastFilterKey.current) {
      lastFilterKey.current = key;
      clearSelection();
    }
  }, [query, clearSelection]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const pageIds = data?.data.map((item) => item.id) ?? [];
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id));
  const somePageSelected =
    pageIds.some((id) => selection.isSelected(id)) && !allPageSelected;
  const selectedCount = selection.selectedCount(data?.meta.total ?? 0);
  const selectAllMatching = selection.mode === "exclude";
  const totalPages = data?.meta.total_pages ?? 0;
  const page = data?.meta.page ?? query.page;
  const showEmpty = !initialLoading && !error && data?.data.length === 0;
  const showRows = !initialLoading && !error && (data?.data.length ?? 0) > 0;
  const rows = data?.data ?? [];
  const { scrollRef, range, rowHeight, viewportStyle } = useVirtualWindow(
    rows.length,
    `${query.page}-${query.page_size}-${filterKey(query)}-${rows.length}`,
  );
  const visibleRows = showRows ? rows.slice(range.start, range.end) : [];
  const colSpan = columns.visibleColumns.length + (canEdit ? 2 : 1);

  function showMessage(message: string, tone: "success" | "error" = "success") {
    setToast({ message, tone });
  }

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: Item) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function saveItem(payload: {
    name: string;
    sku: string;
    category: string;
    status: string;
    price: number;
    quantity: number;
    description: string | null;
  }) {
    setBusy(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, {
          ...payload,
          status: payload.status as ItemStatus,
        });
        showMessage("Item updated");
      } else {
        await createItem(payload);
        showMessage("Item created");
      }
      setFormOpen(false);
      setEditingItem(null);
      reload();
    } finally {
      setBusy(false);
    }
  }

  function askConfirm(message: string, run: () => Promise<void>, danger = false) {
    setConfirm({ message, run, danger });
  }

  async function runBulk(
    action: "delete" | "set_status" | "adjust_quantity",
    extra?: { status_value?: ItemStatus; quantity_delta?: number },
  ) {
    if (selectedCount === 0) return;
    const label =
      action === "delete"
        ? `Delete ${selectedCount} item(s)?`
        : `Apply ${action} to ${selectedCount} item(s)?`;

    askConfirm(
      label,
      async () => {
        setBusy(true);
        try {
          const result = await bulkAction({
            action,
            ...selection.toBulkPayload(),
            q: query.q || undefined,
            category: query.category || undefined,
            status: query.status || undefined,
            min_price: query.min_price ? Number(query.min_price) : undefined,
            max_price: query.max_price ? Number(query.max_price) : undefined,
            min_quantity: query.min_quantity ? Number(query.min_quantity) : undefined,
            max_quantity: query.max_quantity ? Number(query.max_quantity) : undefined,
            ...extra,
          });
          showMessage(`${action}: ${result.modified} of ${result.matched} affected`);
          selection.clear();
          reload();
        } catch (err) {
          showMessage(
            err instanceof ApiError ? err.message : "Bulk action failed",
            "error",
          );
        } finally {
          setBusy(false);
        }
      },
      action === "delete",
    );
  }

  function onDeleteRow(item: Item) {
    askConfirm(
      `Delete "${item.name}"?`,
      async () => {
        setBusyId(item.id);
        try {
          await deleteItem(item.id);
          showMessage("Item deleted");
          reload();
        } catch (err) {
          showMessage(err instanceof ApiError ? err.message : "Delete failed", "error");
        } finally {
          setBusyId(null);
        }
      },
      true,
    );
  }

  async function onArchiveRow(item: Item) {
    setBusyId(item.id);
    try {
      await updateItemStatus(item.id, "archived");
      showMessage("Item archived");
      reload();
    } catch (err) {
      showMessage(err instanceof ApiError ? err.message : "Update failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function onExport(selectedOnly: boolean) {
    if (selectedOnly && selectedCount === 0) {
      showMessage("Select rows to export, or use Export all", "error");
      return;
    }
    try {
      const payload = selection.toBulkPayload();
      await downloadExport(query, {
        selectAll: selectedOnly ? Boolean(payload.select_all) : true,
        ids: selectedOnly && !payload.select_all ? payload.ids : undefined,
      });
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Export failed", "error");
    }
  }

  function onSort(columnId: ColumnId) {
    if (query.sort_by === columnId) {
      setQuery({ sort_order: query.sort_order === "asc" ? "desc" : "asc" });
      return;
    }
    setQuery({ sort_by: columnId, sort_order: "asc" }, { resetPage: true });
  }

  function resetFilters() {
    setSearchInput("");
    setRangeDraft({
      min_price: "",
      max_price: "",
      min_quantity: "",
      max_quantity: "",
    });
    setQuery({
      q: "",
      category: "",
      status: "",
      min_price: "",
      max_price: "",
      min_quantity: "",
      max_quantity: "",
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
      page_size: query.page_size,
    });
    selection.clear();
  }

  function updateRange(field: keyof RangeDraft, value: string) {
    setRangeDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function onSeed() {
    askConfirm("Seed 5000 sample items?", async () => {
      setBusy(true);
      try {
        const result = await seedItems({ count: 5000, clear: false });
        showMessage(`Seeded ${result.inserted} items (total ${result.total})`);
        reload();
      } catch (err) {
        showMessage(err instanceof ApiError ? err.message : "Seed failed", "error");
      } finally {
        setBusy(false);
      }
    });
  }

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="table-app">
      <ItemsToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        pageSize={query.page_size}
        onPageSizeChange={(size) => setQuery({ page_size: size }, { resetPage: true })}
        onReset={resetFilters}
        onRefresh={reload}
        refreshing={refreshing}
        initialLoading={initialLoading}
        onExportAll={() => void onExport(false)}
        onToggleColumns={() => setShowColumns((v) => !v)}
        canEdit={canEdit}
        canAdmin={canAdmin}
        onAdd={openCreate}
        onSeed={canAdmin ? () => void onSeed() : undefined}
        onLogout={() => void onLogout()}
        userEmail={user?.email}
        recordsLabel={
          data
            ? `${data.meta.total.toLocaleString()} records${refreshing ? " · Updating…" : ""}`
            : "Inventory list"
        }
      />

      {showColumns && (
        <ColumnsPanel prefs={columns.prefs} onToggle={columns.toggleHidden} />
      )}

      <BulkActionBar
        selectedCount={selectedCount}
        selectAllMatching={selectAllMatching}
        total={data?.meta.total ?? 0}
        busy={busy}
        canEdit={canEdit}
        onSelectAllMatching={selection.selectAllMatching}
        onClear={selection.clear}
        onSetActive={() => void runBulk("set_status", { status_value: "active" })}
        onArchive={() => void runBulk("set_status", { status_value: "archived" })}
        onAdjustQty={() => void runBulk("adjust_quantity", { quantity_delta: 10 })}
        onDelete={() => void runBulk("delete")}
        onExportSelected={() => void onExport(true)}
      />

      <Toast message={toast?.message ?? null} tone={toast?.tone} />

      <div className={`table-wrap${refreshing ? " is-refreshing" : ""}`}>
        <div ref={scrollRef} className="table-scroll" style={viewportStyle}>
          <table className="data-table" aria-label="Items">
            <ItemsTableHeader
              visibleColumns={columns.visibleColumns}
              query={query}
              rangeDraft={rangeDraft}
              setQuery={setQuery}
              updateRange={updateRange}
              allPageSelected={allPageSelected}
              somePageSelected={somePageSelected}
              selectAllMatching={selectAllMatching}
              onTogglePage={() => selection.togglePage(pageIds)}
              onSort={onSort}
              onReorder={columns.reorder}
              showActions={canEdit}
            />
            <tbody aria-busy={refreshing || initialLoading}>
              {initialLoading && (
                <tr>
                  <td colSpan={colSpan} className="state">
                    Loading…
                  </td>
                </tr>
              )}
              {!initialLoading && error && !showRows && (
                <tr>
                  <td colSpan={colSpan} className="state error">
                    {error}{" "}
                    <button type="button" className="linkish" onClick={reload}>
                      Retry
                    </button>
                  </td>
                </tr>
              )}
              {showEmpty && (
                <tr>
                  <td colSpan={colSpan} className="state">
                    No items match the current filters.
                  </td>
                </tr>
              )}
              {showRows && range.paddingTop > 0 && (
                <tr className="virtual-spacer" aria-hidden="true">
                  <td
                    colSpan={colSpan}
                    style={{ height: range.paddingTop, padding: 0, border: 0 }}
                  />
                </tr>
              )}
              {showRows &&
                visibleRows.map((item) => (
                  <ItemsTableRow
                    key={item.id}
                    item={item}
                    visibleColumns={columns.visibleColumns}
                    checked={selection.isSelected(item.id)}
                    rowHeight={rowHeight}
                    busyId={busyId}
                    canEdit={canEdit}
                    onToggle={selection.toggleRow}
                    onEdit={openEdit}
                    onArchive={(row) => void onArchiveRow(row)}
                    onDelete={onDeleteRow}
                  />
                ))}
              {showRows && range.paddingBottom > 0 && (
                <tr className="virtual-spacer" aria-hidden="true">
                  <td
                    colSpan={colSpan}
                    style={{
                      height: range.paddingBottom,
                      padding: 0,
                      border: 0,
                    }}
                  />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && showRows && (
        <p className="inline-error">
          {error}{" "}
          <button type="button" className="linkish" onClick={reload}>
            Retry
          </button>
        </p>
      )}

      <Pager
        page={page}
        totalPages={totalPages}
        disabled={initialLoading || refreshing}
        onPrev={() => setQuery({ page: page - 1 })}
        onNext={() => setQuery({ page: page + 1 })}
      />

      <ItemFormModal
        open={formOpen}
        mode={editingItem ? "edit" : "create"}
        item={editingItem}
        busy={busy}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={saveItem}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        message={confirm?.message ?? ""}
        danger={confirm?.danger}
        busy={busy || busyId !== null}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm?.run;
          setConfirm(null);
          if (action) void action();
        }}
      />
    </div>
  );
}
