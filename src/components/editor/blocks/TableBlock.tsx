"use client";

import React, { useRef, useCallback, type ClipboardEvent, type KeyboardEvent } from "react";
import Papa from "papaparse";
import type { TableBlockData, TableColumn } from "@/lib/editor/block-types";

interface TableBlockProps {
  data: TableBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<TableBlockData>) => void;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function buildGridCols(columns: TableColumn[]): string {
  return columns.map((c) => (c.width ? `${c.width}px` : "1fr")).join(" ");
}

function cellAlign(align?: "left" | "center" | "right"): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function headerBg(variant: TableBlockData["headerVariant"]): React.CSSProperties {
  switch (variant) {
    case "accent":
      return { background: "#4361EE" };
    case "bold":
      return { borderBottom: "2px solid rgba(255,255,255,0.25)" };
    case "minimal":
      return { borderBottom: "1px solid rgba(255,255,255,0.1)" };
    case "default":
    default:
      return { background: "rgba(255,255,255,0.08)" };
  }
}

function headerTextClass(variant: TableBlockData["headerVariant"]): string {
  switch (variant) {
    case "bold":
      return "text-sm font-bold text-white";
    case "accent":
      return "text-xs font-semibold text-white uppercase tracking-wider";
    case "minimal":
      return "text-xs font-bold text-white/70";
    case "default":
    default:
      return "text-xs font-semibold text-white/80 uppercase tracking-wider";
  }
}

