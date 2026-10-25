"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, RotateCcw } from "lucide-react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  values: string[];
  onChange: (vals: string[]) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  placeholder?: string;
  labelWidth?: string;
  alignVertical?: boolean;
  /**
   * Task 70: اختیاری — والد با این کال‌بک فهرست را دوباره واکشی می‌کند؛
   * هر بار پنل باز شود و با کلیک روی دکمه بروزرسانی فراخوانی می‌شود.
   */
  onRefresh?: () => void | Promise<void>;
}

export function MultiSelect({ label, values, onChange, options, required, error, placeholder, labelWidth, alignVertical, onRefresh }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Task 70: رفرش خودکار لیست هر بار پنل باز می‌شود + دکمه بروزرسانی پنل
  const wasOpenRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // همگام‌سازی ref در effect (نه حین رندر)
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  const handleRefresh = async () => {
    const fn = onRefreshRef.current;
    if (!fn || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fn();
    } catch (err) {
      console.error('onRefresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      handleRefresh();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const selectedOptions = options.filter(opt => values.includes(opt.value));

  return (
    <FormFieldWrapper label={label} required={required} error={error} alignTop={selectedOptions.length > 0} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className="relative" ref={containerRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full min-h-[25px] px-3 py-1 flex flex-wrap gap-1.5 bg-gray-50 dark:bg-slate-800 border rounded-lg focus-within:border-indigo-500 transition-all outline-none cursor-pointer",
            error 
              ? "border-rose-500 ring-rose-500/20 ring-1" 
              : "border-gray-200 dark:border-slate-700"
          )}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map(opt => (
              <span key={opt.value} className="flex items-center gap-1 px-2 py-0 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                {opt.label}
                <X 
                  className="w-2.5 h-2.5 cursor-pointer hover:text-indigo-900 dark:hover:text-indigo-100" 
                  onClick={(e) => { e.stopPropagation(); toggle(opt.value); }}
                />
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 self-center">{placeholder}</span>
          )}
          <ChevronDown className="ms-auto w-4 h-4 text-gray-400 pointer-events-none self-center" />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in duration-200">
            {onRefresh && (
              <div className="flex justify-end px-2 pt-1 pb-1 border-b border-gray-100 dark:border-slate-700/60 mb-1">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors"
                  title="بروزرسانی لیست"
                  aria-label="بروزرسانی لیست"
                >
                  <RotateCcw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-indigo-500")} />
                </button>
              </div>
            )}
            {options.map(opt => {
              const checked = values.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`px-4 py-1.5 text-[11px] cursor-pointer flex items-center justify-between transition-colors ${
                    checked ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {opt.label}
                  {checked && <Check className="w-4 h-4" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
}
