'use client';
import { apiFetch } from '@/lib/utils';

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Eye, X } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '../../ui/MainDataGrid';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/components/Providers';
import { motion, AnimatePresence } from 'framer-motion';
import { eventBus, EVENTS } from '@/lib/events';

type ActivityLog = {
  id: string | number;
  action: string;
  entityName: string;
  entityId: string;
  description: string;
  url: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  creationDate: string;
  creator: number;
  creatorUser?: {
    firstName: string;
    lastName: string;
  };
  oldValues?: any;
  newValues?: any;
};

const getEntityTranslatedName = (entityName: string, language: string, t: any) => {
  if (!entityName) return '';
  
  if (language === 'fa') {
    const persianMap: Record<string, string> = {
      'BusinessStructure': 'ساختار کسب و کار',
      'FiscalYear': 'دوره های مالی',
      'BaseSettings': 'تنظیمات پایه',
      'Currency': 'ارز',
      'User': 'مدیریت کاربران', // Form title is مدیریت کاربران
      'UserGroup': 'گروه کاربری',
      'ActivityLog': 'مدیریت لاگ ها',
      'DetailedType': 'نوع تفصیلی',
      'DetailedAccount': 'حساب تفصیلی',
      'Accounts': 'کدینگ حساب‌ها',
      'Account': 'کدینگ حساب‌ها',
      'DocumentType': 'انواع سند',
      'VoucherType': 'انواع سند',
      'Permission': 'مجوز',
      'Role': 'نقش',
      'Accounting': 'حسابداری'
    };
    if (persianMap[entityName]) return persianMap[entityName];
  }
  
  const tResult = t(entityName.toLowerCase() as any);
  if (tResult !== entityName.toLowerCase()) return tResult;
  return entityName;
};

const translateAction = (action: string, entityName: string, language: string, t: any) => {
  if (action === 'LOGIN') {
    if (language === 'fa') return 'ورود به نرم افزار';
    if (language === 'ar') return 'تسجيل الدخول إلى البرنامج';
    if (language === 'zh') return '登录软件';
    return 'Login to software';
  }
  if (action === 'LOGOUT') {
    if (language === 'fa') return 'خروج از نرم افزار';
    if (language === 'ar') return 'الخروج من البرنامج';
    if (language === 'zh') return '退出软件';
    return 'Logout from software';
  }

  const translatedEntity = getEntityTranslatedName(entityName, language, t);

  if (action === 'UPDATE') {
    if (language === 'fa') return translatedEntity ? `ویرایش ${translatedEntity}` : 'ویرایش';
    if (language === 'ar') return translatedEntity ? `تعديل ${translatedEntity}` : 'تعديل';
    if (language === 'zh') return translatedEntity ? `编辑 ${translatedEntity}` : '编辑';
    return translatedEntity ? `Edit ${translatedEntity}` : 'Edit';
  }
  if (action === 'DELETE') {
    if (language === 'fa') return translatedEntity ? `حذف اطلاعات در ${translatedEntity}` : 'حذف';
    if (language === 'ar') return translatedEntity ? `حذف البيانات في ${translatedEntity}` : 'حذف';
    if (language === 'zh') return translatedEntity ? `删除数据 ${translatedEntity}` : '删除';
    return translatedEntity ? `Delete data in ${translatedEntity}` : 'Delete';
  }
  if (action === 'CREATE') {
    if (language === 'fa') return translatedEntity ? `افزودن اطلاعات در ${translatedEntity}` : 'ایجاد';
    if (language === 'ar') return translatedEntity ? `إضافة بيانات في ${translatedEntity}` : 'إضافة';
    if (language === 'zh') return translatedEntity ? `添加数据 ${translatedEntity}` : '创建';
    return translatedEntity ? `Add data in ${translatedEntity}` : 'Create';
  }

  return action;
};

