"use client";

import React, { useState, useEffect } from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { ChevronDown, Search } from "lucide-react";
import { apiFetch, cn } from "@/lib/utils";

interface SimpleSelectDropDownProps {
  listApiUrl: string;
  displayKey: string;
  valueKey?: string;
  value: any;
  onChange: (item: any) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  labelWidth?: string;
  alignVertical?: boolean;
}

export function SimpleSelectDropDown({
  listApiUrl,
  displayKey,
  valueKey = "id",
  value,
  onChange,
  label,
  required,
  error,
  placeholder = "انتخاب کنید...",
  disabled,
  labelWidth,
  alignVertical,
}: SimpleSelectDropDownProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const urlObj = new URL(listApiUrl, window.location.origin);
        urlObj.searchParams.set("pageSize", "100");
        if (search) {
          urlObj.searchParams.set("search", search);
        }
        const res = await apiFetch(urlObj.toString());
        if (res.ok) {
          const json = await res.json();
          let items = Array.isArray(json) ? json : json.items || (json.data && json.data.items) || (Array.isArray(json.data) ? json.data : []);
          setOptions(items);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [listApiUrl, search]);

  const selectedItem = value ? options.find((opt) => opt[valueKey] === value || opt.id === value?.id || opt.partyId === value?.partyId) || value : null;
  const displayValue = selectedItem ? selectedItem[displayKey] || (value && value[displayKey]) || "" : "";

  return (
    <FormFieldWrapper label={label} required={required} error={error} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className="relative w-full">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex items-center w-full px-3 h-[25px] text-[11px] bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 rounded transition-all cursor-pointer",
            error ? "border-rose-500" : "hover:border-indigo-400 focus:border-indigo-500",
            disabled ? "opacity-70 cursor-not-allowed" : ""
          )}
        >
          <span className="flex-1 text-slate-900 dark:text-slate-100 font-medium truncate">{displayValue || placeholder}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full pl-2 pr-8 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-3 text-center text-xs text-slate-500">در حال بارگذاری...</div>
              ) : options.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">موردی یافت نشد</div>
              ) : (
                options.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    {opt[displayKey] || `${opt.firstName || ''} ${opt.lastName || ''}`.trim()}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {isOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        )}
      </div>
    </FormFieldWrapper>
  );
}
