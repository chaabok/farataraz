"use client";

import React from "react";
import { clsx } from "clsx";

export interface TooltipProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ children, content, position, side, className }: TooltipProps) {
  if (!content) return <>{children}</>;

  const activePosition = side || position || "top";

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent dark:border-t-gray-100",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent dark:border-b-gray-100",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent dark:border-l-gray-100",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent dark:border-r-gray-100",
  };

  return (
    <div className="group relative inline-block">
      {children}
      <div
        className={clsx(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900",
          positionClasses[activePosition],
          className
        )}
      >
        {content}
        <div
          className={clsx(
            "absolute border-[5px]",
            arrowClasses[activePosition]
          )}
        />
      </div>
    </div>
  );
}
