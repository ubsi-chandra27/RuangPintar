"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight, Download, Filter, Search, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const fieldClass =
  "min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
export const tableClass =
  "w-full table-fixed text-left text-sm [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-slate-600 [&_td]:px-4 [&_td]:py-2 [&_tbody_tr]:h-12 [&_tbody_tr]:border-t [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-blue-50/40";
export const surfaceClass =
  "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

export function ScheduleDialog({
  title,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          if (!busy) onClose();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-[20px] border border-slate-200 bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Tutup dialog"
          disabled={busy}
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

export function ScheduleToolbar({
  search,
  onSearch,
  placeholder,
  filters,
  sort,
  onSort,
  sortOptions,
  onExport,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  filters: ReactNode;
  sort: string;
  onSort: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  onExport: () => void;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const filterId = useId();
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-md sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-slate-500"
          />
          <input
            aria-label={placeholder}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={placeholder}
            className={`${fieldClass} pl-9`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={filterId}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <label className="relative min-w-0 flex-1 sm:flex-none">
            <ArrowDownUp
              aria-hidden
              className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-slate-600"
            />
            <select
              aria-label="Urutkan data"
              value={sort}
              onChange={(event) => onSort(event.target.value)}
              className={`${fieldClass} pl-9 sm:w-auto`}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4" />
            Ekspor
          </Button>
          {children}
        </div>
      </div>
      {expanded && (
        <div
          id={filterId}
          className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3"
        >
          {filters}
        </div>
      )}
    </div>
  );
}

export function SchedulePagination({
  total,
  page,
  size,
  onPage,
  onSize,
}: {
  total: number;
  page: number;
  size: number;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, pages);
  const numbers = [...new Set([1, current - 1, current, current + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
      <p role="status">
        {total ? (current - 1) * size + 1 : 0}–{Math.min(current * size, total)} dari{" "}
        {total.toLocaleString("id-ID")} data
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Baris per halaman"
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-2"
          value={size}
          onChange={(event) => onSize(Number(event.target.value))}
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} / halaman
            </option>
          ))}
        </select>
        <nav aria-label="Halaman data" className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            aria-label="Halaman sebelumnya"
            disabled={current === 1}
            onClick={() => onPage(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {numbers.map((n, index) => (
            <span key={n} className="flex items-center">
              {index > 0 && n - numbers[index - 1] > 1 && <span className="px-1">…</span>}
              <button
                type="button"
                aria-label={`Halaman ${n}`}
                aria-current={n === current ? "page" : undefined}
                onClick={() => onPage(n)}
                className={`min-h-11 min-w-9 rounded-lg border px-2 focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-9 ${n === current ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                {n}
              </button>
            </span>
          ))}
          <Button
            size="icon"
            variant="outline"
            aria-label="Halaman berikutnya"
            disabled={current === pages}
            onClick={() => onPage(current + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>
  );
}

export function exportScheduleCsv(filename: string, rows: unknown[][]) {
  const escape = (value: unknown) => {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + rows.map((row) => row.map(escape).join(";")).join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
