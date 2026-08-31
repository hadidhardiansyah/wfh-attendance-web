import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { attendanceService } from "../../../services";
import type { AttendanceStatus } from "../../../types";
import { Loader } from "../../../components/Loader";
import { Modal } from "../../../components/Modal";
import { toast } from "../../../services/toast";
import { format } from "date-fns";

export const AttendancePage: React.FC = () => {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState<"LATE" | "EARLY_LEAVE" | null>(
    null,
  );
  const [reasonText, setReasonText] = useState("");
  const [viewingReason, setViewingReason] = useState<{
    type: string;
    text: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const statusData = await attendanceService.getTodayStatus();
      setStatus(statusData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const isLate = () => {
    if (!status?.workStartTime || status?.toleranceMinutes == null)
      return false;
    const current = new Date();
    const [startHour, startMinute] = status.workStartTime
      .split(":")
      .map(Number);
    const expectedStart = new Date();
    expectedStart.setHours(startHour, startMinute, 0, 0);
    const diffMinutes = (current.getTime() - expectedStart.getTime()) / 60000;
    return diffMinutes > status.toleranceMinutes;
  };

  const isEarlyLeave = () => {
    if (!status?.workEndTime) return false;
    const current = new Date();
    const [endHour, endMinute] = status.workEndTime.split(":").map(Number);
    const expectedEnd = new Date();
    expectedEnd.setHours(endHour, endMinute, 0, 0);
    return current.getTime() < expectedEnd.getTime();
  };

  const handleActionClick = () => {
    const canCheckIn = status && !status.hasCheckedIn;
    const canCheckOut = status && status.hasCheckedIn && !status.hasCheckedOut;

    if (canCheckIn) {
      if (isLate()) {
        setReasonType("LATE");
        setShowReasonModal(true);
      } else {
        executeCheckIn();
      }
    } else if (canCheckOut) {
      if (isEarlyLeave()) {
        setReasonType("EARLY_LEAVE");
        setShowReasonModal(true);
      } else {
        executeCheckOut();
      }
    }
  };

  const executeCheckIn = async (reason?: string) => {
    setActionLoading(true);
    setShowReasonModal(false);
    try {
      await attendanceService.checkIn(reason);
      toast.success("Clock in recorded successfully!");
      setReasonText("");
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to check in");
    } finally {
      setActionLoading(false);
    }
  };

  const executeCheckOut = async (reason?: string) => {
    setActionLoading(true);
    setShowReasonModal(false);
    try {
      await attendanceService.checkOut(reason);
      toast.success("Clock out recorded successfully!");
      setReasonText("");
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to check out");
    } finally {
      setActionLoading(false);
    }
  };

  const submitReason = () => {
    if (!reasonText.trim()) {
      toast.error("Reason cannot be empty");
      return;
    }
    if (reasonType === "LATE") executeCheckIn(reasonText);
    else if (reasonType === "EARLY_LEAVE") executeCheckOut(reasonText);
  };

  const canCheckIn = status && !status.hasCheckedIn;
  const canCheckOut = status && status.hasCheckedIn && !status.hasCheckedOut;
  const completed = status && status.hasCheckedIn && status.hasCheckedOut;

  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "--:--";
    return format(new Date(dateStr), "HH:mm");
  };

  const getStatusColor = (s: string) => {
    if (s === "ON_TIME") return "text-emerald-600 bg-emerald-50";
    if (s === "LATE") return "text-amber-600 bg-amber-50";
    if (s === "EARLY_LEAVE") return "text-orange-600 bg-orange-50";
    if (s === "ABSENT") return "text-red-600 bg-red-50";
    return "text-slate-600 bg-slate-50";
  };

  const formatStatus = (s: string) => {
    if (s === "ON_TIME") return "On Time";
    if (s === "LATE") return "Late";
    if (s === "EARLY_LEAVE") return "Early Leave";
    if (s === "ABSENT") return "Absent";
    return s;
  };

  const formatWorkHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return (
      <>
        {h > 0 && (
          <>
            {h}
            <span className="text-lg font-medium text-slate-400 mr-1">h</span>
          </>
        )}
        {
          <>
            {m}
            <span className="text-lg font-medium text-slate-400">m</span>
          </>
        }
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-slide-up pt-2">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white rounded-4xl shadow-sm border border-[#D6E3FF]/50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#D6E3FF]/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-[#0038FF]/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>

          <div className="relative w-48 h-48 mb-8 flex items-center justify-center mt-4">
            {!completed && (
              <div className="absolute inset-0 rounded-full bg-[#0038FF]/10 animate-ping"></div>
            )}
            <div className="absolute inset-2 rounded-full bg-[#0038FF]/10 border border-[#0038FF]/20"></div>

            <button
              onClick={handleActionClick}
              disabled={loading || actionLoading || completed || false}
              className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl active:scale-95 ${
                completed
                  ? "bg-emerald-500 shadow-emerald-500/30"
                  : "bg-linear-to-b from-[#0038FF] to-blue-700 hover:to-blue-800 shadow-[#0038FF]/30"
              }`}
            >
              {actionLoading ? (
                <Loader size="md" />
              ) : (
                <>
                  <svg
                    className="w-9 h-9 mb-2 opacity-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {completed ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    ) : canCheckOut ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                      />
                    )}
                  </svg>
                  <span className="font-bold tracking-wide text-[15px]">
                    {completed
                      ? "Completed"
                      : canCheckOut
                        ? "Clock Out"
                        : "Clock In"}
                  </span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 font-mono tracking-wider mb-2 relative z-10">
            {format(now, "HH:mm:ss")}
          </h1>
          <p className="text-sm text-slate-500 font-medium relative z-10 mb-2">
            {format(now, "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D6E3FF]/50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#0038FF]/10 flex items-center justify-center text-[#0038FF]">
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Clock In Time
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                {formatTime(status?.checkIn)}
              </p>
              {status?.checkInReason && (
                <div
                  onClick={() =>
                    setViewingReason({
                      type: "Clock In",
                      text: status.checkInReason!,
                    })
                  }
                  className="mt-2 border-t border-amber-100 pt-2 cursor-pointer group flex items-center justify-between"
                >
                  <p
                    className="text-xs text-amber-600 line-clamp-1 flex-1 pr-2"
                    title="Click to view full reason"
                  >
                    Reason: {status.checkInReason}
                  </p>
                  <svg
                    className="w-4 h-4 text-amber-400 group-hover:text-amber-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D6E3FF]/50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Clock Out Time
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                {formatTime(status?.checkOut)}
              </p>
              {status?.checkOutReason && (
                <p className="text-xs text-orange-600 mt-2 wrap-break-word border-t border-orange-100 pt-2">
                  Reason: {status.checkOutReason}
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D6E3FF]/50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Total Work Hours
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-baseline">
                {status?.workHours !== undefined && status?.workHours !== null
                  ? formatWorkHours(status.workHours)
                  : "--"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D6E3FF]/50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Daily Status
                </p>
              </div>
              <div>
                {status?.status ? (
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${getStatusColor(status.status)}`}
                  >
                    {formatStatus(status.status)}
                  </span>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-slate-800">
                    --
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-linear-to-r from-[#F7F9FC] to-white rounded-2xl p-6 shadow-sm border border-[#D6E3FF]/60 flex flex-col sm:flex-row items-center justify-between gap-6 flex-1">
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">
                Attendance History
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Want to see your full attendance logs, performance metrics, and
                history across previous months?
              </p>
            </div>
            <button
              onClick={() => navigate("/summary")}
              className="whitespace-nowrap bg-white border-2 border-[#D6E3FF]/50 text-[#0038FF] hover:bg-[#F0F4F8] hover:border-[#0038FF]/30 font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              View Summary
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!viewingReason}
        onClose={() => setViewingReason(null)}
        title={viewingReason ? viewingReason.type + " Reason" : "Reason"}
        size="sm"
      >
        <p className="text-slate-600 leading-relaxed text-sm">
          {viewingReason?.text}
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setViewingReason(null)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all w-full"
          >
            Close
          </button>
        </div>
      </Modal>

      {showReasonModal &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
              <div
                className={`p-6 text-white ${reasonType === "LATE" ? "bg-amber-500" : "bg-orange-500"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold">
                    {reasonType === "LATE"
                      ? "Late Arrival Detected"
                      : "Early Leave Detected"}
                  </h3>
                </div>
                <p className="text-white/80 text-sm">
                  {reasonType === "LATE"
                    ? `You are checking in past the ${status?.toleranceMinutes} minute tolerance limit.`
                    : `You are clocking out before the standard ${status?.workEndTime} end time.`}
                </p>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Please provide a valid reason
                </label>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#0038FF]/50 focus:ring-4 focus:ring-[#0038FF]/10 text-slate-700 resize-none h-28"
                  placeholder="e.g. Traffic jam, Family emergency, Doctor appointment..."
                ></textarea>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowReasonModal(false);
                      setReasonText("");
                    }}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReason}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors shadow-lg ${reasonType === "LATE" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30" : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"}`}
                  >
                    Submit & Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
