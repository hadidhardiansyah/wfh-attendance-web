import { useClickOutside } from '../hooks/useClickOutside';
﻿import React, { useState, useEffect, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  id?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select a date",
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (value) {
        const parsed = parseISO(value);
        if (isValid(parsed)) {
          setCurrentMonth(parsed);
        }
      } else {
        setCurrentMonth(new Date());
      }
    }
  }, [isOpen, value]);

  useClickOutside(ref, () => setIsOpen(false));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    const months = Array.from({ length: 12 }).map((_, i) => ({
      value: i,
      label: format(new Date(2000, i, 1), "MMMM"),
    }));

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }).map(
      (_, i) => currentYear - 50 + i,
    );

    return (
      <div className="flex justify-between items-center mb-6 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex items-center justify-center gap-1">
          <select
            value={currentMonth.getMonth()}
            onChange={(e) => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(parseInt(e.target.value));
              setCurrentMonth(newDate);
            }}
            className="appearance-none bg-transparent text-slate-800 font-bold text-[15px] outline-none cursor-pointer hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors text-center"
          >
            {months.map((m) => (
              <option
                key={m.value}
                value={m.value}
                className="text-slate-700 font-bold"
              >
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={currentMonth.getFullYear()}
            onChange={(e) => {
              const newDate = new Date(currentMonth);
              newDate.setFullYear(parseInt(e.target.value));
              setCurrentMonth(newDate);
            }}
            className="appearance-none bg-transparent text-[#0038FF] font-bold text-[15px] outline-none cursor-pointer hover:bg-blue-50 rounded-lg px-2 py-1 transition-colors text-center"
          >
            {years.map((y) => (
              <option key={y} value={y} className="text-slate-700 font-bold">
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const date = ["S", "M", "T", "W", "T", "F", "S"];
    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          className="text-center font-bold text-[11px] text-slate-400 uppercase tracking-widest py-2"
          key={i}
        >
          {date[i]}
        </div>,
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    const parsedValue = value ? parseISO(value) : null;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;

        const isSelected = parsedValue && isSameDay(day, parsedValue);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        let disabled = false;
        if (minDate && isBefore(startOfDay(day), startOfDay(parseISO(minDate))))
          disabled = true;
        if (maxDate && isAfter(startOfDay(day), startOfDay(parseISO(maxDate))))
          disabled = true;

        days.push(
          <div
            className="flex items-center justify-center aspect-square p-0.5"
            key={day.toString()}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  onChange(format(cloneDay, "yyyy-MM-dd"));
                  setIsOpen(false);
                }
              }}
              className={`
                w-full h-full rounded-xl flex items-center justify-center text-sm font-bold transition-all
                ${!isCurrentMonth ? "text-slate-300" : "text-slate-700"}
                ${disabled ? "opacity-30 cursor-not-allowed bg-slate-50" : "hover:bg-blue-50"}
                ${isSelected ? "bg-[#0038FF] text-white hover:bg-blue-700 shadow-md shadow-[#0038FF]/30 scale-95" : ""}
                ${isToday && !isSelected && !disabled ? "border-2 border-[#D6E3FF] text-[#0038FF]" : ""}
              `}
            >
              {formattedDate}
            </button>
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const displayValue =
    value && isValid(parseISO(value))
      ? format(parseISO(value), "dd MMM yyyy")
      : "";

  return (
    <div className="w-full relative" ref={ref}>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full cursor-pointer`}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <input
          id={id}
          className={`w-full pl-11 pr-4 py-3 bg-[#F0F4F8] border-2 rounded-2xl text-slate-800 text-[15px] font-bold focus:outline-none transition-all cursor-pointer placeholder-slate-400 ${isOpen ? "border-[#0038FF] ring-4 ring-[#0038FF]/10 bg-white" : "border-[#D6E3FF] hover:border-[#0038FF]/50"}`}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
        />
        <div
          className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-colors ${isOpen ? "text-[#0038FF]" : "text-slate-400"}`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-75 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 animate-slide-up origin-top">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      )}
    </div>
  );
};
