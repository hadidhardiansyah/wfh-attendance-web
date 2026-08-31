import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../../services";
import type { User } from "../../../types";
import { PageLoader, Loader } from "../../../components/Loader";
import { toast } from "../../../services/toast";
import { Modal } from "../../../components/Modal";

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReasonType, setSuspendReasonType] = useState("Resigned");
  const [customReason, setCustomReason] = useState("");

  const suspendReasons = [
    "Resigned",
    "Terminated",
    "Temporary Leave",
    "Disciplinary Action",
    "Other",
  ];

  useEffect(() => {
    if (id) {
      loadEmployee(id);
    }
  }, [id]);

  const loadEmployee = async (empId: string) => {
    try {
      const data = await adminService.getEmployee(empId);
      setEmployee(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee details");
      navigate("/admin/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = () => {
    if (!employee) return;

    if (employee.isActive !== false) {
      setSuspendReasonType("Resigned");
      setCustomReason("");
      setSuspendModalOpen(true);
    } else {
      reactivateEmployee();
    }
  };

  const reactivateEmployee = async () => {
    if (!employee) return;
    setToggling(true);
    try {
      await adminService.updateEmployee(employee.id, {
        isActive: true,
        suspendReason: null,
      });
      setEmployee({ ...employee, isActive: true, suspendReason: null });
      toast.success("Employee account reactivated successfully");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update account status",
      );
    } finally {
      setToggling(false);
    }
  };

  const confirmSuspend = async () => {
    if (!employee) return;
    setToggling(true);

    const finalReason =
      suspendReasonType === "Other" ? customReason : suspendReasonType;
    if (suspendReasonType === "Other" && !customReason.trim()) {
      toast.error("Please provide a custom reason");
      setToggling(false);
      return;
    }

    try {
      await adminService.updateEmployee(employee.id, {
        isActive: false,
        suspendReason: finalReason,
      });
      setEmployee({ ...employee, isActive: false, suspendReason: finalReason });
      toast.success("Employee account suspended successfully");
      setSuspendModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to suspend account");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!employee) return null;

  const isSuspended = employee.isActive === false;

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-6 pb-10">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate("/admin/employees")}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0038FF] transition-colors font-bold text-[15px]"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to List
        </button>
      </div>

      <div className="bg-white rounded-4xl shadow-sm border border-[#D6E3FF]/60 overflow-hidden relative">
        <div
          className={`h-32 sm:h-48 w-full ${isSuspended ? "bg-slate-300" : "bg-linear-to-r from-[#0038FF]/10 via-[#0038FF]/5 to-[#0038FF]/10"}`}
        ></div>

        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex items-end gap-5">
              <div className="relative">
                <div
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl bg-[#F0F4F8] flex items-center justify-center overflow-hidden z-10 ${isSuspended ? "grayscale opacity-70" : ""}`}
                >
                  {employee.photoUrl ? (
                    <img
                      src={employee.photoUrl}
                      alt={employee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className={`w-16 h-16 ${isSuspended ? "text-slate-400" : "text-[#0038FF]/40"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div
                  className={`absolute bottom-3 right-3 w-6 h-6 rounded-full border-[3px] border-white z-20 ${
                    isSuspended ? "bg-red-500" : "bg-emerald-500"
                  }`}
                ></div>
              </div>

              <div className="pb-2 hidden sm:block">
                <h1
                  className={`text-xl md:text-xl sm:text-2xl lg:text-2xl font-bold tracking-tight truncate ${isSuspended ? "text-slate-500" : "text-slate-800"}`}
                >
                  {employee.name}
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-slate-500 font-bold text-[13px] md:text-[15px] lg:text-base truncate">
                    {employee.position || "No Position"}
                  </p>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[9px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider ${
                      employee.role === "admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {employee.role}
                  </span>
                  {isSuspended && (
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wider">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:pb-2">
              <button
                onClick={() => navigate(`/admin/employees/${employee.id}/edit`)}
                className="flex-1 sm:flex-none h-9 px-3 md:h-10 md:px-4 lg:h-10.5 lg:px-5 text-xs md:text-sm lg:text-base bg-white border border-[#D6E3FF] hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>

              <button
                onClick={handleToggleClick}
                disabled={toggling}
                className={`flex-1 sm:flex-none h-9 px-3 md:h-10 md:px-4 lg:h-10.5 lg:px-5 text-xs md:text-sm lg:text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md ${
                  isSuspended
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                }`}
              >
                {toggling ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      {isSuspended ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      )}
                    </svg>
                    {isSuspended ? "Reactivate" : "Suspend"}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="sm:hidden mb-6">
            <h1
              className={`text-xl md:text-xl sm:text-2xl lg:text-2xl font-bold tracking-tight truncate ${isSuspended ? "text-slate-500" : "text-slate-800"}`}
            >
              {employee.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <p className="text-slate-500 font-bold text-[13px] md:text-[15px] lg:text-base w-full truncate">
                {employee.position || "No Position"}
              </p>
              <span
                className={`px-2.5 py-0.5 rounded-lg text-[9px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider ${
                  employee.role === "admin"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {employee.role}
              </span>
              {isSuspended && (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wider">
                  Suspended
                </span>
              )}
            </div>
          </div>

          {isSuspended && employee.suspendReason && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
              <div className="mt-0.5 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-bold text-[15px]">
                  Account Suspended
                </h3>
                <p className="text-red-700 text-[14px] mt-0.5 font-medium">
                  Reason:{" "}
                  <span className="font-bold truncate">
                    {employee.suspendReason}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F0F4F8]/50 rounded-3xl p-5 border border-[#D6E3FF]/40">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0038FF]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Email Address
                </span>
              </div>
              <p className="text-slate-800 font-bold ml-11 text-[13px] md:text-[15px] lg:text-base truncate">
                {employee.email}
              </p>
            </div>

            <div className="bg-[#F0F4F8]/50 rounded-3xl p-5 border border-[#D6E3FF]/40">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0038FF]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Phone Number
                </span>
              </div>
              <p className="text-slate-800 font-bold ml-11 text-[13px] md:text-[15px] lg:text-base truncate">
                {employee.phone || "Not provided"}
              </p>
            </div>

            <div className="bg-[#F0F4F8]/50 rounded-3xl p-5 border border-[#D6E3FF]/40">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0038FF]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <span className="text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Employee NIK
                </span>
              </div>
              <p className="text-slate-800 font-bold ml-11 text-[13px] md:text-[15px] lg:text-base truncate">
                {employee.nik || "-"}
              </p>
            </div>

            <div className="bg-[#F0F4F8]/50 rounded-3xl p-5 border border-[#D6E3FF]/40">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0038FF]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Employment Info
                </span>
              </div>
              <div className="ml-11 mt-1 flex flex-col gap-1">
                <p className="text-slate-700 text-sm truncate">
                  <span className="font-bold text-slate-400 mr-2">Divisi:</span>{" "}
                  <span className="font-bold truncate">
                    {employee.department?.name || "-"}
                  </span>
                </p>
                <p className="text-slate-700 text-sm truncate">
                  <span className="font-bold text-slate-400 mr-2">
                    Departemen:
                  </span>{" "}
                  <span className="font-bold truncate">
                    {employee.division?.name || "-"}
                  </span>
                </p>
                <p className="text-slate-700 text-sm flex items-center gap-2">
                  <span className="font-bold text-slate-400">Status:</span>
                  <span className="px-2 py-0.5 rounded text-[9px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                    {employee.employmentStatus || "Permanent"}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-[#F0F4F8]/50 rounded-3xl p-5 border border-[#D6E3FF]/40 md:col-span-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0038FF]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Registered Date
                </span>
              </div>
              <p className="text-slate-800 font-bold ml-11 text-[13px] md:text-[15px] lg:text-base truncate">
                {employee.createdAt
                  ? new Date(employee.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={suspendModalOpen}
        onClose={() => !toggling && setSuspendModalOpen(false)}
        title="Suspend Employee"
        size="md"
      >
        <div className="sm:p-2 space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-2 mx-auto">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Why are you suspending this account?
            </h3>
            <p className="text-sm text-slate-500 font-medium px-4">
              Providing a reason helps maintain a clear audit trail. This user
              will immediately lose access to the system.
            </p>
          </div>

          <div className="bg-[#F0F4F8]/60 p-4 rounded-2xl border border-[#D6E3FF]/50 space-y-3 mt-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Reason
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suspendReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSuspendReasonType(reason)}
                  className={`py-3 px-4 rounded-xl text-[14px] font-bold text-left transition-all border-2 ${
                    suspendReasonType === reason
                      ? "border-[#0038FF] bg-blue-50 text-[#0038FF]"
                      : "border-transparent bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {suspendReasonType === "Other" && (
              <div className="mt-3 animate-slide-up">
                <input
                  type="text"
                  placeholder="Type custom reason here..."
                  className="w-full px-4 py-3 bg-white border-2 border-[#D6E3FF] rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:ring-4 focus:ring-[#0038FF]/10 outline-none transition-all placeholder:font-normal"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 py-2.5 px-3 md:py-3 md:px-4 lg:py-3.5 lg:px-5 text-xs md:text-sm lg:text-base bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              onClick={() => setSuspendModalOpen(false)}
              disabled={toggling}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-2.5 px-3 md:py-3 md:px-4 lg:py-3.5 lg:px-5 text-xs md:text-sm lg:text-base bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              onClick={confirmSuspend}
              disabled={toggling}
            >
              {toggling ? <Loader size="sm" /> : "Confirm Suspend"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
