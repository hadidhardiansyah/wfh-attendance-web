import { useDebounce } from "../../../hooks/useDebounce";
import React, { useEffect, useState } from "react";
import { adminService } from "../../../services";
import type { Attendance } from "../../../types";
import { Loader } from "../../../components/Loader";
import { EmptyState } from "../../../components/EmptyState";
import { toast } from "../../../services/toast";
import { format, startOfMonth, subMonths, endOfMonth } from "date-fns";
import { DatePicker } from "../../../components/DatePicker";
import { Chip, SummaryPanel, Table, type ColumnDef } from "../../../components";

export const AttendanceMonitorPage: React.FC = () => {
  const today = new Date();
  const [from, setFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"));
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (
      debouncedSearch.trim().length >= 3 ||
      debouncedSearch.trim().length === 0
    ) {
      setSearch(debouncedSearch.trim());
    }
  }, [debouncedSearch]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<
    "THIS_MONTH" | "LAST_MONTH" | "CUSTOM"
  >("THIS_MONTH");

  const columns: ColumnDef<Attendance>[] = [
    { header: "Employee", key: "user", type: "profile" },
    { header: "Date", key: "date", type: "date" },
    { header: "Check In", key: "checkIn", type: "time" },
    { header: "Check Out", key: "checkOut", type: "time" },
    {
      header: "Duration",
      key: "duration",
      type: "text",
      render: (rec) => {
        return rec.checkIn && rec.checkOut
          ? `${Math.floor((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) / 3600000)}h ${Math.floor(((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) % 3600000) / 60000)}m`
          : "-";
      },
    },
    { header: "Status", key: "status", type: "status", align: "right" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (f = from, t = to) => {
    setLoading(true);
    try {
      const data = await adminService.getAllAttendances(f, t);
      setRecords(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (type: "THIS_MONTH" | "LAST_MONTH" | "CUSTOM") => {
    setQuickFilter(type);
    setStatusFilter(null);
    if (type === "THIS_MONTH") {
      const f = format(startOfMonth(today), "yyyy-MM-dd");
      const t = format(today, "yyyy-MM-dd");
      setFrom(f);
      setTo(t);
      fetchData(f, t);
    } else if (type === "LAST_MONTH") {
      const lastMonth = subMonths(today, 1);
      const f = format(startOfMonth(lastMonth), "yyyy-MM-dd");
      const t = format(endOfMonth(lastMonth), "yyyy-MM-dd");
      setFrom(f);
      setTo(t);
      fetchData(f, t);
    } else {
      setFrom("");
      setTo("");
      setRecords([]);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchData();
  };

  const handleFromChange = (newFrom: string) => {
    setFrom(newFrom);
    if (newFrom && to && new Date(newFrom) > new Date(to)) {
      setTo("");
    }
  };

  const filtered = records.filter((r) => {
    const matchSearch =
      (r.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter
      ? statusFilter === "COMPLETE"
        ? r.checkIn &&
          r.checkOut &&
          r.status !== "LATE" &&
          r.status !== "EARLY_LEAVE"
        : statusFilter === "MISSING_CHECKOUT"
          ? r.status === "MISSING_CHECKOUT"
          : r.status === statusFilter
      : true;
    return matchSearch && matchStatus;
  });

  const renderStatusBadge = (rec: Attendance) => {
    if (rec.status === "MISSING_CHECKOUT")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-600 uppercase tracking-wider whitespace-nowrap">
          Missed Checkout
        </span>
      );
    if (rec.status === "LATE")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-600 uppercase tracking-wider">
          Late
        </span>
      );
    if (rec.status === "EARLY_LEAVE")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-100 text-orange-600 uppercase tracking-wider">
          Early Leave
        </span>
      );
    if (rec.status === "PRESENT")
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-600 uppercase tracking-wider">
          Present
        </span>
      );
    if (rec.checkIn && rec.checkOut)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-600 uppercase tracking-wider">
          Complete
        </span>
      );
    if (rec.checkIn)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#D6E3FF] text-[#0038FF] uppercase tracking-wider">
          In Progress
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
        Absent
      </span>
    );
  };

  return (
    <div className="w-full animate-slide-up space-y-8 pb-8 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Attendance Monitor
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
            Global read-only view of all employee activity.
          </p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#D6E3FF]/60">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <input
                  className="w-full pl-11 pr-11 py-3 bg-[#F0F4F8] border border-[#D6E3FF] rounded-2xl text-slate-800 text-sm md:text-[15px] font-bold focus:outline-none focus:ring-4 focus:ring-[#0038FF]/10 focus:border-[#0038FF] transition-all placeholder-slate-400"
                  type="text"
                  placeholder="Filter specific employee by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip
                label="This Month"
                active={quickFilter === "THIS_MONTH"}
                onClick={() => handleQuickFilter("THIS_MONTH")}
              />
              <Chip
                label="Last Month"
                active={quickFilter === "LAST_MONTH"}
                onClick={() => handleQuickFilter("LAST_MONTH")}
              />
              <Chip
                label="Custom Range"
                active={quickFilter === "CUSTOM"}
                colorSchema="dark"
                onClick={() => handleQuickFilter("CUSTOM")}
              />
            </div>
            {quickFilter === "CUSTOM" && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#D6E3FF]/60 animate-fade-in">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col sm:flex-row gap-4 items-end"
                >
                  <div className="flex-1 w-full">
                    <DatePicker
                      id="monitor-from"
                      label="From Date"
                      value={from}
                      onChange={handleFromChange}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <DatePicker
                      id="monitor-to"
                      label="To Date"
                      value={to}
                      onChange={setTo}
                      minDate={from}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto h-12.5 px-8 bg-[#0038FF] hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-[#0038FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader size="sm" /> : <>Search</>}
                  </button>
                </form>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#D6E3FF]/60 flex justify-center">
              <EmptyState
                title={
                  search.trim() !== ""
                    ? "No Matches Found"
                    : "No Attendance Data"
                }
                description={
                  search.trim() !== ""
                    ? "We couldn't find any records matching your search."
                    : "There are no attendance records for this period."
                }
                singleImage="/not-found.png"
                secondaryAction={
                  search.trim() !== ""
                    ? {
                        label: "Clear Search",
                        onClick: () => {
                          setSearch("");
                          setSearchInput("");
                        },
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <>
              <div className="sm:hidden space-y-4">
                {filtered.map((rec) => {
                  const duration =
                    rec.checkIn && rec.checkOut
                      ? `${Math.floor((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) / 3600000)}h ${Math.floor(((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) % 3600000) / 60000)}m`
                      : "-";
                  return (
                    <div
                      key={rec.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-[#D6E3FF]/60 flex flex-col relative"
                    >
                      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0038FF] font-bold text-lg shrink-0">
                          {rec.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-base truncate">
                            {rec.user?.name}
                          </p>
                          <p className="text-xs font-bold text-slate-400 truncate">
                            {format(new Date(rec.date), "EEEE, dd MMM yyyy")}
                          </p>
                        </div>
                        {renderStatusBadge(rec)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-[#F0F4F8]/50 rounded-xl p-4 border border-[#D6E3FF]/30">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            Check In
                          </span>
                          {rec.checkIn ? (
                            <span className="text-blue-700 font-bold text-base">
                              {format(new Date(rec.checkIn), "HH:mm")}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium text-base">
                              --:--
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            Check Out
                          </span>
                          {rec.checkOut ? (
                            <span className="text-slate-700 font-bold text-base">
                              {format(new Date(rec.checkOut), "HH:mm")}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium text-base">
                              --:--
                            </span>
                          )}
                        </div>
                      </div>
                      {rec.checkIn && rec.checkOut && (
                        <div className="mt-3 flex justify-between items-center text-xs font-bold text-slate-500">
                          <span>Total Duration</span>
                          <span className="text-slate-700">{duration}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="hidden sm:block">
                <Table
                  columns={columns}
                  data={filtered}
                  emptyState={
                    <EmptyState
                      title="No Matches Found"
                      description="We couldn't find any logs matching your current search or status filter."
                      singleImage="/not-found.png"
                      secondaryAction={{
                        label: "Clear Filters",
                        onClick: () => {
                          setSearch("");
                          setSearchInput("");
                          setStatusFilter(null);
                        },
                      }}
                    />
                  }
                  rowKey={(r) => r.id}
                />
              </div>
            </>
          )}
        </div>
        <div className="w-full lg:w-80 shrink-0 sticky top-6">
          <SummaryPanel
            title="Attendance Summary"
            subtitle="Overview of your attendance records"
            cards={[
              {
                id: "complete",
                title: "Complete",
                subtitle: "Full Shifts",
                value: records.filter(
                  (r) =>
                    r.checkIn &&
                    r.checkOut &&
                    r.status !== "LATE" &&
                    r.status !== "EARLY_LEAVE",
                ).length,
                colorSchema: "emerald",
                isActive: statusFilter === "COMPLETE",
                onClick: () => setStatusFilter("COMPLETE"),
              },
              {
                id: "late",
                title: "Late",
                subtitle: "Late Check-Ins",
                value: records.filter((r) => r.status === "LATE").length,
                colorSchema: "amber",
                isActive: statusFilter === "LATE",
                onClick: () => setStatusFilter("LATE"),
              },
              {
                id: "early_leave",
                title: "Early Leave",
                subtitle: "Early Check-Outs",
                value: records.filter((r) => r.status === "EARLY_LEAVE").length,
                colorSchema: "orange",
                isActive: statusFilter === "EARLY_LEAVE",
                onClick: () => setStatusFilter("EARLY_LEAVE"),
              },
              {
                id: "missing_checkout",
                title: "Missed Checkout",
                subtitle: "Missing Logs",
                value: records.filter((r) => r.status === "MISSING_CHECKOUT")
                  .length,
                colorSchema: "rose",
                isActive: statusFilter === "MISSING_CHECKOUT",
                onClick: () => setStatusFilter("MISSING_CHECKOUT"),
              },
              {
                id: "total",
                title: "Total",
                subtitle: "Total Days",
                value: records.length,
                colorSchema: "blue",
                isActive: statusFilter === null,
                onClick: () => setStatusFilter(null),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