function ChangeDetailsModal({ isOpen, onClose, logRow }: { isOpen: boolean, onClose: () => void, logRow: ActivityLog | null }) {
  const { t, language } = useLanguage();
  
  if (!isOpen || !logRow) return null;

  const oldVals = logRow.oldValues || {};
  const newVals = logRow.newValues || {};
  
  // Combine all keys
  const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
          dir="rtl"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              {t('change_details' as any) || 'جزئیات تغییرات'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
               <div><span className="text-gray-500 block text-xs">{t('action' as any) || 'عملیات'}:</span> <span className="font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">{translateAction(logRow.action, logRow.entityName, language, t)}</span></div>
               <div><span className="text-gray-500 block text-xs">{t('entity' as any) || 'موجودیت'}:</span> <span className="font-medium">{getEntityTranslatedName(logRow.entityName, language, t)}</span></div>
               <div><span className="text-gray-500 block text-xs">{t('entity_id' as any) || 'شناسه'}:</span> <span className="font-medium">{logRow.entityId}</span></div>
               <div><span className="text-gray-500 block text-xs">{t('date' as any) || 'تاریخ'}:</span> <span className="font-medium">{new Date(logRow.creationDate).toLocaleString('fa-IR')}</span></div>
            </div>

            {logRow.action === 'CREATE' && (
              <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100 p-3 rounded mb-4 text-sm">
                مورد جدید ایجاد شده است.
              </div>
            )}
            
            {logRow.action === 'DELETE' && (
              <div className="bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-100 p-3 rounded mb-4 text-sm">
                مورد حذف شده است.
              </div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 border-b dark:border-gray-700 w-1/4">فیلد (پراپرتی)</th>
                    <th className="px-4 py-2 border-b dark:border-gray-700 w-1/3">مقدار قبلی</th>
                    <th className="px-4 py-2 border-b dark:border-gray-700 w-1/3">مقدار جدید</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {allKeys.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        اطلاعات دقیق تغییرات برای این لاگ یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    allKeys.map(key => {
                      const oldValStr = typeof oldVals[key] === 'object' ? JSON.stringify(oldVals[key]) : String(oldVals[key] ?? '');
                      const newValStr = typeof newVals[key] === 'object' ? JSON.stringify(newVals[key]) : String(newVals[key] ?? '');
                      const isChanged = oldValStr !== newValStr;
                      
                      // Skip internal TypeORM fields for noise reduction
                      if (key === 'updateCount' || key === 'lastModifier') {
                         if (!isChanged) return null;
                      }

                      return (
                        <tr key={key} className={isChanged ? "bg-amber-50 dark:bg-amber-900/10" : ""}>
                          <td className="px-4 py-2 font-mono text-xs text-gray-600 dark:text-gray-400 border-l dark:border-gray-700">
                            {key}
                          </td>
                          <td className="px-4 py-2 border-l dark:border-gray-700 break-all text-gray-700 dark:text-gray-300 relative">
                            {isChanged && logRow.action === 'UPDATE' && <div className="absolute top-0 bottom-0 right-0 w-1 bg-red-400"></div>}
                            {oldVals[key] === undefined ? '-' : oldValStr}
                          </td>
                          <td className="px-4 py-2 break-all font-medium text-gray-900 dark:text-gray-100 relative">
                            {isChanged && <div className="absolute top-0 bottom-0 right-0 w-1 bg-emerald-400"></div>}
                            {newVals[key] === undefined ? '-' : newValStr}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function ActivityLogList() {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const [data, setData] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/activity-log`);
      if (res.ok) {
        const json = await res.json();
        // Assume json.data contains the list because backend returns { data: [] }
        setData(json.data || []);
        setTotalItems((json.data || []).length);
      } else {
        showToast(t('error_fetch_data' as any) || "خطا در دریافت اطلاعات لاگ", "error");
      }
    } catch (err) {
      console.error('Fetch error in ActivityLog:', err);
      showToast(t('connection_error' as any) || "عدم ارتباط با سرور", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, () => {
      fetchData();
    });
    return () => unsubscribe();
  }, []);

  const handleParamsChange = (newParams: DataGridParams) => {
    setParams(newParams);
  };

  const columns: DataGridColumn[] = useMemo(() => [
    { 
      key: 'actions',
      header: 'تغییرات',
      width: 80,
      cell: (info: any) => (
        <button 
          onClick={(e) => {
             e.stopPropagation();
             setSelectedLog(info.row.original);
          }}
          className="flex items-center justify-center p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 m-auto"
          title="مشاهده جزئیات تغییرات"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    },
    { key: 'creationDate', header: t('creation_date' as any) || 'تاریخ ایجاد', width: 150, cell: (info: any) => new Date(info.getValue()).toLocaleString('fa-IR') },
    { 
      key: 'action', 
      header: t('action' as any) || 'عملیات', 
      width: 120,
      cell: (info: any) => translateAction(info.getValue(), info.row.original.entityName, language, t)
    },
    { 
      key: 'creatorName', 
      header: 'نام و نام خانوادگی کاربر', 
      width: 150, 
      cell: (info: any) => {
        const user = info.row.original.creatorUser;
        if (user) {
          return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'کاربر ناشناس';
        }
        return `کاربر شناسه ${info.row.original.creator}`;
      }
    },
    { 
      key: 'entityName', 
      header: t('entity' as any) || 'موجودیت', 
      width: 150,
      cell: (info: any) => getEntityTranslatedName(info.getValue(), language, t)
    },
    { key: 'entityId', header: t('entity_id' as any) || 'شناسه موجودیت', width: 120 },
    { key: 'ipAddress', header: t('ip_address' as any) || 'IP', width: 120 },
    { key: 'method', header: t('method' as any) || 'متد', width: 80 },
    { key: 'url', header: t('url' as any) || 'آدرس', width: 250 },
    { key: 'description', header: t('description' as any) || 'توضیحات', width: 250 },
    { key: 'creator', header: t('creator_user' as any) || 'کاربر ایجادکننده', width: 150 },
  ], [t, language]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid
        entityName="ActivityLog" 
        columns={columns}
        data={data}
        title={`${t('activity_log' as any)} (${t('records' as any)}: ${data.length})`}
        icon={<FileText className="h-4 w-4" />}
        isLoading={isLoading}
        onRefresh={() => fetchData()}
        serverSide={false}
        totalItems={data.length}
        onParamsChange={handleParamsChange}
      />
      <ChangeDetailsModal 
        isOpen={selectedLog !== null} 
        onClose={() => setSelectedLog(null)} 
        logRow={selectedLog} 
      />
    </div>
  );
}
