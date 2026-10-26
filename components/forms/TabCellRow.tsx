import React, { useState } from 'react';
import { cn, safeStringify } from '@/lib/utils';
import { Plus, X, Copy, ClipboardPaste, Sigma } from 'lucide-react';
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export interface TabCellColumn {
  key?: string;
  name?: string;
  header?: string;
  label?: string;
  parentHeader?: string;
  type?: 'text' | 'checkbox' | 'select' | 'number' | 'custom' | 'textarea' | 'amount' | string;
  width?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  defaultValue?: any;
  precision?: number;
  render?: (row: any, rowIndex: number, onChange?: (val: any) => void) => React.ReactNode;
  filterRender?: (col: TabCellColumn, colIndex: number) => React.ReactNode;
  [key: string]: any;
}

export interface TabCellConfig {
  id?: string;
  name?: string;
  label?: string;
  header?: string;
  key?: string;
  icon?: React.ReactNode;
  canClose?: boolean;
  onClose?: (tabId: string) => void;
  columns?: TabCellColumn[];
  footerRender?: (data: any[]) => React.ReactNode;
  type?: string;
  width?: string;
  render?: (row: any, rowIndex: number, onChange?: (val: any) => void) => React.ReactNode;
  [key: string]: any;
}

export interface TabCellRowProps {
  tabs: TabCellConfig[] | TabCellColumn[] | any[];
  value?: Record<string, any[]> | any[];
  onChange?: (value: any) => void;
  className?: string;
  hideHeader?: boolean;
  hideAddButton?: boolean;
  disableAddButton?: boolean;
  hideDeleteButton?: boolean;
  hideCopyPaste?: boolean;
  isReadonly?: boolean;
  onActiveRowChange?: (tabId: string, rowIndex: number | null, rowData: any) => void;
  onRowDoubleClick?: (tabId: string, rowIndex: number | null, rowData: any) => void;
  footerActions?: React.ReactNode;
  footerLeftActions?: React.ReactNode;
  footerCenterContent?: React.ReactNode;
  rowClassName?: (row: any, rowIndex: number, activeTab?: string) => string;
  condensed?: boolean;
  hideSumRow?: boolean;
  showSumRow?: boolean;
  onTabClose?: (tabId: string) => void;
  onAddTab?: () => void;
  addTabTitle?: string;
  dir?: 'rtl' | 'ltr';
}

let globalCopiedRow: any = null;

