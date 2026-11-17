import React from "react";

interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function PageLoader({
  label = "Loading...",
  fullScreen = false,
  className = "",
}: PageLoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F3]/95 backdrop-blur-xs"
    : "w-full min-h-[50vh] flex flex-col items-center justify-center py-12";

  return (
    <div className={`${containerClasses} ${className} select-none transition-all duration-300`}>
      <div className="relative flex flex-col items-center">
        {/* Animated GIF Image */}
        <div className="relative z-10 flex items-center justify-center">
          <img
            src="/looding.gif"
            alt="Loading..."
            className="w-32 h-auto sm:w-40 object-contain drop-shadow-sm"
          />
        </div>

        {/* Loading Animated Text with Bouncing Dots */}
        <div className="mt-2 flex items-center gap-1 font-display font-semibold text-sm sm:text-base text-gray-700 tracking-wide">
          <span>{label.replace(/\.+$/, "")}</span>
          <span className="inline-flex gap-0.5 text-sky-600 font-black">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
