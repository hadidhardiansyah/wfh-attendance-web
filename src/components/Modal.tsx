import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const sizes = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-2xl" };

  const modalContent = (
    <div className="fixed inset-0 z-100 flex justify-center animate-fade-in sm:items-center sm:p-4 items-end p-0 lg:pl-(--sidebar-width,0px) transition-[padding] duration-300">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-white border border-[#D6E3FF] shadow-2xl animate-slide-up overflow-hidden
          sm:rounded-3xl
          rounded-t-4xl rounded-b-none pb-safe
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden bg-[#F0F4F8]/50">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F0F4F8]/50 sm:pt-5">
          <h2 className="font-bold text-lg text-slate-800 tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors bg-white shadow-sm sm:bg-transparent sm:shadow-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 bg-white max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
