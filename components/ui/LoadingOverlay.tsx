"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
}

export function LoadingOverlay({ visible = true, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
          <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin absolute inset-0" />
        </div>
        {message && (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
