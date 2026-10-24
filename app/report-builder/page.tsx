'use client';

import React, { useState, useEffect } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout/legacy';
import type { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useLanguage } from '@/components/Providers';
import { Layers, FileText, Database, Plus, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

const ResponsiveGridLayout = WidthProvider(GridLayout);

type FieldSource = {
  id: string;
  name: string;
  type: string;
};

const AVAILABLE_FIELDS: FieldSource[] = [
  { id: 'f_title', name: 'عنوان گزارش', type: 'text' },
  { id: 'f_table', name: 'جدول داده ها', type: 'table' },
  { id: 'f_chart', name: 'نمودار آماری', type: 'chart' },
  { id: 'f_date', name: 'تاریخ چاپ', type: 'date' },
  { id: 'f_sum', name: 'مجموع (فرمول)', type: 'formula' },
];

export default function ReportBuilder() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [items, setItems] = useState<{ id: string; type: string; title: string; content?: string }[]>([]);
  const [draggedItem, setDraggedItem] = useState<FieldSource | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrop = (layoutSet: any, layoutItem: any, event: any) => {
    if (draggedItem) {
      // Prevent Duplicate key "drop" bug in react-grid-layout
      // The dropped element creates a layout item. We need to assign it a unique key.
      const newId = `item_${new Date().getTime()}`;
      const newItem = {
        i: newId,
        x: layoutItem?.x || 0,
        y: layoutItem?.y || 0,
        w: 4,
        h: 2,
      };
      
      setLayout((prev) => [...prev, newItem]);
      setItems((prev) => [...prev, { 
        id: newId, 
        type: draggedItem.type, 
        title: draggedItem.name,
      }]);
      setDraggedItem(null);
    }
  };

  const removeItem = (id: string) => {
    setLayout((prev) => prev.filter(l => l.i !== id));
    setItems((prev) => prev.filter(i => i.id !== id));
  };

  const handleSave = () => {
    try {
      // simulate saving properly without circular reference
      const serializedLayout = layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
      console.log('Saved layout:', JSON.stringify(serializedLayout));
      showToast('گزارش با موفقیت ذخیره شد', 'success');
    } catch (err) {
      console.error(err);
      showToast('خطا در ذخیره‌سازی گزارش', 'error');
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800" dir="rtl">
      
      {/* Sidebar Tool Palette */}
      <div className="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          ابزار گزارش ساز
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-sm text-slate-500 font-semibold mb-3">ابزارهای موجود (بکشید و رها کنید)</h3>
          <div className="space-y-2">
            {AVAILABLE_FIELDS.map(field => (
              <div 
                key={field.id}
                draggable
                onDragStart={(e) => {
                  setDraggedItem(field);
                  e.dataTransfer.setData('text/plain', field.id);
                  // React-grid-layout requires we set drop item globally or pass data
                }}
                className="p-3 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 cursor-move hover:border-indigo-400 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{field.name}</span>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded">
                  {field.type}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
           <button 
             onClick={handleSave}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-2 flex items-center justify-center gap-2 transition-colors font-medium text-sm"
           >
             <Save className="w-4 h-4" />
             ذخیره قالب گزارش
           </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-8">
        <div className="max-w-5xl mx-auto min-h-[800px] bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
           
           <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
             <div className="flex flex-col">
               <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-indigo-500" />
                 گزارش ساز داینامیک
               </h2>
               <p className="text-xs text-slate-500 mt-1">عناصر را از منوی سمت راست بکشید و اینجا رها کنید</p>
             </div>
           </div>

           <div className="p-4 min-h-[700px]">
             {layout.length === 0 && (
               <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                 <Plus className="w-8 h-8 mb-2 opacity-50" />
                 <p>هیچ فیلدی اضافه نشده است</p>
               </div>
             )}

             <ResponsiveGridLayout
               className="layout"
               layout={layout}
               cols={12}
               rowHeight={50}
               width={1000}
               isDroppable={true}
               onDrop={handleDrop}
               droppingItem={{ i: 'drop', w: 4, h: 2, x: 0, y: 0 }}
               onLayoutChange={(newLayout) => {
                 setLayout(newLayout.filter(l => l.i !== 'drop'));
               }}
               compactType="vertical"
               useCSSTransforms={true}
             >
               {items.map(item => (
                 <div 
                   key={item.id} 
                   className="bg-white dark:bg-slate-700 border-2 border-indigo-200 dark:border-indigo-800 rounded-md shadow-sm group relative overflow-hidden"
                 >
                   <div className="absolute top-0 right-0 left-0 bg-indigo-50 dark:bg-indigo-900/30 p-1 pl-2 border-b border-indigo-100 dark:border-indigo-800 flex justify-between items-center cursor-move handle">
                     <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 px-1">{item.title}</span>
                     <button 
                       onClick={() => removeItem(item.id)}
                       onMouseDown={(e) => e.stopPropagation()}
                       className="text-red-400 hover:text-red-600 bg-white dark:bg-slate-800 rounded-sm p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Trash2 className="w-3 h-3" />
                     </button>
                   </div>
                   <div className="p-4 pt-8 h-full flex items-center justify-center text-slate-400 text-sm">
                     {item.type === 'table' ? (
                        <div className="w-full h-full border border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">پیش نمایش جدول</div>
                     ) : item.type === 'chart' ? (
                       <div className="w-full h-full border border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">نمودار</div>
                     ) : (
                       <div className="w-full border-b border-dashed border-slate-300 mt-2"></div>
                     )}
                   </div>
                 </div>
               ))}
             </ResponsiveGridLayout>
           </div>
        </div>
      </div>
    </div>
  );
}
