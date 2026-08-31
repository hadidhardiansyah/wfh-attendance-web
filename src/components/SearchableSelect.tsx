import { useClickOutside } from '../hooks/useClickOutside';
﻿import React, { useState, useEffect, useRef } from "react";

interface Option {
  id: string;
  name: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-[#F0F4F8]/60 border-2 rounded-xl text-slate-800 font-bold transition-all flex items-center justify-between cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed border-[#D6E3FF]/30" : "border-[#D6E3FF]/60 hover:border-[#0038FF]/50"} ${isOpen ? "border-[#0038FF] bg-white" : ""}`}
      >
        <span
          className={`truncate pr-2 ${selectedOption ? "text-slate-800" : "text-slate-400 font-medium"}`}
          title={selectedOption ? selectedOption.name : placeholder}
        >
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg
          className={`shrink-0 w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden animate-slide-up origin-top">
          <div className="p-2 border-b border-slate-50">
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#0038FF]/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  title={opt.name}
                  className={`px-3 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors truncate ${
                    value === opt.id
                      ? "bg-[#0038FF]/10 text-[#0038FF]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-slate-400 font-medium">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
