import React, { useState } from "react";
import { GroupingState, Table } from "@tanstack/react-table";
import { CopyPlus, X } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/components/Providers";

interface ColumnGroupingProps {
  table: Table<any>;
}

export function ColumnGrouping({ table }: ColumnGroupingProps) {
  const { t } = useLanguage();
  const grouping = table.getState().grouping;
  const setGrouping = table.setGrouping;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const columnId = e.dataTransfer.getData("columnId");
    if (columnId && !grouping.includes(columnId)) {
      setGrouping([...grouping, columnId]);
    }
  };

  const removeGrouping = (columnId: string) => {
    setGrouping(grouping.filter((id) => id !== columnId));
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "flex min-h-[40px] items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 text-sm transition-colors",
        isDragOver && "bg-blue-50/50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
      )}
    >
      {grouping.length === 0 && (
        <div className="flex shrink-0 items-center gap-2 text-gray-500 dark:text-gray-400">
          <CopyPlus className="h-4 w-4" />
          <span>
            {t("drop_column_to_group" as any) ||
              "جهت گروه‌بندی ستون موردنظر خود را در این قسمت بیندازید"}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 flex-1">
        {grouping.map((columnId) => {
          const column = table.getColumn(columnId);
          if (!column) return null;

          return (
            <div
              key={columnId}
              className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 shadow-sm"
            >
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id}
              </span>
              <button
                onClick={() => removeGrouping(columnId)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={t("remove_grouping" as any) || "حذف"}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
