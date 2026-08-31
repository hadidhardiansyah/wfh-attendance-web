import React from "react";
import { format } from "date-fns";

export type ColumnType =
  | "text"
  | "profile"
  | "status"
  | "time"
  | "duration"
  | "date"
  | "action";

export interface ColumnDef<T> {
  header: string;
  key: string;
  type?: ColumnType;
  align?: "left" | "center" | "right";
  hiddenOn?: "sm" | "md" | "lg";
  className?: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  emptyState?: React.ReactNode;
  rowKey: (row: T) => string;
}

export function Table<T>({ columns, data, emptyState, rowKey }: TableProps<T>) {
  const renderCell = (row: any, col: ColumnDef<T>) => {
    if (col.render) {
      return col.render(row);
    }

    const value = row[col.key];

    switch (col.type) {
      case "profile":
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0038FF] font-bold text-sm shrink-0 shadow-sm border border-blue-100">
              {value?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate">{value?.name}</p>
              <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">
                {value?.email}
              </p>
            </div>
          </div>
        );

      case "date":
        return (
          <span className="font-bold text-slate-700">
            {value ? format(new Date(value), "dd MMM yyyy") : "-"}
          </span>
        );

      case "time":
        return value ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm border border-blue-100">
            {format(new Date(value), "HH:mm")}
          </div>
        ) : (
          <span className="text-slate-300 font-medium">--:--</span>
        );

      case "status":
        if (value === "MISSING_CHECKOUT")
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-600 uppercase tracking-wider whitespace-nowrap">
              Missed Checkout
            </span>
          );
        if (value === "LATE")
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-600 uppercase tracking-wider">
              Late
            </span>
          );
        if (value === "EARLY_LEAVE")
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-100 text-orange-600 uppercase tracking-wider">
              Early Leave
            </span>
          );
        if (value === "PRESENT" || value === "COMPLETE")
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-600 uppercase tracking-wider">
              Present
            </span>
          );
        if (value === "ACTIVE")
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Active
            </span>
          );
        if (value === "SUSPENDED")
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
              Suspended
            </span>
          );
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
            {value || "Unknown"}
          </span>
        );

      default:
        return <span className="font-bold text-slate-700">{value}</span>;
    }
  };

  const getHiddenClass = (hiddenOn?: "sm" | "md" | "lg") => {
    switch (hiddenOn) {
      case "sm":
        return "hidden sm:table-cell";
      case "md":
        return "hidden md:table-cell";
      case "lg":
        return "hidden lg:table-cell";
      default:
        return "";
    }
  };

  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "left":
      default:
        return "text-left";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#D6E3FF]/60 overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-[#F0F4F8]/80 border-b border-[#D6E3FF]/50">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap ${getHiddenClass(col.hiddenOn)} ${getAlignClass(col.align)} ${col.width || ""} ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  {emptyState}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`px-6 py-4 ${getHiddenClass(col.hiddenOn)} ${getAlignClass(col.align)} ${col.className || ""}`}
                    >
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
