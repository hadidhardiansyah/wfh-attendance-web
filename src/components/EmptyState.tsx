import React from "react";

interface ActionProps {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  images?: string[];
  singleImage?: string;
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  primaryAction?: ActionProps;
  secondaryAction?: ActionProps;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  singleImage,
  images,
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center max-w-md mx-auto">
    {singleImage ? (
      <div className="flex justify-center mb-4">
        <img
          src={singleImage}
          alt="Empty"
          className="w-40 h-40 object-contain"
        />
      </div>
    ) : images && images.length > 0 ? (
      <div className="flex justify-center -space-x-4 mb-2">
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`relative rounded-full border-4 border-white overflow-hidden shadow-sm ${idx === 1 ? "w-20 h-20 z-10 -translate-y-2" : "w-16 h-16 z-0"}`}
          >
            <img
              src={src}
              alt="avatar"
              className="w-full h-full object-cover object-top"
            />
          </div>
        ))}
      </div>
    ) : icon ? (
      <div className="text-slate-300 w-16 h-16 mb-2">{icon}</div>
    ) : null}

    <h3 className="text-slate-900 font-bold text-xl tracking-tight">{title}</h3>

    {description && (
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    )}

    {(primaryAction || secondaryAction) && (
      <div className="flex items-center gap-3 mt-4">
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm"
          >
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-6 py-2.5 rounded-xl bg-[#0038FF] text-white font-bold text-sm transition-all hover:bg-blue-700 shadow-md shadow-[#0038FF]/20 active:scale-95"
          >
            {primaryAction.label}
          </button>
        )}
      </div>
    )}
  </div>
);
