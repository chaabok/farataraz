"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch, cn } from '@/lib/utils';
import { SimpleForm, FieldConfig } from './dfb/SimpleForm';
import { SimpleFormTabbed } from './dfb/SimpleFormTabbed';
import { SimpleFormTwoRow } from './dfb/SimpleFormTwoRow';
import { SimpleFormTwoRowTabbed } from './dfb/SimpleFormTwoRowTabbed';
import { useToast } from '../ToastProvider';
import { useConfirm } from '../ConfirmProvider';
import { useLanguage } from '../Providers';
import { 
  FileText, Plus, Edit, Trash2, Layout, Database, 
  ArrowRight, Search, Eye, RefreshCw, Calendar, FileJson
} from 'lucide-react';

interface DynamicFormRunnerProps {
  formCode: string;
  title?: string;
  initialConfig?: any;
  defaultViewMode?: 'list' | 'form';
  onClose?: () => void;
}

export function DynamicFormRunner({ formCode, title, initialConfig, defaultViewMode, onClose }: DynamicFormRunnerProps) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { t } = useLanguage();
  
  const [formConfig, setFormConfig] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'form'>(defaultViewMode || 'list');
  const [activeRecord, setActiveRecord] = useState<any | null>(null);

  // Form values state
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Form Config & Submissions
  const loadFormAndRecords = async () => {
    setLoading(true);
    try {
      if (initialConfig) {
        setFormConfig(initialConfig);
        if (initialConfig.dynamicFormId) {
          const resRecords = await apiFetch(`/api/dfb/forms/${initialConfig.dynamicFormId}/records`);
          if (resRecords.ok) {
            const jsonRecords = await resRecords.json();
            setRecords(jsonRecords.data || []);
          }
        }
        setLoading(false);
        return;
      }

      const resConfig = await apiFetch(`/api/dfb/forms/code/${formCode}`);
      if (!resConfig.ok) {
        showToast(`فرم پویای ${formCode} یافت نشد.`, 'error');
        setLoading(false);
        return;
      }
      const jsonConfig = await resConfig.json();
      const config = jsonConfig.data;
      setFormConfig(config);

      // Fetch Submissions
      if (config.dynamicFormId) {
        const resRecords = await apiFetch(`/api/dfb/forms/${config.dynamicFormId}/records`);
        if (resRecords.ok) {
          const jsonRecords = await resRecords.json();
          setRecords(jsonRecords.data || []);
        }
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در دریافت اطلاعات فرم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formCode || initialConfig) {
      loadFormAndRecords();
      const targetMode = defaultViewMode || 'list';
      setViewMode(targetMode);
      setActiveRecord(null);
      if (targetMode === 'form') {
        const defaults: Record<string, any> = {};
        const fields = initialConfig?.fields || [];
        fields.forEach((f: any) => {
          defaults[f.name] = f.type === 'checkbox' ? false : '';
        });
        setFormValues(defaults);
      } else {
        setFormValues({});
      }
    }
  }, [formCode, initialConfig, defaultViewMode]);

  const handleCreateNew = () => {
    setActiveRecord(null);
    
    // Initialize form fields with empty values or defaults
    const defaults: Record<string, any> = {};
    if (formConfig && formConfig.fields) {
      formConfig.fields.forEach((f: any) => {
        defaults[f.name] = f.type === 'checkbox' ? false : '';
      });
    }
    
    setFormValues(defaults);
    setViewMode('form');
  };

  const handleEditRecord = (record: any) => {
    setActiveRecord(record);
    setFormValues(record.data || {});
    setViewMode('form');
  };

  const handleDeleteRecord = async (recordId: number) => {
    const isConfirmed = await confirm({
      message: 'آیا از حذف این رکورد اطلاعاتی اطمینان دارید؟',
    });
    if (!isConfirmed) {
      return;
    }

    try {
      const res = await apiFetch(`/api/dfb/forms/records/${recordId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('رکورد اطلاعاتی با موفقیت حذف شد.', 'success');
        loadFormAndRecords();
      } else {
        showToast('خطا در حذف رکورد', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در حذف رکورد', 'error');
    }
  };

  const handleSave = async () => {
    if (!formConfig) return;

    // Standard client side validation
    const missingFields = formConfig.fields
      .filter((f: any) => f.required && !formValues[f.name])
      .map((f: any) => f.label || f.name);

    if (missingFields.length > 0) {
      showToast(`پر کردن فیلدهای زیر الزامی است: ${missingFields.join('، ')}`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (activeRecord) {
        // Edit mode
        res = await apiFetch(`/api/dfb/forms/records/${activeRecord.dynamicFormRecordId}`, {
          method: 'PUT',
          body: JSON.stringify(formValues),
        });
      } else {
        // Create mode
        res = await apiFetch(`/api/dfb/forms/${formConfig.dynamicFormId}/records`, {
          method: 'POST',
          body: JSON.stringify(formValues),
        });
      }

      if (res.ok) {
        showToast(activeRecord ? 'رکورد با موفقیت بروزرسانی شد.' : 'رکورد جدید ثبت شد.', 'success');
        setViewMode('list');
        loadFormAndRecords();
      } else {
        showToast('خطا در ثبت اطلاعات', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در ثبت اطلاعات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-sm text-gray-500 bg-white dark:bg-gray-950">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mb-2" />
        در حال بارگذاری فرم پویای {title || formCode}...
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-sm text-gray-500 bg-white dark:bg-gray-950 p-6">
        <Layout className="h-12 w-12 text-gray-300 mb-3" />
        <p className="font-bold text-gray-800 dark:text-gray-200">خطا در بارگذاری فرم</p>
        <p className="text-xs text-gray-500 mt-1">مشخصات فرم پویای {formCode} یافت نشد.</p>
      </div>
    );
  }

  // Styles defined by builder
  const formStyles = formConfig.styles || {};
  const currentFontFamily = formStyles.fontFamily || 'font-sans';
  const currentFontSize = formStyles.fontSize || 'text-sm';
  const themeColor = formStyles.themeColor || 'blue';

  const groupHeaderGradients: Record<string, string> = {
    blue: 'from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600',
    emerald: 'from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600',
    cyan: 'from-cyan-600 to-cyan-500 dark:from-cyan-700 dark:to-cyan-600',
    rose: 'from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600',
  };

  const THEME_BG_MAP: Record<string, string> = {
    blue: '#eff6ff',
    emerald: '#ecfdf5',
    cyan: '#ecfeff',
    rose: '#fff1f2',
    purple: '#faf5ff',
    amber: '#fffbeb',
  };

  const getThemeBgColor = (col?: string) => {
    if (!col) return '#eff6ff';
    if (THEME_BG_MAP[col]) return THEME_BG_MAP[col];
    if (col.startsWith('#')) return col;
    return '#eff6ff';
  };

  const headerGradient = groupHeaderGradients[themeColor] || groupHeaderGradients['blue'];

  const processedBands = (formConfig.bands || []).map((b: any) => ({
    ...b,
    bgColor: b.bgColor && b.bgColor !== '#ffffff' ? b.bgColor : getThemeBgColor(themeColor),
  }));

  // Map dynamic fields into SimpleForm configuration with styles injection
  const simpleFormFields: FieldConfig[] = (formConfig.fields || []).map((f: any) => {
    const fStyles = f.styles || {};
    return {
      name: f.name,
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.options,
      placeholder: f.placeholder,
      colSpan: f.colSpan || 1,
      bandId: f.bandId,
      width: f.width || fStyles.width,
      height: f.height || fStyles.height,
      styles: fStyles,
      className: cn(
        fStyles.fontFamily || currentFontFamily,
        fStyles.fontSize || currentFontSize
      ),
    };
  });

  // Filtering records based on search term
  const filteredRecords = records.filter(rec => {
    if (!searchTerm) return true;
    const str = JSON.stringify(rec.data || {}).toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  return (
    <div className={cn("flex flex-col h-full w-full bg-white dark:bg-gray-950 overflow-hidden rtl", currentFontFamily)} dir="rtl">
      
      {viewMode === 'list' ? (
        /* List View */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-500/20">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white">{formConfig.title}</h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{formConfig.description || 'فهرست اطلاعات ثبت شده'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-blue-500/10 transition-all"
              >
                <Plus className="h-4 w-4" />
                ثبت اطلاعات جدید
              </button>
              {onClose && (
                <button 
                  onClick={onClose}
                  className="flex items-center gap-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  بستن پیش‌نمایش
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-2 shrink-0 bg-white dark:bg-gray-950">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="جستجو در اطلاعات ثبت شده..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg pr-9 pl-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              onClick={loadFormAndRecords}
              className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
              title="بروزرسانی جدول"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Records Table */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50/50 dark:bg-gray-900/10">
            {filteredRecords.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-48 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
                <FileJson className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-xs text-gray-500">هیچ اطلاعاتی یافت نشد.</p>
                <button 
                  onClick={handleCreateNew}
                  className="mt-2 text-xs text-blue-600 font-semibold"
                >
                  اولین رکورد را ثبت کنید
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-right text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4 font-bold">شناسه</th>
                      {(formConfig.fields || []).slice(0, 4).map((f: any) => (
                        <th key={f.name} className="p-4 font-bold">{f.label}</th>
                      ))}
                      <th className="p-4 font-bold text-left">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((rec) => (
                      <tr 
                        key={rec.dynamicFormRecordId}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-slate-50 dark:hover:bg-gray-800/20 text-gray-800 dark:text-gray-200 transition-all"
                      >
                        <td className="p-4 font-mono text-gray-500 text-[11px]">{rec.dynamicFormRecordId}</td>
                        {(formConfig.fields || []).slice(0, 4).map((f: any) => {
                          const val = rec.data?.[f.name];
                          let displayVal = val;
                          if (f.type === 'checkbox') {
                            displayVal = val ? 'بله' : 'خیر';
                          } else if (f.type === 'select' || f.type === 'radio') {
                            const opt = f.options?.find((o: any) => o.value === val);
                            displayVal = opt ? opt.label : val;
                          }
                          return (
                            <td key={f.name} className="p-4 max-w-xs truncate">{displayVal !== undefined ? String(displayVal) : '---'}</td>
                          );
                        })}
                        <td className="p-4 flex justify-end gap-1.5 items-center">
                          <button 
                            onClick={() => handleEditRecord(rec)}
                            className="p-1.5 border border-gray-100 dark:border-gray-800 hover:border-blue-200 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-all"
                            title="ویرایش اطلاعات"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(rec.dynamicFormRecordId)}
                            className="p-1.5 border border-gray-100 dark:border-gray-800 hover:border-red-200 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all"
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Form View using selected template structure */
        <div className="flex-1 flex flex-col overflow-hidden">
          {(() => {
            const templateType = formConfig.componentName || 'SimpleForm';
            const commonProps = {
              title: `${activeRecord ? 'ویرایش رکورد' : 'ثبت اطلاعات جدید'} - ${formConfig.title}`,
              headerGradient,
              fields: simpleFormFields,
              bands: processedBands,
              hideBands: formConfig.hideBands ?? formConfig.options?.hideBands ?? true,
              values: formValues,
              onChange: (name: string, val: any) => setFormValues({ ...formValues, [name]: val }),
              onSave: handleSave,
              onClose: onClose ? onClose : () => setViewMode('list'),
              preventTabClose: !!onClose,
              isSubmitting,
              showListButton: !onClose,
              onList: () => setViewMode('list'),
              showPrintList: !!formConfig.showPrintList || !!formConfig.options?.showPrintList,
              showVoucherActionbar: !!formConfig.showVoucherActionbar || !!formConfig.options?.showVoucherActionbar,
              targetFormCode: formConfig.formCode,
              onPrintList: () => window.print(),
              onVoucherAction: () => showToast('درخواست صدور سند حسابداری ثبت گردید.', 'info'),
            };

            if (templateType === 'SimpleFormTwoRow') {
              return <SimpleFormTwoRow {...commonProps} />;
            }
            if (templateType === 'SimpleFormTabbed') {
              return <SimpleFormTabbed tabs={formConfig.tabs && formConfig.tabs.length > 0 ? formConfig.tabs : [{ id: 'tab1', label: 'اطلاعات اصلی', fields: simpleFormFields }]} {...commonProps} />;
            }
            if (templateType === 'SimpleFormTwoRowTabbed') {
              return <SimpleFormTwoRowTabbed tabs={formConfig.tabs && formConfig.tabs.length > 0 ? formConfig.tabs : [{ id: 'tab1', label: 'اطلاعات اصلی', fields: simpleFormFields }]} {...commonProps} />;
            }
            return <SimpleForm {...commonProps} />;
          })()}
        </div>
      )}

    </div>
  );
}
