"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckSquare, Square, ChevronDown } from "lucide-react";
import { cn, formatDateByLocale } from "@/lib/utils";
import { useLanguage } from "@/components/Providers";

export interface Column {
  key: string;
  header: string;
}

const EMPTY_ARRAY: any[] = [];

export function MultiColumnDropdown<T extends { id?: string | number }>({ 
  trigger, 
  data = EMPTY_ARRAY as T[], 
  columns, 
  displayKey,
  onChange,
  onAdd,
  onEdit,
  onDelete,
  onEditRows,
  onDeleteRows,
  enableMultiSelection,
  enableEdit,
  enableDelete,
}: { 
  trigger?: (toggle: () => void) => React.ReactNode;
  data: T[];
  columns: Column[];
  displayKey: keyof T;
  onChange?: (item: T | T[]) => void;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onEditRows?: (items: T[]) => void;
  onDeleteRows?: (items: T[]) => void;
  enableMultiSelection?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (item: T) => {
    if (enableMultiSelection) {
      const isSelected = selectedItems.some((s) => s === item);
      const newSelection = isSelected 
        ? selectedItems.filter((s) => s !== item)
        : [...selectedItems, item];
      setSelectedItems(newSelection);
      onChange?.(newSelection);
    } else {
      onChange?.(item);
      setOpen(false);
    }
  };

  const isSelected = (item: T) => selectedItems.some((s) => s === item);

  const defaultTrigger = (toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      <span className="truncate">
        {selectedItems.length > 0 
          ? selectedItems.map(s => String(s[displayKey])).join(', ')
          : 'انتخاب کنید...'}
      </span>
      <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
    </button>
  );

  return (
    <div className="relative block w-full h-full text-left" ref={dropdownRef}>
      {trigger ? trigger(() => setOpen(!open)) : defaultTrigger(() => setOpen(!open))}
      {open && (
        <div className="absolute z-10 mt-2 max-h-96 w-auto overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-white/10" dir="rtl">
          <table className="min-w-max divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {enableMultiSelection && (
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="sr-only">انتخاب</span>
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.key} scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    {col.header}
                  </th>
                ))}
                {(enableEdit || enableDelete) && (
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="sr-only">عملیات</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {data.map((item, idx) => (
                <tr 
                  key={item.id ?? idx} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={(e) => {
                    // Prevent triggering selection when clicking actions
                    if ((e.target as HTMLElement).closest('.action-btn')) return;
                    handleSelect(item);
                  }}
                >
                  {enableMultiSelection && (
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {isSelected(item) ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </td>
                  )}
                  {columns.map((col) => {
                    const colKey = String(col?.key || '');
                    const colHeader = String(col?.header || (col as any)?.label || (col as any)?.title || '');
                    const isDateCol = colKey.toLowerCase().includes('date') || colHeader.includes('تاریخ');
                    const val = item && colKey ? item[colKey as keyof T] : undefined;
                    const displayVal = isDateCol && val ? formatDateByLocale(String(val), language) : String(val ?? '');
                    
                    return (
                      <td key={col.key} className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                        {displayVal}
                      </td>
                    );
                  })}
                  {(enableEdit || enableDelete) && (
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex gap-2">
                        {enableEdit && (
                          <button
                            type="button"
                            className="action-btn text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => onEdit?.(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {enableDelete && (
                          <button
                            type="button"
                            className="action-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => onDelete?.(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (enableMultiSelection ? 1 : 0) + ((enableEdit || enableDelete) ? 1 : 0)} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    داده‌ای یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {onAdd && (
            <div className="border-t border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-700/50">
              <button
                type="button"
                onClick={onAdd}
                className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                افزودن مورد جدید
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
