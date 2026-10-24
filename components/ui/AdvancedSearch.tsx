import React, { useState, useEffect } from "react";
import { Plus, Trash2, Filter, X, Check } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/components/Providers";

export type FilterOperator =
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "empty"
  | "notEmpty";

export const filterOptions: { val: FilterOperator; label: string }[] = [
  { val: "contains", label: "شامل" },
  { val: "notContains", label: "شامل نشود" },
  { val: "startsWith", label: "شروع با" },
  { val: "endsWith", label: "پایان با" },
  { val: "equals", label: "برابر با" },
  { val: "notEquals", label: "نابرابر با" },
  { val: "empty", label: "خالی باشد" },
  { val: "notEmpty", label: "خالی نباشد" },
];

export type LogicalOperator = "and" | "or";

export interface AdvancedFilterCondition {
  id: string;
  logicalOp: LogicalOperator;
  columnId: string;
  operator: FilterOperator;
  value: string;
}

interface AdvancedSearchProps {
  columns: { key: string; header: string | React.ReactNode }[];
  onSearch: (conditions: AdvancedFilterCondition[]) => void;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function AdvancedSearch({ columns, onSearch, isOpen = true, onOpen, onClose }: AdvancedSearchProps) {
  const { t, direction } = useLanguage();
  const [conditions, setConditions] = useState<AdvancedFilterCondition[]>([]);

  // Filter out select or empty columns
  const filterableColumns = columns.filter(c => c.key !== "select" && typeof c.header === "string");

  // Keep internal state if no props provided for backward compatibility
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isActuallyOpen = (onOpen || onClose) ? isOpen : internalIsOpen;

  const handleOpen = () => {
    if (onOpen) onOpen();
    else setInternalIsOpen(true);
  };

  const handleClose = () => {
    if (onClose) onClose();
    else setInternalIsOpen(false);
  };

  const addCondition = React.useCallback((index?: number) => {
    const newCondition: AdvancedFilterCondition = {
      id: Math.random().toString(36).substring(7),
      logicalOp: "and",
      columnId: filterableColumns[0]?.key || "",
      operator: "contains",
      value: "",
    };

    setConditions(prev => {
        const newConditions = [...prev];
        if (typeof index === "number") {
          newConditions.splice(index + 1, 0, newCondition);
        } else {
          newConditions.push(newCondition);
        }
        return newConditions;
    });
  }, [filterableColumns]);

  const removeCondition = (id: string) => {
    const newConditions = conditions.filter((c) => c.id !== id);
    setConditions(newConditions);
  };

  const updateCondition = (id: string, field: keyof AdvancedFilterCondition, value: string) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleApply = () => {
    onSearch(conditions);
  };

  const handleClear = () => {
    setConditions([]);
    onSearch([]);
    handleClose();
  };

  if (!isActuallyOpen) {
    return null;
  }

  return (
    <div className="mx-2 mb-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
          {t("advanced_search" as any) || "جستجوی پیشرفته"}
        </h4>
        <button 
          onClick={handleClear}
          className="text-gray-500 hover:text-red-500 transition-colors p-1"
          title={t("clear" as any) || "بستن و پاک کردن"}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {conditions.length === 0 && (
           <div className="text-sm text-gray-500 dark:text-gray-400 p-2 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded bg-white/50 dark:bg-gray-800/50">
             {t("no_conditions" as any) || "هیچ شرطی اضافه نشده است. برای افزودن کلیک کنید."}
           </div>
        )}
        {conditions.map((condition, index) => (
          <div key={condition.id} className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
            
            {/* Logical Operator (only for index > 0) */}
            <select
              value={condition.logicalOp}
              onChange={(e) => updateCondition(condition.id, "logicalOp", e.target.value)}
              className={clsx(
                "p-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500",
                index === 0 && "opacity-0 w-0 p-0 m-0 border-0 overflow-hidden pointer-events-none"
              )}
            >
              <option value="and">{t("and" as any) || "و"}</option>
              <option value="or">{t("or" as any) || "یا"}</option>
            </select>

            {/* Column Selector */}
            <select
              value={condition.columnId}
              onChange={(e) => updateCondition(condition.id, "columnId", e.target.value)}
              className="p-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 min-w-[120px]"
            >
              <option value="" disabled>{t("select_column" as any) || "ستون را انتخاب کنید"}</option>
              {filterableColumns.map(col => (
                <option key={col.key} value={col.key}>
                  {String(col.header)}
                </option>
              ))}
            </select>

            {/* Operator Selector */}
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(condition.id, "operator", e.target.value)}
              className="p-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500"
            >
              {filterOptions.map(op => (
                <option key={op.val} value={op.val}>{op.label}</option>
              ))}
            </select>

            {/* Value Input */}
            <input
              type="text"
              value={condition.value}
              onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
              disabled={condition.operator === "empty" || condition.operator === "notEmpty"}
              placeholder="..."
              className="p-1 flex-1 min-w-[150px] border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />

            {/* Actions for this row */}
            <div className="flex items-center gap-1 shrink-0 mt-2 sm:mt-0">
              <button 
                onClick={() => addCondition(index)}
                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded transition-colors"
                title={t("add_condition" as any) || "افزودن شرط"}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => removeCondition(condition.id)}
                className="p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded transition-colors"
                title={t("remove_condition" as any) || "حذف شرط"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
        <button
          onClick={() => addCondition()}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t("add_condition" as any) || "افزودن شرط جدید"}</span>
        </button>

        {conditions.length > 0 && (
          <button
            onClick={handleApply}
            className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{t("apply_filter" as any) || "اعمال فیلتر"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
