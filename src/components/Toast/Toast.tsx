import React from "react";
import { type Toast as ToastType, useToastStore } from "../../store/toastStore";

export const Toast: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast);

  const getConfig = () => {
    switch (toast.type) {
      case "error":
        return {
          bg: "bg-gradient-to-r from-[#FFF0EF] to-white",
          iconColor: "text-[#EF4444]",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          ),
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-[#FFF8E6] to-white",
          iconColor: "text-[#F59E0B]",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          ),
        };
      case "success":
        return {
          bg: "bg-gradient-to-r from-[#ECFDF5] to-white",
          iconColor: "text-[#10B981]",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-gradient-to-r from-[#EFF6FF] to-white",
          iconColor: "text-[#3B82F6]",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          ),
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className={`relative w-80 sm:w-96 flex p-4 rounded-2xl shadow-sm border border-gray-50/50 mb-3 animate-slide-up cursor-pointer overflow-hidden ${config.bg}`}
      onClick={() => removeToast(toast.id)}
    >
      <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm mr-4 z-10">
        <span className={config.iconColor}>{config.icon}</span>
      </div>
      <div className="flex-1 z-10">
        <h3 className="text-[15px] font-semibold text-slate-800 mb-1 leading-tight">
          {toast.title}
        </h3>
        <p className="text-sm text-slate-500 leading-snug">{toast.message}</p>
      </div>
    </div>
  );
};
