"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, 
  Search, 
  X, 
  Check, 
  CheckSquare, 
  Square, 
  Filter, 
  RotateCcw 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormFieldWrapper } from './FormFieldWrapper';

export interface MultiSelectColumn {
  key: string;
  label: string;
  width?: string | number;
  renderItem?: (item: any) => React.ReactNode;
}

export interface MultiSelectDropDownProps<T = any> {
  data?: T[];
  options?: T[];
  columns: MultiSelectColumn[];
  value?: T | T[] | number | string | null;
  valueKey?: string;
  displayKey: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  alignVertical?: boolean;
  labelWidth?: string;
  onChange: (selected: T | T[] | null) => void;
  /**
   * Task 70: اختیاری — والد با این کال‌بک فهرست را دوباره واکشی می‌کند؛
   * هر بار پنل باز شود و با کلیک روی دکمه بروزرسانی پنل فراخوانی می‌شود.
   */
  onRefresh?: () => void | Promise<void>;
}

export function MultiSelectDropDown<T extends Record<string, any>>({
  data,
  options,
  columns,
  value,
  valueKey = "ItemID",
  displayKey,
  placeholder = "انتخاب کنید...",
  label,
  required = false,
  error,
  disabled = false,
  alignVertical = false,
  labelWidth,
  onChange,
  onRefresh
}: MultiSelectDropDownProps<T>) {
  const items = useMemo(() => data || options || [], [data, options]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Task 70: رفرش خودکار لیست هر بار پنل باز می‌شود + دکمه بروزرسانی هدر پنل
  const wasOpenRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // همگام‌سازی ref در effect (نه حین رندر) تا آخرین کال‌بک والد خوانده شود
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

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 600 });

  useEffect(() => {
    if (!value) {
      setSelectedItems([]);
      return;
    }
    if (Array.isArray(value)) {
      setSelectedItems(value);
    } else if (typeof value === 'object') {
      setSelectedItems([value]);
    } else {
      const found = items.find((it) => String(it[valueKey]) === String(value));
      if (found) setSelectedItems([found]);
      else setSelectedItems([]);
    }
    // Re-syncing on `isOpen` too: closing the panel without pressing «تایید»
    // (e.g. clicking outside) discards the uncommitted toggles, so reopening
    // always reflects the value the parent actually holds.
  }, [value, items, valueKey, isOpen]);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 360;

      let top = rect.bottom + window.scrollY + 4;
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        top = rect.top + window.scrollY - dropdownHeight - 4;
      }

      const dropWidth = Math.max(rect.width, 550);
      let left = rect.left + window.scrollX;
      if (left + dropWidth > window.innerWidth - 10) {
        left = window.innerWidth - dropWidth - 10;
      }

      setDropdownPos({
        top,
        left: Math.max(10, left),
        width: dropWidth,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      setTimeout(() => searchInputRef.current?.focus(), 50);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase().trim();
    return items.filter((item) => {
      if (!item) return false;
      return columns.some((col) => {
        if (!col || !col.key) return false;
        const val = item[col.key];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
      });
    });
  }, [items, searchTerm, columns]);

  const toggleItemSelection = (item: T) => {
    const itemId = item[valueKey];
    // Functional update: never derive from the stale `selectedItems` closure.
    // The previous closure-based version made rapid/synchronous toggles
    // (e.g. two rows clicked in the same tick) overwrite each other and
    // silently drop selections.
    setSelectedItems((prev) => {
      const isAlreadySelected = prev.some((it) => it[valueKey] === itemId);
      if (isAlreadySelected) {
        return prev.filter((it) => it[valueKey] !== itemId);
      }
      return [...prev, item];
    });
  };

  const handleSelectRowDirectly = (item: T) => {
    toggleItemSelection(item);
  };

  const handleApplySelection = () => {
    onChange(selectedItems.length > 0 ? selectedItems : null);
    setIsOpen(false);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...filteredItems]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems([]);
    onChange(null);
  };

  const displayText = useMemo(() => {
    if (selectedItems.length === 0) return "";
    if (selectedItems.length === 1) {
      return String(selectedItems[0][displayKey] || selectedItems[0][valueKey] || "");
    }
    // Show the actual selected titles (Persian comma separated) instead of a
    // bare count — in ERP forms users must see what is committed; the trigger
    // span truncates long lists.
    return selectedItems
      .map((it) => String(it?.[displayKey] ?? it?.[valueKey] ?? ""))
      .filter(Boolean)
      .join("، ");
  }, [selectedItems, displayKey, valueKey]);

  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={error}
      alignVertical={alignVertical}
      labelWidth={labelWidth}
    >
      <div ref={containerRef} className="relative w-full text-[12px] font-sans">
        <div
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={cn(
            "flex items-center justify-between w-full min-h-[32px] px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg cursor-pointer transition-all duration-150 select-none",
            error ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600",
            isOpen && "ring-2 ring-blue-500/20 border-blue-500 dark:border-blue-500",
            disabled && "bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-70"
          )}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
            {displayText ? (
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                {displayText}
              </span>
            ) : (
              <span className="truncate text-slate-400 dark:text-slate-500">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 mr-1">
            {selectedItems.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="پاک کردن"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
          </div>
        </div>

        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
              zIndex: 99999,
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-[12px] animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Header Search & Actions */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو در تمام ستون‌ها..."
                  className="w-full pr-8 pl-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                title="انتخاب همه"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>همه</span>
              </button>

              {onRefresh && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors"
                  title="بروزرسانی لیست"
                  aria-label="بروزرسانی لیست"
                >
                  <RotateCcw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-indigo-500")} />
                </button>
              )}

              <button
                type="button"
                onClick={handleApplySelection}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium flex items-center gap-1 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>تایید</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="max-h-[280px] overflow-auto select-none">
              <table className="w-full text-right border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 z-10 text-[11px]">
                  <tr>
                    <th className="p-2 w-10 text-center border-l border-slate-200/60 dark:border-slate-700/60">
                      #
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        style={{ width: (col.width && !isNaN(Number(col.width))) ? Number(col.width) : undefined }}
                        className="p-2 font-medium border-l border-slate-200/60 dark:border-slate-700/60 last:border-l-0"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-6 text-center text-slate-400 dark:text-slate-500">
                        موردی یافت نشد
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const itemId = item[valueKey];
                      const isSelected = selectedItems.some((it) => it[valueKey] === itemId);

                      return (
                        <tr
                          key={itemId || idx}
                          onClick={() => handleSelectRowDirectly(item)}
                          className={cn(
                            "cursor-pointer transition-colors duration-150 hover:bg-blue-50/60 dark:hover:bg-blue-900/20",
                            isSelected && "bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium"
                          )}
                        >
                          <td className="p-2 text-center border-l border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleItemSelection(item)}
                              className="inline-flex items-center justify-center p-0.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </td>
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="p-2 border-l border-slate-100 dark:border-slate-800 last:border-l-0 truncate max-w-[200px]"
                            >
                              {col.renderItem
                                ? col.renderItem(item)
                                : item && col?.key && item[col.key] !== undefined && item[col.key] !== null
                                ? String(item[col.key])
                                : "-"}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Status */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>
                تعداد کل: {items.length} | نمایش: {filteredItems.length}
              </span>
              <span>
                انتخاب شده: {selectedItems.length}
              </span>
            </div>
          </div>,
          document.body
        )}
      </div>
    </FormFieldWrapper>
  );
}

export default MultiSelectDropDown;
