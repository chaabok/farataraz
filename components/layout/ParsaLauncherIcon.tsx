'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ParsaLauncherIconProps {
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ParsaLauncherIcon({ isOpen, onClick, className }: ParsaLauncherIconProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      title="منوی فرم‌های پارسا ERP (منوی شروع)"
      className={clsx(
        "group relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 outline-none select-none",
        isOpen
          ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-105 ring-2 ring-blue-400/50"
          : "bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:scale-105 active:scale-95",
        className
      )}
    >
      {/* Background Glow */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/20 via-cyan-400/10 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />

      {/* Modern Parsa ERP Stylized Emblem (Custom 3D Module Grid / Emblem) */}
      <div className="relative flex h-5 w-5 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
        >
          {/* Top-Left Gem */}
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="2.5"
            className={clsx(
              "transition-colors duration-300",
              isOpen ? "fill-white" : "fill-blue-500 group-hover:fill-blue-400"
            )}
          />
          {/* Top-Right Gem */}
          <rect
            x="13"
            y="3"
            width="8"
            height="8"
            rx="2.5"
            className={clsx(
              "transition-colors duration-300 opacity-90",
              isOpen ? "fill-cyan-200" : "fill-cyan-400 group-hover:fill-cyan-300"
            )}
          />
          {/* Bottom-Left Gem */}
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="2.5"
            className={clsx(
              "transition-colors duration-300 opacity-85",
              isOpen ? "fill-indigo-200" : "fill-indigo-500 group-hover:fill-indigo-400"
            )}
          />
          {/* Bottom-Right Gem (Special Accent with Parsa Dot) */}
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2.5"
            className={clsx(
              "transition-colors duration-300",
              isOpen ? "fill-emerald-300" : "fill-teal-400 group-hover:fill-teal-300"
            )}
          />
          {/* Center Connection Dot */}
          <circle
            cx="12"
            cy="12"
            r="1.8"
            className={clsx(
              "transition-colors duration-300",
              isOpen ? "fill-blue-900" : "fill-white"
            )}
          />
        </svg>
      </div>
    </button>
  );
}
