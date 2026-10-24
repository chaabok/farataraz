"use client";

import React, { useState } from 'react';
import { Printer, X, LayoutTemplate, FileText, Check, Settings2 } from 'lucide-react';
import { cn, escapeHtml } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useLanguage } from '@/components/Providers';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrintConfigStore, PrintConfig } from '@/lib/stores/printConfigStore';

interface PrintDropdownDataProps {
  data: any[];
  columns: { key: string; label: string; hidden?: boolean }[];
  title?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
  companyName?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export const PrintDropdownData: React.FC<PrintDropdownDataProps> = ({
  data,
  columns,
  title,
  className,
  dir: propDir,
  companyName: propCompanyName = "شرکت توسعه فناوری اطلاعات",
  onOpenChange
}) => {
  const { t, direction: contextDir } = useLanguage();
  const dir = propDir || contextDir;
  const isRtl = dir === 'rtl';

  const [showSettings, setShowSettings] = useState(false);

  const handleOpenSettings = () => {
    setShowSettings(true);
    onOpenChange?.(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    onOpenChange?.(false);
  };

  const { getConfig, setConfig } = usePrintConfigStore();
  const formId = title || 'default';
  const settings = getConfig(formId);
  const setSettings = (newSettings: Partial<PrintConfig> | ((prev: PrintConfig) => Partial<PrintConfig>)) => {
    if (typeof newSettings === 'function') {
      const current = getConfig(formId);
      setConfig(formId, newSettings(current));
    } else {
      setConfig(formId, newSettings);
    }
  };


  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const visibleColumns = columns.filter(col => !col.hidden);
    const reportTitle = title || (t as any)('report') || 'گزارش اطلاعات';
    
    // Generate simple HTML for printing
    const html = `
      <!DOCTYPE html>
      <html dir="${dir}">
        <head>
          <meta charset="UTF-8">
          <title>${reportTitle}</title>
          <style>
            @font-face {
              font-family: 'Tahoma';
              src: local('Tahoma');
            }
            @page {
              size: ${settings.orientation};
              margin: 0;
            }
            body { 
              font-family: 'Tahoma', 'Vazir', sans-serif; 
              padding: 1.5cm;
              margin: 0;
              color: #333;
              line-height: 1.6;
              font-size: 11px;
            }
            .header-container {
              display: grid;
              grid-template-columns: 1fr 2fr 1fr;
              width: 100%;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #3b82f6;
            }
            .header-center {
              text-align: center;
              grid-column: 2;
              grid-row: 1 / span 2;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 4px;
            }
            .header-right {
              grid-column: ${isRtl ? 1 : 3};
              grid-row: 1 / span 2;
            }
            .header-left {
              grid-column: ${isRtl ? 3 : 1};
              grid-row: 1 / span 2;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: ${isRtl ? 'flex-end' : 'flex-start'};
              font-size: 10px;
              color: #444;
              white-space: nowrap;
              gap: 4px;
            }
            .header-title {
              margin: 0;
              font-size: 18px;
              color: #1e3a8a;
              font-weight: bold;
            }
            .company-name {
              font-size: 13px;
              color: #475569;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px; 
              table-layout: auto;
            }
            th, td { 
              border: 1px solid #cbd5e1; 
              padding: 8px 6px; 
              text-align: ${isRtl ? 'right' : 'left'}; 
            }
            th { 
              background-color: #f1f5f9; 
              color: #334155;
              font-weight: bold;
              white-space: nowrap;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              padding: 10px 0;
              border-top: 1px solid #f1f5f9;
            }
            
            /* Print Specifics */
            @media print {
              .no-print { display: none; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th colspan="100%" style="border: none; padding: 0; background: none;">
                  <div class="header-container">
                    <div class="header-left">
                      ${settings.showDate ? `<div>${isRtl ? 'تاریخ گزارش:' : 'Report Date:'} ${new Date().toLocaleDateString(isRtl ? 'fa-IR' : 'en-US')}</div>` : ''}
                    </div>
                    <div class="header-center">
                      <div class="header-title">${escapeHtml(reportTitle)}</div>
                      ${settings.showCompanyName ? `<div class="company-name">${escapeHtml(settings.companyName)}</div>` : ''}
                    </div>
                    <div class="header-right"></div>
                  </div>
                </th>
              </tr>
              <tr>
                <th style="width: 40px; text-align: center;">${isRtl ? 'ردیف' : 'No.'}</th>
                ${visibleColumns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map((item, i) => `
                <tr>
                  <td style="text-align: center;">${i + 1}</td>
                  ${visibleColumns.map(col => `<td>${escapeHtml(item[col.key] || '')}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer no-print">
            <p>این گزارش توسط سیستم مدیریت هوشمند به صورت خودکار ایجاد شده است.</p>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const toggleSetting = (key: keyof PrintConfig) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  return (
    <>
      <Tooltip content={(t as any)('print') || 'چاپ گزارش'} position="top">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenSettings();
          }}
          className={cn(
            "h-[22px] w-[22px] rounded-md transition-all border flex items-center justify-center",
            "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-slate-300 hover:text-blue-600",
            className
          )}
        >
          <Printer className="w-[13px] h-[13px]" />
        </button>
      </Tooltip>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                    <Settings2 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">تنظیمات چاپ گزارش</h3>
                </div>
                <button 
                  onClick={handleCloseSettings}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Orientation */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <LayoutTemplate className="w-3 h-3" /> جهت صفحه
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSettings((s: PrintConfig) => ({ ...s, orientation: 'portrait' }))}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] transition-all",
                        settings.orientation === 'portrait' 
                          ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 font-bold" 
                          : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className={cn("w-2.5 h-3.5 border-2 rounded-[1px]", settings.orientation === 'portrait' ? "border-blue-400" : "border-slate-300")} />
                      عمودی
                    </button>
                    <button
                      onClick={() => setSettings((s: PrintConfig) => ({ ...s, orientation: 'landscape' }))}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] transition-all",
                        settings.orientation === 'landscape' 
                          ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 font-bold" 
                          : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className={cn("w-3.5 h-2.5 border-2 rounded-[1px]", settings.orientation === 'landscape' ? "border-blue-400" : "border-slate-300")} />
                      افقی
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> گزینه‌های نمایش
                  </label>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'showDate', label: 'نمایش تاریخ گزارش' },
                      { id: 'showCompanyName', label: 'نمایش نام شرکت' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleSetting(item.id as keyof PrintConfig)}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-right"
                      >
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </span>
                        <div className={cn(
                          "w-4 h-4 rounded flex items-center justify-center border transition-all",
                          settings[item.id as keyof PrintConfig] 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700"
                        )}>
                          {settings[item.id as keyof PrintConfig] && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Name Input */}
                {settings.showCompanyName && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-1">نام شرکت</label>
                    <input 
                      type="text" 
                      value={settings.companyName}
                      onChange={(e) => setSettings((s: PrintConfig) => ({ ...s, companyName: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] focus:border-blue-500 outline-none transition-all"
                      placeholder="نام شرکت را وارد کنید..."
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  تایید و چاپ گزارش
                </button>
                <button
                  onClick={handleCloseSettings}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
