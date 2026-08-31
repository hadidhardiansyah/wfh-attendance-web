import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: boolean;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent,
  trend,
}) => (
  <div
    className={`card relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${
      accent ? "border-lime/30 glow-lime" : ""
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="section-title mb-2">{label}</p>
        <p
          className={`text-2xl sm:text-3xl font-bold ${accent ? "text-lime" : "text-white"}`}
        >
          {value}
        </p>
        {trend && <p className="text-xs text-white/40 mt-1">{trend}</p>}
      </div>
      {icon && (
        <div
          className={`p-3 rounded-xl ${accent ? "bg-lime/10 text-lime" : "bg-white/05 text-white/40"}`}
        >
          {icon}
        </div>
      )}
    </div>
    {accent && (
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-lime/50 to-transparent" />
    )}
  </div>
);
