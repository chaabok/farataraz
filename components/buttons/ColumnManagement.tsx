import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X, LayoutTemplate, Search, Eye, EyeOff, Check, Trash2, RotateCcw, Save } from 'lucide-react';
import { cn, safeStringify } from '@/lib/utils';
import { useLanguage } from '@/components/Providers';

interface ColumnLayout {
  id: string;
  name: string;
  columnVisibility: Record<string, boolean>;
}

export function ColumnManagement({ table, displayKey = "main-grid" }: { table: any, displayKey?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, direction: dir } = useLanguage();
  
  const [savedLayouts, setSavedLayouts] = useState<ColumnLayout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string>('default');
  const [showLayoutSaveInput, setShowLayoutSaveInput] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');

  // Local storage persistence for layouts
  useEffect(() => {
    const stored = localStorage.getItem(`column-layouts-${displayKey}`);
    if (stored) {
      try {
        setSavedLayouts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load layouts", e);
      }
    }
  }, [displayKey]);

  useEffect(() => {
    if (savedLayouts.length > 0) {
      localStorage.setItem(`column-layouts-${displayKey}`, safeStringify(savedLayouts));
    }
  }, [savedLayouts, displayKey]);

  const allColumns = table.getAllLeafColumns().filter((c: any) => c.id !== 'select' && c.id !== 'actions');
  const visibleColumnsCount = allColumns.filter((c: any) => c.getIsVisible()).length;

  const handleToggleColumn = (col: any) => {
    if (!col.getCanHide()) return;
    col.toggleVisibility();
    setActiveLayoutId('custom');
  };

  const handleSaveLayout = () => {
    if (!newLayoutName.trim()) return;
    const visibility: Record<string, boolean> = {};
    table.getAllLeafColumns().forEach((c: any) => {
      visibility[c.id] = c.getIsVisible();
    });
    
    const newLayout: ColumnLayout = {
      id: Date.now().toString(),
      name: newLayoutName,
      columnVisibility: visibility
    };
    setSavedLayouts(prev => [...prev, newLayout]);
    setActiveLayoutId(newLayout.id);
    setNewLayoutName('');
    setShowLayoutSaveInput(false);
  };

  const applyLayout = (layoutId: string) => {
    if (layoutId === 'default') {
      table.resetColumnVisibility();
      setActiveLayoutId('default');
    } else {
      const layout = savedLayouts.find(l => l.id === layoutId);
      if (layout) {
        table.setColumnVisibility(layout.columnVisibility);
        setActiveLayoutId(layoutId);
      }
    }
    setIsOpen(false);
  };

  const deleteLayout = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedLayouts(prev => prev.filter(l => l.id !== id));
    if (activeLayoutId === id) {
        applyLayout('default');
    }
  };

  const handleReset = () => {
    table.resetColumnVisibility();
    setActiveLayoutId('default');
  };

  const handleHideAll = () => {
    const visibility: Record<string, boolean> = {};
    allColumns.forEach((c: any) => {
      visibility[c.id] = false;
    });
    table.setColumnVisibility(visibility);
    setActiveLayoutId('custom');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center p-1.5 rounded transition-colors group relative border",
          isOpen ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        )}
        title={dir === 'rtl' ? 'مدیریت ستون‌ها' : 'Column Management'}
      >
        <Settings2 size={16} />
      </button>

      {/* Overlay to close on click outside */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            dir={dir}
            className={cn(
              "absolute bottom-10 w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-[120] rounded-xl overflow-hidden text-start",
              dir === 'rtl' ? "right-0" : "left-0"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <LayoutTemplate size={16} className="text-slate-500" />
                <span className="text-sm font-bold">{dir === 'rtl' ? 'مدیریت نمایش ستونها' : 'Manage Column Display'}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
            </div>
            
            {/* Search */}
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={dir === 'rtl' ? 'جستجوی ستون...' : 'Search columns...'}
                  className={cn(
                    "w-full text-xs py-1.5 px-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-indigo-500 transition-all",
                    dir === 'rtl' ? "text-right" : "text-left"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  dir={dir}
                />
                <Search size={14} className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", dir === 'rtl' ? "right-2.5" : "left-2.5")} />
              </div>
            </div>

            {/* Columns List */}
            <div className="max-h-[200px] overflow-y-auto px-1 py-2 space-y-0.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              {allColumns
                .filter((c: any) => {
                  const headerTitle = typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id;
                  return headerTitle.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((col: any) => {
                  const headerTitle = typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id;
                  const isVisible = col.getIsVisible();
                  const canHide = col.getCanHide();
                  return (
                    <div 
                      key={col.id} 
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md group transition-colors",
                        canHide ? "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" : "opacity-60 cursor-not-allowed"
                      )} 
                      onClick={() => canHide && handleToggleColumn(col)}
                    >
                      <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <div className={cn(
                          "w-4 h-4 rounded border flex shrink-0 items-center justify-center transition-colors",
                          isVisible ? (canHide ? "bg-emerald-500 border-emerald-500 text-white" : "bg-gray-400 border-gray-400 text-white") : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        )}>
                          {isVisible && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-semibold truncate">{headerTitle}</span>
                      </div>
                      <div className="flex items-center w-6 shrink-0 justify-center">
                         {!isVisible ? <EyeOff size={16} className="text-slate-400" /> : <Eye size={16} className={canHide ? "text-emerald-500" : "text-gray-400"} />}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Actions & Save */}
            <div className="border-t border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {showLayoutSaveInput ? (
                <div className="p-2">
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={newLayoutName} 
                      onChange={e => setNewLayoutName(e.target.value)}
                      className={cn(
                        "w-full text-xs py-2 border rounded border-emerald-200 dark:border-emerald-800 dark:bg-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dark:text-white",
                        dir === 'rtl' ? "text-right pr-3 pl-16" : "text-left pl-3 pr-16"
                      )}
                      placeholder={dir === 'rtl' ? 'نام تنظیمات...' : 'Layout name...'}
                    />
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 flex items-center gap-1",
                      dir === 'rtl' ? "left-1.5" : "right-1.5"
                    )}>
                      <button 
                        onClick={() => setShowLayoutSaveInput(false)}
                        className="p-1 rounded-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={dir === 'rtl' ? 'انصراف' : 'Cancel'}
                      ><X size={14} strokeWidth={2.5} /></button>
                      <button 
                        onClick={handleSaveLayout}
                        disabled={!newLayoutName.trim()}
                        className="p-1 rounded-sm text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition-colors"
                        title={dir === 'rtl' ? 'ذخیره' : 'Save'}
                      ><Check size={14} strokeWidth={2.5} /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row py-1.5">
                  <button 
                    onClick={handleHideAll}
                    className="flex-1 flex items-center justify-center px-2 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group gap-1.5 border-e border-slate-100 dark:border-slate-800"
                  >
                    <Trash2 size={14} className="shrink-0 text-red-500 group-hover:text-red-600 transition-colors" />
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors whitespace-nowrap">{dir === 'rtl' ? 'حذف همه' : 'Remove all'}</span>
                  </button>
                  <button 
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center px-2 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors group gap-1.5 border-e border-slate-100 dark:border-slate-800"
                  >
                    <RotateCcw size={14} className="shrink-0 text-amber-500 group-hover:text-amber-600 transition-colors" />
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-amber-600 transition-colors whitespace-nowrap">{dir === 'rtl' ? 'بازنشانی' : 'Reset'}</span>
                  </button>
                  <button 
                    onClick={() => setShowLayoutSaveInput(true)}
                    className="flex-1 flex items-center justify-center px-2 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group gap-1.5"
                  >
                    <Save size={14} className="shrink-0 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 transition-colors whitespace-nowrap">{dir === 'rtl' ? 'ذخیره' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Saved Layouts */}
            <div className="bg-emerald-50/50 dark:bg-slate-800/50 p-2 text-slate-700 dark:text-slate-300">
              <div 
                onClick={() => applyLayout('default')}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 cursor-pointer"
              >
                {activeLayoutId === 'default' ? (
                  <div className="w-5 h-5 bg-emerald-500 rounded text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
                ) : (
                  <div className="w-5 h-5 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800" />
                )}
                <span className="text-xs font-bold">{dir === 'rtl' ? 'پیش‌فرض' : 'Default'}</span>
              </div>
              {savedLayouts.length > 0 && savedLayouts.map(layout => (
                <div 
                  key={layout.id}
                  onClick={() => applyLayout(layout.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-md mt-1 hover:bg-white dark:hover:bg-slate-700 cursor-pointer transition-colors group"
                >
                  {activeLayoutId === layout.id ? (
                    <div className="w-5 h-5 bg-emerald-500 rounded text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-emerald-300 dark:group-hover:border-emerald-600 transition-colors" />
                        <button onClick={(e) => deleteLayout(e, layout.id)} className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                      </div>
                  )}
                  <span className="text-xs font-semibold">{layout.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
