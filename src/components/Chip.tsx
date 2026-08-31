import React from "react";

type ColorSchema = "blue" | "emerald" | "red" | "dark" | "default";

export interface ChipProps {
  label: string;
  count?: number | string;
  active?: boolean;
  colorSchema?: ColorSchema;
  onClick?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  count,
  active = false,
  colorSchema = "blue",
  onClick,
  className = "",
}) => {
  const getColors = () => {
    if (!active) {
      return "bg-white text-slate-500 hover:bg-slate-50 border-[#D6E3FF]/60";
    }

    switch (colorSchema) {
      case "blue":
        return "bg-[#0038FF] text-white shadow-md shadow-[#0038FF]/20 border-[#0038FF]";
      case "emerald":
        return "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-500";
      case "red":
        return "bg-rose-500 text-white shadow-md shadow-rose-500/20 border-rose-500";
      case "dark":
        return "bg-slate-800 text-white shadow-md border-slate-800";
      case "default":
      default:
        return "bg-slate-800 text-white shadow-md border-slate-800";
    }
  };

  const getBadgeColors = () => {
    if (!active) {
      return "bg-slate-100 text-slate-400";
    }
    return "bg-white/20 text-white";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${getColors()} ${className}`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold leading-none ${getBadgeColors()}`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
