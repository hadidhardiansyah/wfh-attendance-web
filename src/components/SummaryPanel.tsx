import React from "react";

export type SummaryCardColorSchema =
  | "emerald"
  | "amber"
  | "orange"
  | "rose"
  | "blue"
  | "slate";

export interface SummaryCardProps {
  id: string;
  title: string;
  subtitle: string;
  value: number | string;
  colorSchema: SummaryCardColorSchema;
  isActive?: boolean;
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  subtitle,
  value,
  colorSchema,
  isActive = false,
  onClick,
}) => {
  const getStyles = () => {
    switch (colorSchema) {
      case "emerald":
        return {
          bg: "bg-emerald-50/50",
          border: "border-emerald-400",
          ring: "ring-emerald-100",
          dot: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
          text: "text-slate-800",
        };
      case "amber":
        return {
          bg: "bg-amber-50/50",
          border: "border-amber-400",
          ring: "ring-amber-100",
          dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]",
          text: "text-slate-800",
        };
      case "orange":
        return {
          bg: "bg-orange-50/50",
          border: "border-orange-400",
          ring: "ring-orange-100",
          dot: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]",
          text: "text-slate-800",
        };
      case "rose":
        return {
          bg: "bg-rose-50/50",
          border: "border-rose-400",
          ring: "ring-rose-100",
          dot: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
          text: "text-slate-800",
        };
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-[#0038FF]/50",
          ring: "ring-[#0038FF]/20",
          dot: "bg-[#0038FF] shadow-[0_0_10px_rgba(0,56,255,0.4)]",
          text: "text-[#0038FF]",
        };
      case "slate":
      default:
        return {
          bg: "bg-slate-50/50",
          border: "border-slate-100",
          ring: "ring-slate-100",
          dot: "bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.4)]",
          text: "text-slate-800",
        };
    }
  };

  const styles = getStyles();
  const defaultStyles = {
    bg: colorSchema === "blue" ? "bg-blue-50/30" : "bg-slate-50/50",
    border: colorSchema === "blue" ? "border-blue-100" : "border-slate-100",
    text: colorSchema === "blue" ? "text-[#0038FF]" : "text-slate-800",
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md hover:bg-white group ${onClick ? "cursor-pointer" : ""} ${isActive ? `${styles.bg} ${styles.border} shadow-sm ring-2 ${styles.ring}` : `${defaultStyles.bg} ${defaultStyles.border}`}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full group-hover:scale-125 transition-transform ${styles.dot}`}
        ></div>
        <div>
          <p className="font-bold text-slate-700">{title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>
      <span
        className={`text-2xl sm:text-3xl font-bold ${isActive ? styles.text : defaultStyles.text}`}
      >
        {value}
      </span>
    </div>
  );
};

export interface SummaryPanelProps {
  title: string;
  subtitle: string;
  cards: SummaryCardProps[];
  className?: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  title,
  subtitle,
  cards,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-4xl p-6 sm:p-8 shadow-sm border border-[#D6E3FF]/60 flex flex-col gap-6 ${className}`}
    >
      <div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-4">
        {cards.map((card, idx) => (
          <React.Fragment key={card.id}>
            {idx === cards.length - 1 && (
              <hr className="border-t-2 border-dashed border-slate-200 my-1" />
            )}
            <SummaryCard {...card} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