export function TabCellRow({ 
  tabs, 
  value = {}, 
  onChange, 
  className, 
  hideHeader = false,
  hideAddButton = false,
  disableAddButton = false,
  hideDeleteButton = false,
  hideCopyPaste = false,
  isReadonly = false,
  onActiveRowChange,
  onRowDoubleClick,
  footerActions,
  footerLeftActions,
  footerCenterContent,
  rowClassName,
  condensed = false,
  hideSumRow = false,
  showSumRow: showSumRowProp,
  onTabClose,
  onAddTab,
  addTabTitle,
  dir: dirProp
}: TabCellRowProps) {
  const normalizedTabs: TabCellConfig[] = React.useMemo(() => {
    if (!tabs || (Array.isArray(tabs) && tabs.length === 0)) return [];
    if (Array.isArray(tabs)) {
      const first = tabs[0];
      if (first && typeof first === 'object' && ('columns' in first || 'id' in first)) {
        return tabs.map((t: any, idx: number) => ({
          id: t.id || `tab_${idx}`,
          label: t.label || t.title || '',
          icon: t.icon,
          disabled: Boolean(t.disabled),
          canClose: t.canClose,
          onClose: t.onClose,
          columns: t.columns || [],
          footerRender: t.footerRender,
        }));
      }
      return [{ id: 'default_tab', label: '', columns: tabs as any[] }];
    }
    return [];
  }, [tabs]);

  const [activeTab, setActiveTab] = useState(normalizedTabs[0]?.id);
  const [data, setData] = useState<Record<string, any[]>>({});
  const [selectedRowIndices, setSelectedRowIndices] = useState<Record<string, number | null>>({});
  const [colWidths, setColWidths] = useState<Record<string, Record<string, number>>>({});
  const [showSumRow, setShowSumRow] = useState(!hideSumRow && (showSumRowProp !== undefined ? showSumRowProp : true));

  React.useEffect(() => {
    if (hideSumRow) {
      setShowSumRow(false);
    } else if (showSumRowProp !== undefined) {
      setShowSumRow(showSumRowProp);
    }
  }, [hideSumRow, showSumRowProp]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const getColKey = React.useCallback((col: any, idx: number) => col?.key || col?.name || `col_${idx}`, []);
  const getColHeader = React.useCallback((col: any) => col?.header || col?.label || '', []);

  const handleMouseDown = (e: React.MouseEvent, tabId: string, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const thElement = (e.target as HTMLElement).closest('th');
    const startWidth = thElement ? thElement.getBoundingClientRect().width : 150;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const isRTL = document.documentElement.dir === 'rtl';
      const deltaX = isRTL ? (startX - moveEvent.clientX) : (moveEvent.clientX - startX);
      const newWidth = Math.max(50, startWidth + deltaX);

      setColWidths(prev => ({
        ...prev,
        [tabId]: {
          ...(prev[tabId] || {}),
          [colKey]: newWidth
        }
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const lastValueRef = React.useRef<string>("");

  // Sync internal data with external value
  React.useEffect(() => {
    let targetData: Record<string, any[]> = {};
    if (Array.isArray(value)) {
      if (normalizedTabs.length > 1) {
        targetData = { [normalizedTabs[0].id]: value };
      } else if (normalizedTabs.length === 1) {
        targetData = { [normalizedTabs[0].id]: value };
      }
    } else if (value && typeof value === 'object') {
       if (normalizedTabs.length === 1 && !value[normalizedTabs[0].id] && Object.keys(value).length === 0) {
         targetData = { [normalizedTabs[0].id]: [] };
       } else {
         targetData = value as Record<string, any[]>;
       }
    } else {
      if (normalizedTabs.length === 1) {
        targetData = { [normalizedTabs[0].id]: [] };
      } else {
        targetData = {};
      }
    }

    const stringifiedValue = safeStringify(value);
    if (stringifiedValue !== lastValueRef.current) {
      lastValueRef.current = stringifiedValue;
      setData(targetData);
    }
  }, [value, normalizedTabs]);

  // Sync activeTab if tabs change or if active tab becomes disabled
  React.useEffect(() => {
    if (normalizedTabs.length > 0) {
      const currentTab = normalizedTabs.find(t => t.id === activeTab);
      if (!activeTab || !currentTab || currentTab.disabled) {
        const firstEnabled = normalizedTabs.find(t => !t.disabled);
        if (firstEnabled) {
          setActiveTab(firstEnabled.id);
        }
      }
    }
  }, [normalizedTabs, activeTab]);

  const handleTabClick = (tabId: string) => {
    const tabConfig = normalizedTabs.find(t => t.id === tabId);
    if (tabConfig?.disabled) return;
    setActiveTab(tabId);
  };

  const emitChange = (newData: Record<string, any[]>) => {
    if (normalizedTabs.length === 1) {
      onChange?.(newData[normalizedTabs[0].id] as any);
    } else {
      onChange?.(newData);
    }
  };

  const handleAddRow = () => {
    if (!activeTab || isReadonly || disableAddButton) return;
    
    const tabConfig = normalizedTabs.find(t => t.id === activeTab);
    const newRow: any = { _id: Date.now().toString() };
    tabConfig?.columns.forEach((col, idx) => {
      const cKey = getColKey(col, idx);
      newRow[cKey] = col.defaultValue !== undefined ? col.defaultValue : (col.type === 'checkbox' ? false : '');
    });

    const currentTabData = data[activeTab] || [];
    const newData = {
      ...data,
      [activeTab]: [...currentTabData, newRow]
    };
    
    setData(newData);
    emitChange(newData);
    
    setSelectedRowIndices({
      ...selectedRowIndices,
      [activeTab]: currentTabData.length
    });
    
    onActiveRowChange?.(activeTab, currentTabData.length, newRow);
  };

  const handleRemoveRow = () => {
    if (!activeTab) return;
    const selectedIndex = selectedRowIndices[activeTab];
    if (selectedIndex === undefined || selectedIndex === null) return;
    setIsDeleteModalOpen(true);
  };

  const performRemoveRow = () => {
    if (!activeTab) return;
    const selectedIndex = selectedRowIndices[activeTab];
    if (selectedIndex === undefined || selectedIndex === null) return;

    setIsDeleting(true);
    
    // Simulate loading
    setTimeout(() => {
      const currentTabData = data[activeTab] || [];
      const newTabData = currentTabData.filter((_, i) => i !== selectedIndex);
      
      const newData = {
        ...data,
        [activeTab]: newTabData
      };
      
      setData(newData);
      emitChange(newData);
      
      // Clear selection
      setSelectedRowIndices({
        ...selectedRowIndices,
        [activeTab]: null
      });
      onActiveRowChange?.(activeTab, null, null);
      
      setIsDeleting(false);
      showToast("حذف ردیف با موفقیت انجام شد.", "success");
    }, 500);
  };

  const handleCopyRow = () => {
    if (!activeTab) return;
    const selectedIndex = selectedRowIndices[activeTab];
    if (selectedIndex === undefined || selectedIndex === null) return;
    const currentTabData = data[activeTab] || [];
    if (currentTabData[selectedIndex]) {
      globalCopiedRow = { ...currentTabData[selectedIndex] };
    }
  };

  const handlePasteRow = () => {
    if (!activeTab || !globalCopiedRow) return;
    const selectedIndex = selectedRowIndices[activeTab];
    if (selectedIndex === undefined || selectedIndex === null) return;
    const currentTabData = data[activeTab] || [];
    const currentRow = currentTabData[selectedIndex];

    // Merge copy with current row's ID
    const updatedRow = { ...globalCopiedRow, _id: currentRow._id || Date.now().toString() };
    const newTabData = [...currentTabData];
    newTabData[selectedIndex] = updatedRow;
    
    const newData = { ...data, [activeTab]: newTabData };
    setData(newData);
    emitChange(newData);
    onActiveRowChange?.(activeTab, selectedIndex, updatedRow);
  };

  const handleCellChange = (rowIndex: number, columnKey: string, newValue: any) => {
    if (!activeTab) return;
    const currentTabData = [...(data[activeTab] || [])];
    if (!currentTabData[rowIndex]) return;

    if (Array.isArray(newValue)) {
      if (newValue.length === 0) {
        const updatedRow = {
          ...currentTabData[rowIndex],
          [columnKey]: ''
        };
        currentTabData[rowIndex] = updatedRow;
      } else {
        const firstItem = newValue[0];
        let updatedRow = { ...currentTabData[rowIndex] };

        if (typeof firstItem === 'object' && firstItem !== null) {
          Object.keys(firstItem).forEach(k => {
            if (k !== '_id') {
              updatedRow[k] = firstItem[k];
            }
          });
          if (updatedRow[columnKey] === undefined) {
            updatedRow[columnKey] = firstItem.code || firstItem.id || firstItem;
          }
        } else {
          updatedRow[columnKey] = firstItem;
        }

        currentTabData[rowIndex] = updatedRow;

        let insertIdx = rowIndex + 1;
        for (let i = 1; i < newValue.length; i++) {
          const item = newValue[i];
          // eslint-disable-next-line react-hooks/purity
          const newRow: any = { _id: Date.now().toString() + '_' + i + '_' + Math.random().toString(36).substring(2, 6) };
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(k => {
              if (k !== '_id') {
                newRow[k] = item[k];
              }
            });
            if (newRow[columnKey] === undefined) {
              newRow[columnKey] = item.code || item.id || item;
            }
          } else {
            newRow[columnKey] = item;
          }
          currentTabData.splice(insertIdx, 0, newRow);
          insertIdx++;
        }
      }

      const newData = {
        ...data,
        [activeTab]: currentTabData
      };
      setData(newData);
      emitChange(newData);

      if (selectedRowIndices[activeTab] === rowIndex) {
        onActiveRowChange?.(activeTab, rowIndex, currentTabData[rowIndex]);
      }
      return;
    }

    const updatedRow = (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue))
      ? { ...currentTabData[rowIndex], ...newValue }
      : {
          ...currentTabData[rowIndex],
          [columnKey]: newValue
        };
    
    currentTabData[rowIndex] = updatedRow;
    
    const newData = {
      ...data,
      [activeTab]: currentTabData
    };
    setData(newData);
    emitChange(newData);
    
    if (selectedRowIndices[activeTab] === rowIndex) {
      onActiveRowChange?.(activeTab, rowIndex, updatedRow);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F4') {
      e.preventDefault();
      if (!activeTab) return;
      const selectedIndex = selectedRowIndices[activeTab];
      if (selectedIndex !== undefined && selectedIndex !== null && selectedIndex > 0) {
        const currentTabData = data[activeTab] || [];
        const rowAbove = currentTabData[selectedIndex - 1];
        const currentRow = currentTabData[selectedIndex];
        
        const updatedRow = { ...rowAbove, _id: currentRow._id || Date.now().toString() };
        const newTabData = [...currentTabData];
        newTabData[selectedIndex] = updatedRow;
        
        const newData = { ...data, [activeTab]: newTabData };
        setData(newData);
        emitChange(newData);
        onActiveRowChange?.(activeTab, selectedIndex, updatedRow);
      }
    }
  };

  const currentTabConfig = normalizedTabs.find(t => t.id === activeTab) || normalizedTabs[0];
  const activeColumns = currentTabConfig?.columns || [];
  const currentTabData = data[activeTab] || [];
  const selectedIndex = selectedRowIndices[activeTab];
  const hasAmountColumns = activeColumns.some((col: any) => col.type === 'amount') || false;

  const hasParentHeaders = React.useMemo(() => {
    return activeColumns.some((col: any) => Boolean(col.parentHeader));
  }, [activeColumns]);

  const headerGroups = React.useMemo(() => {
    if (!hasParentHeaders) return [];
    const groups: { parentHeader?: string; columns: { col: any; originalIndex: number }[] }[] = [];
    activeColumns.forEach((col: any, idx: number) => {
      const parent = col.parentHeader ? String(col.parentHeader).trim() : undefined;
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.parentHeader && lastGroup.parentHeader === parent) {
        lastGroup.columns.push({ col, originalIndex: idx });
      } else {
        groups.push({
          parentHeader: parent,
          columns: [{ col, originalIndex: idx }],
        });
      }
    });
    return groups;
  }, [hasParentHeaders, activeColumns]);

  const currentDir = dirProp || (typeof document !== 'undefined' && document.documentElement.dir === 'ltr' ? 'ltr' : 'rtl');
  const isRTL = currentDir === 'rtl';

  const getColumnWidth = React.useCallback((col: any) => {
    const headerText = getColHeader(col);
    const charLen = headerText ? headerText.length : 0;
    const estWidth = Math.max(120, charLen * 11 + 45); // Automatically size based on title
    
    const colKey = col?.key || col?.name;
    const widthVal = colKey ? colWidths[activeTab]?.[colKey] : undefined;
    if (widthVal !== undefined && widthVal !== null) {
      const numW = Number(widthVal);
      if (!isNaN(numW) && numW > 0) {
        return `${Math.max(numW, 30)}px`;
      }
    }
    if (col && col.width !== undefined && col.width !== null) {
      if (typeof col.width === 'number') {
        if (!isNaN(col.width) && col.width > 0) {
          return `${col.width}px`;
        }
      } else if (typeof col.width === 'string') {
        const strW = col.width.trim();
        if (strW.endsWith('px')) {
          const num = parseFloat(strW);
          if (!isNaN(num) && num > 0) return `${num}px`;
        } else if (strW.endsWith('%')) {
          const pct = parseFloat(strW);
          if (!isNaN(pct) && pct > 0) return `${Math.max(Math.round(pct * 10), 30)}px`; 
        } else {
          const num = parseFloat(strW);
          if (!isNaN(num) && num > 0) return `${num}px`;
        }
      }
    }
    return `${estWidth}px`;
  }, [colWidths, activeTab, getColHeader]);

  const totalTableWidth = React.useMemo(() => {
    if (!currentTabConfig) return 100;
    let total = 16; // for the active indicator column
    activeColumns.forEach((col: any) => {
      const wStr = getColumnWidth(col);
      const parsed = parseInt(wStr, 10);
      total += (isNaN(parsed) || parsed <= 0) ? 150 : parsed;
    });
    return (isNaN(total) || total <= 0) ? 100 : total;
  }, [currentTabConfig, activeColumns, getColumnWidth]);

  const handlePreventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      dir={currentDir}
      className={cn("flex flex-col flex-1 w-full h-full bg-white dark:bg-gray-900 overflow-hidden focus-within:ring-1 ring-blue-500 border-none rounded-none shadow-none p-0 m-0", className)}
      onKeyDown={handleKeyDown}
      onDragOver={handlePreventDefault}
      onDrop={handlePreventDefault}
      tabIndex={-1}
    >
      {/* Tabs Header */}
      {!hideHeader && (normalizedTabs.length > 1 || (normalizedTabs.length === 1 && Boolean(normalizedTabs[0].label))) && (
        <div className="relative flex h-10 w-full shrink-0 items-center bg-gray-50 dark:bg-gray-950/80 px-2 py-1 border-b border-gray-300 dark:border-gray-800 shadow-sm z-10 overflow-x-auto overflow-y-hidden gap-2">
          <div className="flex w-max items-center gap-2">
            {normalizedTabs.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const isDisabled = Boolean(tab.disabled);
              return (
                <div
                  key={tab.id ? `tab_${tab.id}_${idx}` : `tab_${idx}`}
                  onClick={() => !isDisabled && handleTabClick(tab.id)}
                  title={isDisabled ? "جهت فعال شدن این تب، ابتدا روی ردیف کالا دبل کلیک کنید" : undefined}
                  className={cn(
                    "group flex h-8 items-center justify-between gap-2.5 rounded-t-lg px-3 py-1 min-w-[120px] text-sm font-medium transition-colors border-b-2 shrink-0 select-none",
                    isDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-200/40 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 border-transparent pointer-events-auto"
                      : isActive 
                        ? "cursor-pointer bg-blue-600 text-white border-blue-800 dark:border-blue-400 shadow-sm" 
                        : "cursor-pointer bg-white text-gray-700 dark:text-gray-300 border-transparent hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {tab.icon ? (
                      <span className="opacity-90 shrink-0 [&_svg]:!h-4 [&_svg]:!w-4">{tab.icon}</span>
                    ) : (
                      <Plus className="h-3.5 w-3.5 opacity-80 shrink-0" />
                    )}
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {(tab.canClose || tab.onClose || onTabClose) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tab.onClose) {
                          tab.onClose(tab.id);
                        } else if (onTabClose) {
                          onTabClose(tab.id);
                        }
                      }}
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100 shrink-0 me-0.5",
                        isActive 
                          ? "hover:bg-white/20 text-white" 
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                      )}
                      title="بستن تب"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {onAddTab && (
            <button
              type="button"
              onClick={onAddTab}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors shrink-0"
              title={addTabTitle || "افزودن تب جدید"}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Grid Content */}
      <fieldset disabled={isReadonly} className="flex-1 min-h-0 overflow-hidden relative border-none p-0 m-0 min-w-0">
        {currentTabConfig && (
          <table 
            className="text-sm text-right border-collapse h-full min-h-full"
            style={{ 
              width: `max(100%, ${totalTableWidth}px)`,
              minWidth: `${totalTableWidth}px`,
              tableLayout: 'fixed'
            }}
          >
             <thead className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky top-0 z-20 shadow-sm">
               {!hasParentHeaders ? (
                 <>
                   <tr>
                     {/* Left-most thin column for active indicator */}
                     <th className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></th>
                     {activeColumns.map((col: any, idx: number) => {
                       const colKey = getColKey(col, idx);
                       const isLast = idx === activeColumns.length - 1;
                       const customWidth = getColumnWidth(col);
                       return (
                         <th 
                           key={`th_${colKey}_${idx}`} 
                           className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-[11px] bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold align-middle text-right relative group"
                           style={{ 
                             width: isLast ? undefined : customWidth, 
                             minWidth: customWidth, 
                             maxWidth: isLast ? undefined : customWidth 
                           }}
                         >
                           <div className="flex items-center justify-between">
                             <span className={String(getColHeader(col)).includes("\n") ? "whitespace-pre-line overflow-visible leading-tight text-center" : "whitespace-nowrap overflow-visible"}>{getColHeader(col)}</span>
                             {col.required && <span className="text-red-500 mr-1">*</span>}
                           </div>
                           {/* Resize handle */}
                           <div
                             onMouseDown={(e) => handleMouseDown(e, activeTab, colKey)}
                             className={cn(
                               "absolute top-0 bottom-0 w-1.5 cursor-col-resize bg-transparent group-hover:bg-gray-400/30 active:bg-blue-500 transition-all z-30",
                               isRTL ? "left-0" : "right-0"
                             )}
                             title="تغییر عرض ستون"
                           />
                         </th>
                       );
                     })}
                   </tr>
                   {activeColumns.some((col: any) => Boolean(col.filterRender)) && (
                     <tr className="bg-slate-800/90 dark:bg-slate-800/90 border-t border-slate-700">
                       <th className="p-1 border-l border-slate-700 w-4 text-center bg-slate-800"></th>
                       {activeColumns.map((col: any, idx: number) => {
                         const colKey = getColKey(col, idx);
                         const isLast = idx === activeColumns.length - 1;
                         const customWidth = getColumnWidth(col);
                         return (
                           <th
                             key={`filter_th_${colKey}_${idx}`}
                             className="p-1 px-1 border-l border-slate-700 font-normal align-middle bg-slate-800/90"
                             style={{
                               width: isLast ? undefined : customWidth,
                               minWidth: customWidth,
                               maxWidth: isLast ? undefined : customWidth,
                             }}
                           >
                             {col.filterRender ? col.filterRender(col, idx) : null}
                           </th>
                         );
                       })}
                     </tr>
                   )}
                 </>
               ) : (
                 <>
                   {/* Top Header Row */}
                   <tr className="border-b border-gray-300 dark:border-gray-700">
                     <th className="p-1 border-l border-b border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal" rowSpan={2}></th>
                     {headerGroups.map((group, groupIdx) => {
                       if (group.parentHeader) {
                         return (
                           <th
                             key={`parent_header_${group.parentHeader}_${groupIdx}`}
                             colSpan={group.columns.length}
                             className="p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-[11px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-bold text-center align-middle"
                           >
                             <div className="flex items-center justify-center w-full">
                               <span className="font-bold text-gray-800 dark:text-gray-100 underline decoration-gray-400 decoration-1 underline-offset-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                 {group.parentHeader}
                               </span>
                             </div>
                           </th>
                         );
                       } else {
                         return group.columns.map(({ col, originalIndex }) => {
                           const colKey = getColKey(col, originalIndex);
                           const isLast = originalIndex === activeColumns.length - 1;
                           const customWidth = getColumnWidth(col);
                           return (
                             <th
                               key={`th_top_standalone_${colKey}_${originalIndex}`}
                               rowSpan={2}
                               className="p-1 px-2 border-l border-b border-gray-300 dark:border-gray-700 text-[11px] bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold align-middle text-right relative group"
                               style={{
                                 width: isLast ? undefined : customWidth,
                                 minWidth: customWidth,
                                 maxWidth: isLast ? undefined : customWidth,
                               }}
                             >
                               <div className="flex items-center justify-between">
                                 <span className="whitespace-nowrap overflow-visible">{getColHeader(col)}</span>
                                 {col.required && <span className="text-red-500 mr-1">*</span>}
                               </div>
                               {/* Resize handle */}
                               <div
                                 onMouseDown={(e) => handleMouseDown(e, activeTab, colKey)}
                                 className={cn(
                                   "absolute top-0 bottom-0 w-1.5 cursor-col-resize bg-transparent group-hover:bg-gray-400/30 active:bg-blue-500 transition-all z-30",
                                   isRTL ? "left-0" : "right-0"
                                 )}
                                 title="تغییر عرض ستون"
                               />
                             </th>
                           );
                         });
                       }
                     })}
                   </tr>
                   {/* Bottom Sub-Header Row */}
                   <tr>
                     {activeColumns.map((col: any, idx: number) => {
                       if (!col.parentHeader) return null;
                       const colKey = getColKey(col, idx);
                       const isLast = idx === activeColumns.length - 1;
                       const customWidth = getColumnWidth(col);
                       return (
                         <th
                           key={`th_sub_${colKey}_${idx}`}
                           className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-[11px] bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-semibold align-middle text-center relative group"
                           style={{
                             width: isLast ? undefined : customWidth,
                             minWidth: customWidth,
                             maxWidth: isLast ? undefined : customWidth,
                           }}
                         >
                           <div className="flex items-center justify-center">
                             <span className="whitespace-nowrap overflow-visible">{getColHeader(col)}</span>
                             {col.required && <span className="text-red-500 mr-1">*</span>}
                           </div>
                           {/* Resize handle */}
                           <div
                             onMouseDown={(e) => handleMouseDown(e, activeTab, colKey)}
                             className={cn(
                               "absolute top-0 bottom-0 w-1.5 cursor-col-resize bg-transparent group-hover:bg-gray-400/30 active:bg-blue-500 transition-all z-30",
                               isRTL ? "left-0" : "right-0"
                             )}
                             title="تغییر عرض ستون"
                           />
                         </th>
                       );
                     })}
                   </tr>
                 </>
               )}
             </thead>
             <tbody>
               {currentTabData.map((row: any, rowIndex: number) => {
                 const rowKey = row._rowUniqueKey || `tr_${activeTab}_${row.id ?? row._id ?? 'r'}_${rowIndex}`;
                 return (
                   <tr 
                     key={rowKey}
                     onClick={() => {
                       setSelectedRowIndices({...selectedRowIndices, [activeTab]: rowIndex});
                       onActiveRowChange?.(activeTab, rowIndex, row);
                     }}
                     onDoubleClick={() => {
                       onRowDoubleClick?.(activeTab, rowIndex, row);
                     }}
                     className={cn(
                       "border-b border-gray-200 dark:border-gray-800 cursor-pointer",
                       selectedIndex === rowIndex ? "bg-blue-50/70 dark:bg-blue-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-800/50", rowClassName?.(row, rowIndex, activeTab)
                     )}
                   >
                      <td className="p-0 border-l border-gray-200 dark:border-gray-800 w-4 bg-gray-100/50 dark:bg-gray-800/50 text-center align-middle h-[1px]">
                        {selectedIndex === rowIndex && (
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-amber-500 inline-block mr-1"></div>
                        )}
                      </td>
                       {activeColumns.map((col: any, idx: number) => {
                         const colKey = getColKey(col, idx);
                         const isLast = idx === activeColumns.length - 1;
                         const customWidth = getColumnWidth(col);
                         const cellVal = row[colKey];
                         return (
                           <td 
                             key={`td_${rowKey}_${colKey}_${idx}`} 
                             className="p-0 border-l border-gray-200 dark:border-gray-800 relative h-[1px]"
                             style={{ 
                               width: isLast ? undefined : customWidth, 
                               minWidth: customWidth, 
                               maxWidth: isLast ? undefined : customWidth 
                             }}
                           >
                              {col.render ? (
                                 <div className="w-full text-[11px] focus:bg-white focus:dark:bg-gray-800 bg-transparent dark:text-gray-200 outline-none h-full relative min-w-0 overflow-hidden tab-cell-no-border flex items-center">
                                   {col.render(row, rowIndex, (val: any) => handleCellChange(rowIndex, colKey, val), cellVal)}
                                 </div>
                              ) : col.type === 'checkbox' ? (
                                 <div className="flex justify-center w-full p-1.5">
                                   <input 
                                     type="checkbox"
                                     checked={!!cellVal}
                                     onChange={(e) => handleCellChange(rowIndex, colKey, e.target.checked)}
                                     onDragStart={(e) => e.preventDefault()}
                                     className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                   />
                                 </div>
                              ) : col.type === 'select' ? (
                                 <select
                                   value={cellVal || ''}
                                   onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value)}
                                   onDragStart={(e) => e.preventDefault()}
                                   className={cn(
                                     "w-full text-[11px] px-1 focus:bg-white focus:dark:bg-gray-800 bg-transparent dark:text-gray-200 outline-none h-full placeholder:text-transparent min-w-0 font-sans",
                                     condensed ? "py-0 text-[10px]" : "py-0.5",
                                     selectedIndex === rowIndex ? "bg-white/50 dark:bg-black/20" : ""
                                   )}
                                 >
                                   <option value=""></option>
                                   {col.options?.map((opt: any, optIdx: number) => {
                                     const optVal = opt.value !== undefined ? opt.value : opt.id !== undefined ? opt.id : optIdx;
                                     const optLbl = opt.label !== undefined ? opt.label : opt.title !== undefined ? opt.title : String(optVal);
                                     return (
                                       <option key={`opt_${optVal}_${optIdx}`} value={optVal}>{optLbl}</option>
                                     );
                                   })}
                                 </select>
                              ) : col.type === 'textarea' ? (
                                 <textarea
                                   value={cellVal || ''}
                                   onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value)}
                                   onDragStart={(e) => e.preventDefault()}
                                   rows={1}
                                   className={cn(
                                     "w-full text-[11px] px-1 focus:bg-white focus:dark:bg-gray-800 bg-transparent dark:text-gray-200 outline-none h-full resize-none min-h-[20px] min-w-0 font-sans",
                                     condensed ? "py-0 text-[10px]" : "py-0.5",
                                     selectedIndex === rowIndex ? "bg-white/50 dark:bg-black/20" : ""
                                   )}
                                 />
                              ) : col.type === 'amount' ? (
                                 <input
                                   type="text"
                                   value={(() => {
                                     const val = cellVal;
                                     if (val === null || val === undefined || val === '') return '';
                                     const numVal = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
                                     if (isNaN(numVal)) return '';
                                     const precision = col.precision !== undefined ? col.precision : 0;
                                     return numVal.toLocaleString('en-US', { 
                                       minimumFractionDigits: precision,
                                       maximumFractionDigits: precision 
                                     });
                                   })()}
                                   onChange={(e) => {
                                       const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                                       handleCellChange(rowIndex, colKey, rawValue);
                                   }}
                                   dir="ltr"
                                   className={cn(
                                     "w-full text-left font-mono text-[11px] px-1 focus:bg-white focus:dark:bg-gray-800 bg-transparent dark:text-gray-200 outline-none h-full placeholder:text-transparent min-w-0",
                                     condensed ? "py-0 text-[10px]" : "py-0.5",
                                     selectedIndex === rowIndex ? "bg-white/50 dark:bg-black/20" : ""
                                   )}
                                 />
                              ) : (
                                 <input
                                   type={col.type === 'number' ? 'number' : 'text'}
                                   value={cellVal || ''}
                                   onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value)}
                                   onDragStart={(e) => e.preventDefault()}
                                   className={cn(
                                     "w-full text-[11px] px-1 focus:bg-white focus:dark:bg-gray-800 bg-transparent dark:text-gray-200 outline-none h-full placeholder:text-transparent min-w-0 font-sans",
                                     condensed ? "py-0 text-[10px]" : "py-0.5",
                                     selectedIndex === rowIndex ? "bg-white/50 dark:bg-black/20" : ""
                                   )}
                                 />
                              )}
                           </td>
                         );
                       })}
                   </tr>
                 );
               })}
               {currentTabData.length === 0 && (
                 <tr>
                   <td colSpan={activeColumns.length + 1} className="p-8 text-center text-gray-400 dark:text-gray-500 select-none text-xs">
                     اطلاعاتی وجود ندارد
                   </td>
                 </tr>
               )}
               {/* Filler row to push footer to the bottom */}
               <tr className="h-full">
                 <td colSpan={activeColumns.length + 1} className="border-0 p-0 m-0"></td>
               </tr>
             </tbody>
             {(() => {
               if (hideSumRow && !currentTabConfig?.footerRender) return null;
               if (!hasAmountColumns && !currentTabConfig?.footerRender) return null;
               if (hasAmountColumns && !showSumRow && !currentTabConfig?.footerRender) return null;
               
               const firstAmountIdx = activeColumns.findIndex((c: any) => c.type === 'amount');

               return (
                 <tfoot className="bg-[#e4e4e4] dark:bg-gray-800 text-gray-700 dark:text-gray-200 sticky bottom-0 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t border-gray-300 dark:border-gray-700 font-bold border-b-2">
                   {hasAmountColumns && showSumRow && (
                     <tr>
                       <td className="p-1 border-l border-gray-300 dark:border-gray-700 w-4 text-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 font-normal"></td>
                       {activeColumns.map((col: any, idx: number) => {
                          const colKey = getColKey(col, idx);
                          const customWidth = getColumnWidth(col);
                          const isLast = idx === activeColumns.length - 1;
                          
                          if (col.type === 'amount') {
                            const total = (currentTabData || []).reduce((sum, row) => {
                              const val = row[colKey];
                              if (val === null || val === undefined || val === '') return sum;
                              const numVal = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
                              return isNaN(numVal) ? sum : sum + numVal;
                            }, 0);
                            const precision = col.precision !== undefined ? col.precision : 0;
                            const formattedTotal = total.toLocaleString('en-US', { 
                              minimumFractionDigits: precision,
                              maximumFractionDigits: precision 
                            });
                            return (
                              <td 
                                key={`foot_${colKey}_${idx}`} 
                                className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left text-[11px] font-mono font-bold"
                                style={{ 
                                  width: isLast ? undefined : customWidth, 
                                  minWidth: customWidth, 
                                  maxWidth: isLast ? undefined : customWidth 
                                }}
                              >
                                {formattedTotal}
                              </td>
                            );
                          }
                          
                          const isLabelCell = idx === (firstAmountIdx !== undefined && firstAmountIdx > 0 ? firstAmountIdx - 1 : 0);

                          return (
                            <td 
                              key={`foot_${colKey}_${idx}`} 
                              className="p-1 px-2 border-l border-gray-300 dark:border-gray-700 text-left text-[11px]"
                              style={{ 
                                width: isLast ? undefined : customWidth, 
                                minWidth: customWidth, 
                                maxWidth: isLast ? undefined : customWidth 
                              }}
                            >
                               {isLabelCell && firstAmountIdx !== undefined && firstAmountIdx > 0 ? <span className="float-right font-normal">جمع:</span> : null}
                               {isLabelCell && firstAmountIdx === 0 && idx === 0 ? <span className="float-right font-normal">جمع:</span> : null}
                            </td>
                          );
                       })}
                     </tr>
                   )}
                   {currentTabConfig?.footerRender && (
                     currentTabConfig.footerRender(currentTabData || [])
                   )}
                 </tfoot>
               );
             })()}
          </table>
        )}
      </fieldset>

      {/* Footer Toolbar */}
      {((!hideAddButton || !hideDeleteButton || !hideCopyPaste) || footerActions || footerLeftActions || footerCenterContent || hasAmountColumns) && (
        <div className="flex items-center justify-between p-0.5 px-2 bg-gradient-to-b from-[#e8e8e8] to-[#d4d4d4] dark:from-gray-800 dark:to-gray-900 border-t border-gray-300 dark:border-gray-700 h-8 shrink-0">
           <div className="flex items-center justify-start gap-1">
             {!hideAddButton && (
               <button
                 type="button"
                 onClick={handleAddRow}
                 disabled={isReadonly || disableAddButton}
                 className="p-1 text-amber-500 hover:text-amber-600 disabled:opacity-30 disabled:pointer-events-none transition-colors drop-shadow-sm"
                 title="افزودن ردیف"
               >
                 <Plus className="w-4 h-4 stroke-[3]" />
               </button>
             )}
             {!hideDeleteButton && (
               <button
                 type="button"
                 onClick={handleRemoveRow}
                 disabled={isReadonly || selectedIndex === undefined || selectedIndex === null}
                 className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30 transition-colors drop-shadow-sm"
                 title="حذف ردیف"
               >
                 <X className="w-4 h-4 stroke-[3]" />
               </button>
             )}
             {!hideCopyPaste && (
               <>
                 <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                 <button
                   type="button"
                   onClick={handleCopyRow}
                   disabled={isReadonly || selectedIndex === undefined || selectedIndex === null}
                   className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-30 transition-colors drop-shadow-sm"
                   title="کپی ردیف"
                 >
                   <Copy className="w-4 h-4" />
                 </button>
                 <button
                   type="button"
                   onClick={handlePasteRow}
                   disabled={isReadonly || selectedIndex === undefined || selectedIndex === null || !globalCopiedRow}
                   className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-30 transition-colors drop-shadow-sm"
                   title="جایگذاری ردیف"
                 >
                   <ClipboardPaste className="w-4 h-4" />
                 </button>
               </>
             )}
             {hasAmountColumns && !hideSumRow && (
               <>
                 {(!hideAddButton || !hideDeleteButton || !hideCopyPaste) && (
                   <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                 )}
                 <button
                   type="button"
                   onClick={() => setShowSumRow(!showSumRow)}
                   className={cn(
                     "p-1 transition-colors drop-shadow-sm",
                     showSumRow ? "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                   )}
                   title={showSumRow ? "مخفی کردن ردیف جمع" : "نمایش ردیف جمع"}
                 >
                   <Sigma className="w-4 h-4" />
                 </button>
               </>
             )}
             {footerActions && (
               <>
                 <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                 {footerActions}
               </>
             )}
           </div>
           {footerCenterContent && (
             <div className="flex-1 flex items-center justify-center px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 select-none overflow-hidden text-ellipsis whitespace-nowrap">
               {footerCenterContent}
             </div>
           )}
           <div className="flex items-center justify-end gap-1">
             {footerLeftActions}
           </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="حذف ردیف"
        message="آیا از حذف این ردیف اطمینان دارید؟"
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          performRemoveRow();
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <LoadingOverlay visible={isDeleting} message="در حال حذف..." />
    </div>
  );
}
