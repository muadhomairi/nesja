import Link from "next/link";
import type { ReactNode } from "react";
import { Empty } from "./primitives";

export type Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; align?: "end"; className?: string };

/** Server-rendered table. Every row links to its record (drill-down). Sorting/filtering arrive as URL params. */
export function DataTable<T>({ rows, columns, href, empty = "Nothing here yet", footer }: {
  rows: T[]; columns: Column<T>[]; href?: (row: T) => string; empty?: string; footer?: ReactNode;
}) {
  if (!rows.length) return <Empty title={empty} />;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-surface-2 text-xs text-muted">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className={`px-3 py-2 font-semibold ${c.align === "end" ? "text-end" : "text-start"}`}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0 hover:bg-hover">
              {columns.map((c, j) => (
                <td key={c.key} className={`px-3 py-2 ${c.align === "end" ? "text-end tabular" : ""} ${c.className ?? ""}`}>
                  {j === 0 && href ? <Link href={href(r)} className="font-medium text-link hover:underline">{c.cell(r)}</Link> : c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot className="border-t border-line-strong bg-surface-2 font-semibold">{footer}</tfoot>}
      </table>
    </div>
  );
}
