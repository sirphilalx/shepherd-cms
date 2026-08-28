import { cn } from "./cn";

export interface TableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
}

/**
 * Real <table> on desktop; collapses to stacked label/value rows on mobile
 * via the .table-responsive CSS in globals.css (DESIGN-SYSTEM.md §12.2).
 */
export function Table<T extends { id: string | number }>({
  columns,
  rows,
  className,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  className?: string;
}) {
  return (
    <div className={cn("table-responsive", className)}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="border-b border-border pb-[10px] text-[11px] font-semibold tracking-[0.04em] text-ink-faint uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td
                  key={col.header}
                  data-label={col.header}
                  className="border-b border-border px-[10px] py-[13px] text-[13px] text-ink first:pl-0"
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
