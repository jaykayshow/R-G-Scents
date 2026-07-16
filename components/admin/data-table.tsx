"use client";

import { useState, useMemo, type ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, sortKey, sortDir, columns]);

  function toggleSort(col: DataTableColumn<T>) {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  }

  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  function toggleSelectAll() {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : rows.map((r) => getRowId(r)));
  }

  function toggleSelectOne(id: string) {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/40">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 accent-[#c9a24b]"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className={cn("px-4 py-3 font-semibold", col.className)}>
                {col.sortValue ? (
                  <button
                    onClick={() => toggleSort(col)}
                    className="flex items-center gap-1.5 hover:text-white/70"
                  >
                    {col.label}
                    <ArrowUpDown size={11} className={sortKey === col.key ? "text-gold" : ""} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-white/40">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => {
              const id = getRowId(row);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors hover:bg-white/[0.03]",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {selectable && (
                    <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleSelectOne(id)}
                        className="h-4 w-4 accent-[#c9a24b]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-white/80", col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
