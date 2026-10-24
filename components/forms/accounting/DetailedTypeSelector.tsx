import React, { useState, useEffect } from 'react';
import { X, Search, Tag, AppWindow, Plus } from 'lucide-react';
import { useLookupStore } from '@/lib/stores/lookupStore';
import { useTabs } from '@/components/TabsProvider';

export function DetailedTypeSelector({ onClose }: { onClose: () => void }) {
  const [types, setTypes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addTab } = useTabs();
  const { fetchLookup } = useLookupStore();

  const fetchTypes = async () => {
    try {
      const data = await fetchLookup('detailed-types-selector', '/api/accounting/detailed-types?pageIndex=0&pageSize=100');
      if (data) {
        setTypes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSelect = (dt: any) => {
    let formComponent = 'DetailedAccountForm';
    if (dt.code === '01' || dt.title === 'صندوق') {
      formComponent = 'CashForm';
    }
    
    addTab(
      `تعریف ${dt.title} جدید`,
      'financial',
      <Plus className="w-4 h-4" />,
      formComponent,
      { detailedTypeId: dt.detailedTypesId }
    );
    onClose();
  };

  const filteredTypes = types.filter(t => 
    (t.title && t.title.includes(search)) || 
    (t.code && t.code.includes(search))
  );

  // Fallback data if API returns empty, usually useful to show something
  const displayTypes = types.length > 0 ? filteredTypes : [
    { detailedTypesId: 1, code: '01', title: 'صندوق', description: 'حساب‌های نقد و وجوه نقد نزد شرکت' },
    { detailedTypesId: 2, code: '02', title: 'حساب بانکی', description: 'حساب‌های جاری، پس‌انداز و کوتاه مدت بانکی' },
    { detailedTypesId: 3, code: '03', title: 'کالا خدمت', description: 'انواع اقلام موجودی کالا و خدمات قابل ارائه' },
    { detailedTypesId: 4, code: '04', title: 'مشتریان', description: 'اشخاص حقیقی و حقوقی خریدار کالا و خدمات' },
    { detailedTypesId: 5, code: '05', title: 'تامین کنندگان', description: 'فروشندگان مواد اولیه، کالا و خدمات به شرکت' },
    { detailedTypesId: 6, code: '06', title: 'انبار', description: 'محل‌های فیزیکی یا مجازی نگهداری کالا' },
  ].filter(t => t.title.includes(search) || t.code.includes(search));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] rtl">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-[1000px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200/50 dark:border-slate-700/50">
        
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-6 border-b border-white dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-5">
            <div className="w-[60px] h-[60px] bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white transform -rotate-3">
              <AppWindow className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">انتخاب نوع تفصیلی</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">برای تعریف حساب جدید، ابتدا نوع آن را مشخص کنید</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 pt-8 pb-4 bg-slate-50 dark:bg-slate-900">
          <div className="relative group">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="جستجو در انواع تفصیلی..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-5 pr-14 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 text-sm font-bold placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTypes.map((dt, i) => (
              <div 
                key={dt.detailedTypesId || i}
                className="group relative bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
                onClick={() => handleSelect(dt)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-[52px] h-[52px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                    <Tag className="w-[26px] h-[26px] transform rotate-12 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                  {dt.code && (
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider">
                      کد: {dt.code}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {dt.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relax font-medium pb-4">
                    {dt.description || 'توضیحاتی برای این نوع تفصیلی ثبت نشده است.'}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-end text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  انتخاب و ادامه
                  <svg className="w-4 h-4 mr-1.5 rtl:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
