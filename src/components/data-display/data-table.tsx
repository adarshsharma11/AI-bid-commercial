"use client";

import {
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

type DataTableColumns<T extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  T,
  // Accessor columns carry their own value types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>[];

export function DataTable<T extends RowData>({
  data,
  columns,
  caption,
  pageSize = 8,
}: {
  data: T[];
  columns: DataTableColumns<T>;
  caption: string;
  pageSize?: number;
}) {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });
  const page = table.state.pagination.pageIndex + 1;
  const pages = Math.max(1, table.getPageCount());

  return (
    <div className="grid gap-3">
      <div className="border-line bg-surface overflow-x-auto border">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-line bg-surface-muted text-muted border-b text-xs tracking-wide uppercase">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-3 py-2 font-medium"
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : header.column.getCanSort()
                              ? "none"
                              : undefined
                      }
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="hover:text-ink focus-visible:ring-accent inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:outline-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          <span
                            aria-hidden
                            className={sorted ? "text-ink" : "text-faint"}
                          >
                            {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}
                          </span>
                          <span className="sr-only">
                            {sorted ? `sorted ${sorted}` : "sortable"}
                          </span>
                        </button>
                      ) : header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-line hover:bg-surface-muted border-b last:border-0"
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-muted flex items-center justify-between text-sm">
        <p>
          Page {page} of {pages} · {data.length} rows
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
