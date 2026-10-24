"use client";

import React, { useState, useEffect } from 'react';
import { Printer, ChevronDown } from 'lucide-react';
import { cn, escapeHtml, apiFetch } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useLanguage } from '@/components/Providers';

interface PrintDropdownButtonProps {
  targetForm: string; // The identifier to fetch templates
  onPrint?: (reportId?: string, isUserReport?: boolean) => void; // Called either when default is clicked, or custom is selected
  defaultAction?: () => void; // Fallback
  disabled?: boolean;
}

export function PrintDropdownButton({
  targetForm,
  onPrint,
  defaultAction,
  disabled
}: PrintDropdownButtonProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    if (reports.length > 0) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/rpt/reports?targetForm=${targetForm}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      }
    } catch(err) {
      console.error("Failed to load reports for print dropdown:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchReports();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.print-dropdown')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen]);

  const handleItemClick = (report: any) => {
    setIsOpen(false);
    if (onPrint) {
       onPrint(report.reportID, !report.isSystemReport);
    }
  };

  const handleDefaultPrintClick = () => {
     setIsOpen(false);
     if (onPrint) onPrint();
     else if (defaultAction) defaultAction();
  };

  return (
    <div className="relative print-dropdown">
       <div className="flex">
         <Tooltip content={(t as any)('print' as any) || 'چاپ'} position="bottom">
           <button
             onClick={handleDefaultPrintClick}
             disabled={disabled}
             className={cn(
               "h-[30px] px-2 rounded-r-md transition-all border outline-none border-l-0 flex items-center justify-center font-bold text-sm",
               disabled
                 ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
                 : "bg-white border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
             )}
           >
             <Printer className="w-4 h-4 ml-1.5" />
             {(t as any)('print' as any) || 'چاپ'}
           </button>
         </Tooltip>
         
         <button
           onClick={handleOpenDropdown}
           disabled={disabled}
           className={cn(
             "h-[30px] px-1 rounded-l-md transition-all border outline-none flex items-center justify-center",
             disabled
               ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
               : "bg-blue-50 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white",
             isOpen ? "bg-blue-600 text-white" : ""
           )}
         >
           <ChevronDown className="w-3 h-3" />
         </button>
       </div>

       {isOpen && (
         <div className="absolute left-0 top-[110%] bg-white border border-gray-200 rounded shadow-xl w-48 z-50 overflow-hidden dark:bg-gray-800 dark:border-gray-700 pb-1 pt-1">
            <div className="text-[10px] text-gray-500 bg-gray-50 px-3 py-1 font-bold border-b border-gray-200 dark:bg-gray-900 mb-1">
               قالب‌های چاپ
            </div>
            {loading ? (
              <div className="px-3 py-2 text-xs text-gray-500">در حال بارگزاری...</div>
            ) : reports.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-gray-400 text-center">هیچ طراحی جایگزینی یافت نشد</div>
            ) : (
              reports.map((rp, i) => (
                <button
                  key={i}
                  className="w-full text-right px-3 py-1.5 text-[13px] hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-gray-200 transition-colors flex items-center gap-2 font-medium text-gray-800"
                  onClick={() => handleItemClick(rp)}
                >
                  <Printer className="w-3 h-3 opacity-50" />
                  {rp.title || `قالب ${i + 1}`}
                  {rp.isDefaultTemplate && <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded leading-none">پیش‌فرض</span>}
                </button>
              ))
            )}
            
            <div className="border-t border-gray-100 mt-1 pt-1 dark:border-gray-700">
               <button
                  className="w-full text-right px-3 py-1.5 text-[12px] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium"
                  onClick={handleDefaultPrintClick}
               >
                  چاپ ساده (پیش‌فرض سیسم)
               </button>
            </div>
         </div>
       )}
    </div>
  );
}
