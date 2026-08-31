import React, { useEffect, useState } from "react";
import { attendanceService } from "../../../services";
import type { Attendance } from "../../../types";
import { Loader } from "../../../components/Loader";
import { EmptyState } from "../../../components/EmptyState";
import { toast } from "../../../services/toast";
import { format, startOfMonth, subMonths, endOfMonth } from "date-fns";
import { DatePicker } from "../../../components/DatePicker";
import { Chip, SummaryPanel, Table, type ColumnDef } from "../../../components";

export const SummaryPage: React.FC = () => {
  const today = new Date();
  const [from, setFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"));
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState<
    "THIS_MONTH" | "LAST_MONTH" | "CUSTOM"
  >("THIS_MONTH");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const columns: ColumnDef<Attendance>[] = [
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
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async (f = from, t = to) => {
    setLoading(true);
    try {
      const data = await attendanceService.getSummary(f, t);
      setRecords(data);
    } catch (err) {
      console.error(err);
      toast.error(
        "Oops! We couldn't load your attendance records. Please try again.",
      );
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
      fetchSummary(f, t);
    } else if (type === "LAST_MONTH") {
      const lastMonth = subMonths(today, 1);
      const f = format(startOfMonth(lastMonth), "yyyy-MM-dd");
      const t = format(endOfMonth(lastMonth), "yyyy-MM-dd");
      setFrom(f);
      setTo(t);
      fetchSummary(f, t);
    } else {
      setFrom("");
      setTo("");
      setRecords([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSummary();
  };

  const handleFromChange = (date: string) => {
    setFrom(date);
    if (to && new Date(date) > new Date(to)) {
      setTo(date);
    }
  };

  const handleToChange = (date: string) => {
    setTo(date);
    if (from && new Date(date) < new Date(from)) {
      setFrom(date);
    }
  };

  const displayedRecords = records.filter((r) => {
    if (!statusFilter) return true;
    if (statusFilter === "COMPLETE")
      return (
        r.checkIn &&
        r.checkOut &&
        r.status !== "LATE" &&
        r.status !== "EARLY_LEAVE"
      );
    return r.status === statusFilter;
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

  const downloadCSV = () => {
    if (records.length === 0) return toast.info("No records to export.");
    const headers = ["Date,Check In,Check Out,Work Hours,Status"];
    const csvRows = records.map((r) => {
      const d = format(new Date(r.date), "yyyy-MM-dd");
      const ci = r.checkIn ? format(new Date(r.checkIn), "HH:mm") : "--:--";
      const co = r.checkOut ? format(new Date(r.checkOut), "HH:mm") : "--:--";
      const whFloat = r.workHours ?? 0;
      const h = Math.floor(whFloat);
      const m = Math.round((whFloat - h) * 60);
      const wh = `${h}h ${m}m`;
      const st = r.status || "UNKNOWN";
      return `${d},${ci},${co},${wh},${st}`;
    });
    const csvString = headers.concat(csvRows).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `Attendance_Report_${from}_to_${to}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === "ON_TIME").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const earlyCount = records.filter((r) => r.status === "EARLY_LEAVE").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;

  return (
    <div className="max-w-7xl mx-auto animate-slide-up space-y-8 pb-8 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Attendance History
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
            Review your past work logs and timesheets.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="xl:col-span-8 flex flex-col space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pt-4">
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
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-[#D6E3FF]/80 hover:bg-[#F0F4F8] hover:border-[#0038FF]/30 text-[#0038FF] text-sm font-bold rounded-xl transition-all shadow-sm w-full sm:w-auto"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Report
            </button>
          </div>
          {quickFilter === "CUSTOM" && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#D6E3FF]/60">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4 items-end"
              >
                <div className="flex-1 w-full">
                  <DatePicker
                    id="summary-from"
                    label="From Date"
                    value={from}
                    onChange={handleFromChange}
                  />
                </div>
                <div className="flex-1 w-full">
                  <DatePicker
                    id="summary-to"
                    label="To Date"
                    value={to}
                    onChange={handleToChange}
                    minDate={from}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-13 px-8 bg-[#0038FF] text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0038FF]/20 shrink-0 w-full sm:w-auto disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <>
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Search
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#D6E3FF]/60 flex justify-center">
              <EmptyState
                title={
                  quickFilter === "CUSTOM" && from === "" && to === ""
                    ? "Select a Date Range"
                    : "No Attendance Records"
                }
                description={
                  quickFilter === "CUSTOM" && from === "" && to === ""
                    ? "Please select a start and end date above, then click Search to view your attendance history."
                    : "You don't have any attendance logs for this period."
                }
                singleImage="/not-found.png"
              />
            </div>
          ) : (
            <>
              <div className="sm:hidden space-y-4">
                {displayedRecords.length === 0 ? (
                  <div className="py-8 bg-white rounded-3xl border border-[#D6E3FF]/60 shadow-sm">
                    <EmptyState
                      title="No Matches Found"
                      description="We couldn't find any logs matching your current status filter."
                      singleImage="/not-found.png"
                      secondaryAction={{
                        label: "Clear Filter",
                        onClick: () => setStatusFilter(null),
                      }}
                    />
                  </div>
                ) : (
                  displayedRecords.map((rec) => {
                    const duration =
                      rec.checkIn && rec.checkOut
                        ? `${Math.floor((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) / 3600000)}h ${Math.floor(((new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) % 3600000) / 60000)}m`
                        : "-";
                    return (
                      <div
                        key={rec.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-[#D6E3FF]/60 flex flex-col relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="font-bold text-slate-800 text-lg">
                              {format(new Date(rec.date), "dd MMM")}
                            </span>
                            <div className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                              {format(new Date(rec.date), "EEEE")}
                            </div>
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
                            <span>Duration</span>
                            <span className="text-slate-700">{duration}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="hidden sm:block">
                <Table
                  columns={columns}
                  data={displayedRecords}
                  emptyState={
                    <EmptyState
                      title="No Matches Found"
                      description="We couldn't find any logs matching your current status filter."
                      singleImage="/not-found.png"
                      secondaryAction={{
                        label: "Clear Filter",
                        onClick: () => setStatusFilter(null),
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
