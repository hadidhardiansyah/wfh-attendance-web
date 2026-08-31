import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = "md", text }) => {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-2 border-white/10 border-t-lime animate-spin`}
      />
      {text && <p className="text-sm text-white/50">{text}</p>}
    </div>
  );
};

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader size="lg" text="Loading..." />
  </div>
);