function generateKey(): string {
  return `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function TableBlock({
  data,
  isSelected,
  onDataChange,
}: TableBlockProps) {

  const gridRef = useRef<HTMLDivElement>(null);

  /* ── Cell navigation helpers ─────────────────────────────────────── */

  const getCellId = (rowIdx: number, colIdx: number) =>
    `cell-${rowIdx}-${colIdx}`;

  const focusCell = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (!gridRef.current) return;
      const totalRows = data.rows.length;
      const totalCols = data.columns.length;

      // Wrap forward
      if (colIdx >= totalCols) {
        colIdx = 0;
        rowIdx += 1;
      }
      // Wrap backward
      if (colIdx < 0) {
        colIdx = totalCols - 1;
        rowIdx -= 1;
      }
      // Bounds
      if (rowIdx < 0 || rowIdx >= totalRows) return;

      const el = gridRef.current.querySelector<HTMLElement>(
        `[data-cell-id="${getCellId(rowIdx, colIdx)}"]`
      );
      el?.focus();
    },
    [data.rows.length, data.columns.length]
  );

  /* ── Cell change handler ─────────────────────────────────────────── */

  const handleCellBlur = useCallback(
    (rowIdx: number, colKey: string, value: string) => {
      const newRows = data.rows.map((r, i) => {
        if (i !== rowIdx) return r;
        return { ...r, [colKey]: value };
      });
      onDataChange({ rows: newRows });
    },
    [data.rows, onDataChange]
  );

  /* ── Header change handler ───────────────────────────────────────── */

  const handleHeaderBlur = useCallback(
    (colIdx: number, value: string) => {
      const newCols = data.columns.map((c, i) => {
        if (i !== colIdx) return c;
        return { ...c, header: value };
      });
      onDataChange({ columns: newCols });
    },
    [data.columns, onDataChange]
  );

  /* ── Keyboard: Tab / Shift+Tab navigation ────────────────────────── */

  const handleCellKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, rowIdx: number, colIdx: number) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          focusCell(rowIdx, colIdx - 1);
        } else {
          focusCell(rowIdx, colIdx + 1);
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
    },
    [focusCell]
  );

  /* ── Paste from spreadsheet ──────────────────────────────────────── */

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>, rowIdx: number, colIdx: number) => {
      const text = e.clipboardData.getData("text/plain");

      // Detect multi-cell paste (tabs or newlines)
      if (text.includes("\t") || text.includes("\n")) {
        e.preventDefault();

        const parsed = Papa.parse<string[]>(text, {
          delimiter: "\t",
          header: false,
          skipEmptyLines: true,
        });

        const pastedRows = parsed.data;
        if (pastedRows.length === 0) return;

        // Expand columns if needed
        const maxPasteCols = Math.max(...pastedRows.map((r) => r.length));
        const neededCols = colIdx + maxPasteCols;
        let newColumns = [...data.columns];

        while (newColumns.length < neededCols) {
          const key = generateKey();
          newColumns = [
            ...newColumns,
            { key, header: `Col ${newColumns.length + 1}` },
          ];
        }

        // Expand rows if needed
        const neededRows = rowIdx + pastedRows.length;
        let newRows = [...data.rows];
        while (newRows.length < neededRows) {
          const emptyRow: Record<string, string> = {};
          for (const col of newColumns) {
            emptyRow[col.key] = "";
          }
          newRows = [...newRows, emptyRow];
        }

        // Fill values
        for (let r = 0; r < pastedRows.length; r++) {
          const targetRow = rowIdx + r;
          const updatedRow = { ...newRows[targetRow] };
          for (let c = 0; c < pastedRows[r].length; c++) {
            const targetCol = colIdx + c;
            if (targetCol < newColumns.length) {
              updatedRow[newColumns[targetCol].key] = pastedRows[r][c];
            }
          }
          newRows[targetRow] = updatedRow;
        }

        onDataChange({ columns: newColumns, rows: newRows });
      }
    },
    [data.columns, data.rows, onDataChange]
  );

  /* ── Add / Remove columns ────────────────────────────────────────── */

  const addColumn = useCallback(() => {
    const key = generateKey();
    const newCol: TableColumn = {
      key,
      header: `Col ${data.columns.length + 1}`,
    };
    const newRows = data.rows.map((r) => ({ ...r, [key]: "" }));
    onDataChange({ columns: [...data.columns, newCol], rows: newRows });
  }, [data.columns, data.rows, onDataChange]);

  const removeColumn = useCallback(
    (colIdx: number) => {
      if (data.columns.length <= 1) return;
      const removedKey = data.columns[colIdx].key;
      const newCols = data.columns.filter((_, i) => i !== colIdx);
      const newRows = data.rows.map((r) => {
        const updated = { ...r };
        delete updated[removedKey];
        return updated;
      });
      onDataChange({ columns: newCols, rows: newRows });
    },
    [data.columns, data.rows, onDataChange]
  );

  /* ── Add / Remove rows ───────────────────────────────────────────── */

  const addRow = useCallback(() => {
    const emptyRow: Record<string, string> = {};
    for (const col of data.columns) {
      emptyRow[col.key] = "";
    }
    onDataChange({ rows: [...data.rows, emptyRow] });
  }, [data.columns, data.rows, onDataChange]);

  const removeRow = useCallback(
    (rowIdx: number) => {
      if (data.rows.length <= 1) return;
      onDataChange({ rows: data.rows.filter((_, i) => i !== rowIdx) });
    },
    [data.rows, onDataChange]
  );

  /* ── Highlight helpers ───────────────────────────────────────────── */

  const isHighlighted = (rowIdx: number, colIdx: number): boolean => {
    if (data.highlightColumn !== undefined && colIdx === data.highlightColumn)
      return true;
    if (data.highlightRow !== undefined && rowIdx === data.highlightRow)
      return true;
    return false;
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  const gridTemplateColumns = buildGridCols(data.columns);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* Table grid */}
      <div
        ref={gridRef}
        className="w-full rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header row */}
        <div
          className="grid"
          style={{ gridTemplateColumns, ...headerBg(data.headerVariant) }}
        >
          {data.columns.map((col, colIdx) => (
            <div
              key={col.key}
              className={`px-3 py-2 ${cellAlign(col.align)} ${headerTextClass(data.headerVariant)} group relative`}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleHeaderBlur(colIdx, e.currentTarget.textContent || "")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLElement).blur();
                  }
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] rounded px-1 -mx-1"
              >
                {col.header}
              </div>

              {/* Remove column button */}
              {isSelected && data.columns.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColumn(colIdx)}
                  className="absolute -top-1 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500/80 text-white text-[10px] leading-none opacity-0 group-hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-[#4361EE] focus-visible:opacity-100"
                  title="Remove column"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {data.rows.map((row, rowIdx) => {
          const isStriped = data.striped && rowIdx % 2 === 1;

          return (
            <div
              key={rowIdx}
              className="grid group/row relative"
              style={{
                gridTemplateColumns,
                ...(isStriped
                  ? { background: "rgba(255,255,255,0.03)" }
                  : {}),
              }}
            >
              {data.columns.map((col, colIdx) => {
                const highlighted = isHighlighted(rowIdx, colIdx);

                return (
                  <div
                    key={col.key}
                    data-cell-id={getCellId(rowIdx, colIdx)}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleCellBlur(
                        rowIdx,
                        col.key,
                        e.currentTarget.textContent || ""
                      )
                    }
                    onKeyDown={(e) => handleCellKeyDown(e, rowIdx, colIdx)}
                    onPaste={(e) => handlePaste(e, rowIdx, colIdx)}
                    className={`px-3 py-2 text-sm text-white/80 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] ${cellAlign(col.align)}`}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      ...(highlighted
                        ? { background: "rgba(67,97,238,0.1)" }
                        : {}),
                    }}
                  >
                    {row[col.key] ?? ""}
                  </div>
                );
              })}

              {/* Remove row button */}
              {isSelected && data.rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(rowIdx)}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-red-500/80 text-white text-[10px] leading-none opacity-0 group-hover/row:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-[#4361EE] focus-visible:opacity-100"
                  title="Remove row"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add row / column buttons */}
      {isSelected && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addRow}
            className="px-3 py-1 text-xs font-medium text-white/60 rounded-md hover:text-white/90 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            + Row
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="px-3 py-1 text-xs font-medium text-white/60 rounded-md hover:text-white/90 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            + Column
          </button>
        </div>
      )}
    </div>
  );
}
