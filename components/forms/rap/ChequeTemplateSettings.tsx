'use client';

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect, useRef } from 'react';
import { SimpleFormTwoRow } from '@/components/forms/SimpleFormTwoRow';
import { Settings, Save, Upload, Plus, Edit2, Check, X, MousePointer2, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { apiFetch } from '@/lib/utils';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

const AVAILABLE_FIELDS = [
  { id: 'numericDate', title: 'تاریخ عددی', sample: '1403/05/20' },
  { id: 'textualDate', title: 'تاریخ حروفی', sample: 'بیستم مرداد هزار و چهارصد و سه' },
  { id: 'payee', title: 'گیرنده (در وجه)', sample: 'شرکت تجارت الکترونیک پارسا' },
  { id: 'description', title: 'بابت', sample: 'بابت فاکتور شماره ۱۲۳۴' },
  { id: 'nationalId', title: 'کد ملی / شناسه ملی', sample: '۱۲۳۴۵۶۷۸۹۰' },
  { id: 'numericAmount', title: 'مبلغ عددی', sample: '150,000,000' },
  { id: 'textualAmount', title: 'مبلغ حروفی', sample: 'صد و پنجاه میلیون ریال' }
];

const FONTS = [
  { value: 'tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
  { value: 'IranSans, iranyekan, sans-serif', label: 'ایران سنس / یکان' },
  { value: '"B Nazanin", sans-serif', label: 'B Nazanin' },
  { value: '"B Titr", sans-serif', label: 'B Titr' },
  { value: 'system-ui, sans-serif', label: 'System Default' }
];

export function ChequeTemplateSettings({ id }: { id?: string | number }) {
  const { isUsed } = useFormUsageCheck("ChequeTemplateSettings", id);
  const { showToast } = useToast();
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedBankTitle, setSelectedBankTitle] = useState<string>('');
  
  const [templateValues, setTemplateValues] = useState<any>({
    title: '',
    imageBlob: '',
    config: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(!!id);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [fieldsLayout, setFieldsLayout] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const fetchTemplateById = async (templateId: string | number) => {
    setIsLoadingForm(true);
    try {
      const res = await apiFetch(`/api/rap/cheque-print-templates/${templateId}`);
      if (res.ok) {
        const existing = await res.json();
        setTemplateValues({
          id: existing.chequePrintTemplateId,
          title: existing.title,
          imageBlob: existing.imageBlob || '',
        });
        setSelectedBankId(String(existing.bankRef));
        setFieldsLayout(existing.config || []);
        // Fetch bank title since we only have bankRef
        if (existing.bank) {
          setSelectedBankTitle(existing.bank.title);
        } else if (existing.bankRef) {
          apiFetch(`/api/rap/banks/${existing.bankRef}`).then(r => r.json()).then(bankData => {
            if (bankData?.title) setSelectedBankTitle(bankData.title);
            else if (bankData?.data?.title) setSelectedBankTitle(bankData.data.title);
          }).catch(e => console.error(e));
        }
      } else {
        showToast('خطا در دریافت اطلاعات قالب', 'error');
      }
    } catch(e) {
      console.error(e);
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setIsLoadingForm(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTemplateById(id);
    }
  }, [id]);

  const fetchTemplateForBank = async (bankId: string) => {
    if (!bankId || id) return;
    setIsLoadingForm(true);
    try {
      const res = await apiFetch(`/api/rap/cheque-print-templates`);
      const data = await res.json();
      const existing = Array.isArray(data) ? data.find((t: any) => String(t.bankRef) === String(bankId)) : null;
      if (existing) {
        setTemplateValues({
          id: existing.chequePrintTemplateId,
          title: existing.title,
          imageBlob: existing.imageBlob || '',
        });
        setFieldsLayout(existing.config || []);
      } else {
        setTemplateValues({
          title: '',
          imageBlob: '',
        });
        setFieldsLayout([]);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsLoadingForm(false);
    }
  };

  useEffect(() => {
    fetchTemplateForBank(selectedBankId);
  }, [selectedBankId, id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateValues((prev: any) => ({ ...prev, imageBlob: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setTemplateValues((prev: any) => ({ ...prev, imageBlob: '' }));
  };

  const formFields = [
    {
      name: 'bankRef',
      label: 'انتخاب بانک',
      type: 'custom' as const,
      customComponent: (
        <SingleSelectDropDown
          listApiUrl="/api/rap/banks?isActive=true"
          columns={[
            { key: 'code', label: 'کد بانک' },
            { key: 'title', label: 'عنوان بانک' },
            { key: 'latinTitle', label: 'عنوان لاتین' },
          ]}
          displayKey="title"
          value={selectedBankId ? { id: selectedBankId, title: selectedBankTitle || 'انتخاب شده' } : null}
          onChange={(item: any) => {
            setSelectedBankId(String(item.bankId || item.id));
            setSelectedBankTitle(item.title);
          }}
        />
      ),
      required: true,
      colSpan: 1
    },
    {
      name: 'title',
      label: 'عنوان قالب',
      type: 'text' as const,
      required: true,
      colSpan: 1
    }
  ];

  const handleFieldChange = (key: string, value: any) => {
    if (key === 'bankRef') {
      setSelectedBankId(value);
    } else {
      setTemplateValues((prev: any) => ({ ...prev, [key]: value }));
    }
  };

  const currentValues = {
    ...templateValues,
    bankRef: selectedBankId
  };

  const handleSave = async (actionType?: string) => {
    if (!selectedBankId) {
      showToast('لطفا بانک را انتخاب کنید', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: templateValues.title || 'قالب پیش فرض',
        bankRef: Number(selectedBankId),
        imageBlob: templateValues.imageBlob,
        config: fieldsLayout,
      };
      
      let res;
      if (templateValues.id) {
        res = await apiFetch(`/api/rap/cheque-print-templates/${templateValues.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch(`/api/rap/cheque-print-templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      if (res.ok) {
        showToast('تنظیمات قالب ذخیره شد', 'success');
        const data = await res.json();
        setTemplateValues((prev: any) => ({ ...prev, id: data.chequePrintTemplateId }));
        
        if (actionType === 'new') {
          // Reset form for a new template
          setSelectedBankId('');
          setTemplateValues({ title: '', imageBlob: '' });
          setFieldsLayout([]);
        } else if (actionType === 'close') {
          // Optional action on close
        }
      } else {
        showToast('خطا در ذخیره سازی', 'error');
      }
    } catch(e) {
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setSelectedBankId('');
    setTemplateValues({ title: '', imageBlob: '' });
    setFieldsLayout([]);
    setSelectedFieldId(null);
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData('text/plain', fieldId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData('text/plain');
    if (!fieldId) return;
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const existingInfo = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    if (!existingInfo) return;

    const newFields = fieldsLayout.filter(f => f.id !== fieldId);
    
    newFields.push({
      id: fieldId,
      title: existingInfo.title,
      sample: existingInfo.sample,
      x: Math.max(0, x - 50),
      y: Math.max(0, y - 10),
      width: 150,
      height: 30,
      fontSize: 14,
      fontFamily: 'tahoma, sans-serif',
      color: '#000000',
      backgroundColor: 'transparent',
      textAlign: 'center',
      fillWithHashes: fieldId === 'numericAmount' ? true : undefined
    });
    
    setFieldsLayout(newFields);
    setSelectedFieldId(fieldId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Mouse drag for moving fields and resizing
  const [dragState, setDragState] = useState<{ type: string, id: string, startX: number, startY: number, initialX: number, initialY: number, initialWidth: number, initialHeight: number } | null>(null);

  const onFieldMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedFieldId(id);
    const field = fieldsLayout.find(f => f.id === id);
    if (field) {
      setDragState({
        type: 'move',
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialX: field.x || 0,
        initialY: field.y || 0,
        initialWidth: field.width || 150,
        initialHeight: field.height || 30
      });
    }
  };

  const onResizeMouseDown = (e: React.MouseEvent, id: string, direction: string) => {
    e.stopPropagation();
    setSelectedFieldId(id);
    const field = fieldsLayout.find(f => f.id === id);
    if (field) {
      setDragState({
        type: `resize-${direction}`,
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialX: field.x || 0,
        initialY: field.y || 0,
        initialWidth: field.width || 150,
        initialHeight: field.height || 30
      });
    }
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (dragState) {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      
      setFieldsLayout(prev => prev.map(f => {
        if (f.id === dragState.id) {
          if (dragState.type === 'move') {
            return {
              ...f,
              x: Math.max(0, dragState.initialX + dx),
              y: Math.max(0, dragState.initialY + dy)
            };
          } else if (dragState.type.startsWith('resize')) {
            let newX = dragState.initialX;
            let newY = dragState.initialY;
            let newWidth = dragState.initialWidth;
            let newHeight = dragState.initialHeight;

            if (dragState.type.includes('e')) {
              newWidth = Math.max(30, dragState.initialWidth + dx);
            }
            if (dragState.type.includes('s')) {
              newHeight = Math.max(20, dragState.initialHeight + dy);
            }
            if (dragState.type.includes('w')) {
              const proposedWidth = dragState.initialWidth - dx;
              if (proposedWidth >= 30) {
                newWidth = proposedWidth;
                newX = dragState.initialX + dx;
              }
            }
            if (dragState.type.includes('n')) {
              const proposedHeight = dragState.initialHeight - dy;
              if (proposedHeight >= 20) {
                newHeight = proposedHeight;
                newY = dragState.initialY + dy;
              }
            }

            return {
              ...f,
              x: Math.max(0, newX),
              y: Math.max(0, newY),
              width: newWidth,
              height: newHeight
            };
          }
        }
        return f;
      }));
    }
  };

  const onCanvasMouseUp = () => {
    setDragState(null);
  };

  const updateSelectedField = (props: any) => {
    setFieldsLayout(prev => prev.map(f => f.id === selectedFieldId ? { ...f, ...props } : f));
  };

  const removeField = (id: string) => {
    setFieldsLayout(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const selectedFieldData = fieldsLayout.find(f => f.id === selectedFieldId);

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      <LoadingOverlay visible={isLoadingForm} message="در حال بارگذاری اطلاعات قالب..." />
      <SimpleFormTwoRow isReadonly={isUsed || false}
        title="تنظیمات قالب چاپ چک"
        icon={<Settings />}
        headerGradient="from-blue-600 to-indigo-600"
        fields={formFields as any}
        values={currentValues}
        onChange={handleFieldChange}
        onSave={() => handleSave()}
        onSaveNew={() => handleSave('new')}
        onSaveClose={() => handleSave('close')}
        onNew={handleNew}
        isSubmitting={isSubmitting}
        showListButton={false}
        className="mb-0 border-b-0 rounded-b-none"
      >
      <div className="flex flex-col lg:flex-row gap-4 p-4 mt-2 bg-gray-50 border border-gray-200 shadow-inner rounded-xl mx-auto w-full min-h-[600px] select-none">
        
        {/* Right Sidebar */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-4 h-[calc(100vh-16rem)] min-h-[500px]">
          {/* Toolbox */}
          <div className={`bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${(!selectedBankId || !templateValues.title) ? 'opacity-50 pointer-events-none' : ''} ${selectedFieldData ? 'h-[250px] flex-shrink-0' : 'flex-1'}`}>
            <div className="bg-blue-50 border-b border-blue-100 p-2.5 font-semibold text-blue-800 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              فیلدهای چک
            </div>
            <div className="p-2 flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
              <p className="text-xs text-gray-500 mb-2">فیلد را بکشید و روی تصویر رها کنید.</p>
              {AVAILABLE_FIELDS.map(f => {
                const isUsed = fieldsLayout.some(fl => fl.id === f.id);
                return (
                  <div 
                    key={f.id}
                    draggable={!isUsed}
                    onDragStart={(e) => handleDragStart(e, f.id)}
                    className={`p-2 border rounded text-xs select-none transition-colors flex justify-between items-center cursor-grab ${
                      isUsed ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 active:cursor-grabbing shadow-sm'
                    }`}
                  >
                    <span className="font-medium truncate">{f.title}</span>
                    {isUsed && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Field Properties Panel */}
          {selectedFieldData && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden flex-1">
              <div className="bg-amber-50 border-b border-amber-100 p-2.5 font-semibold text-amber-800 text-[11px] flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 overflow-hidden">
                  <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">خصوصیات: {selectedFieldData.title}</span>
                </span>
                <button onClick={() => removeField(selectedFieldData.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0" title="حذف فیلد">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2.5 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  {/* Font Family */}
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-gray-600 font-medium">نوع قلم</label>
                    <select 
                      value={selectedFieldData.fontFamily || 'tahoma, sans-serif'} 
                      onChange={e => updateSelectedField({fontFamily: e.target.value})} 
                      className="border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none w-full"
                    >
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>

                  {/* Font Size & Alignment */}
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-600 font-medium">سایز قلم (pt)</label>
                    <input type="number" value={selectedFieldData.fontSize || 14} onChange={e => updateSelectedField({fontSize: Number(e.target.value)})} className="border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-600 font-medium">تراز متن</label>
                    <div className="flex bg-white border border-gray-300 rounded overflow-hidden">
                      <button onClick={() => updateSelectedField({textAlign: 'right'})} className={`flex-1 p-1 flex justify-center items-center ${selectedFieldData.textAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}><AlignRight className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateSelectedField({textAlign: 'center'})} className={`flex-1 p-1 flex justify-center items-center border-x border-gray-200 ${(!selectedFieldData.textAlign || selectedFieldData.textAlign === 'center') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}><AlignCenter className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateSelectedField({textAlign: 'left'})} className={`flex-1 p-1 flex justify-center items-center ${selectedFieldData.textAlign === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}><AlignLeft className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-600 font-medium">رنگ قلم</label>
                    <div className="flex items-center gap-1">
                      <input type="color" value={selectedFieldData.color || '#000000'} onChange={e => updateSelectedField({color: e.target.value})} className="w-6 h-6 rounded border border-gray-300 cursor-pointer p-0" />
                      <span className="text-[9px] text-gray-500 uppercase">{selectedFieldData.color || '#000000'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-600 font-medium">رنگ پس‌زمینه</label>
                    <div className="flex items-center gap-1 justify-between">
                      <input type="color" value={selectedFieldData.backgroundColor !== 'transparent' ? selectedFieldData.backgroundColor : '#ffffff'} onChange={e => updateSelectedField({backgroundColor: e.target.value})} className="w-6 h-6 rounded border border-gray-300 cursor-pointer p-0" />
                      <button onClick={() => updateSelectedField({backgroundColor: 'transparent'})} className="text-[9px] px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">پنهان</button>
                    </div>
                  </div>

                  {/* Size Controls */}
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-600 font-medium">پهنا (w)</label>
                    <input type="number" value={selectedFieldData.width || 150} onChange={e => updateSelectedField({width: Number(e.target.value)})} className="border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-600 font-medium">ارتفاع (h)</label>
                    <input type="number" value={selectedFieldData.height || 30} onChange={e => updateSelectedField({height: Number(e.target.value)})} className="border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none w-full" />
                  </div>

                  {/* Typography Extras */}
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-gray-600 font-medium">فاصله حروف/اعداد (px)</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="50" step="0.5" value={selectedFieldData.letterSpacing || 0} onChange={e => updateSelectedField({letterSpacing: Number(e.target.value)})} className="flex-1 w-full min-w-0" />
                      <input type="number" step="0.5" value={selectedFieldData.letterSpacing || 0} onChange={e => updateSelectedField({letterSpacing: Number(e.target.value)})} className="border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none w-12 text-center text-xs" />
                    </div>
                  </div>
                  
                  {/* Specific Settings based on Field Type */}
                  {selectedFieldData.id === 'numericAmount' && (
                    <div className="flex flex-col gap-2 col-span-2 mt-1 bg-gray-50 p-2 rounded border border-gray-200 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="checkbox" 
                          id="fillWithHashes" 
                          checked={selectedFieldData.fillWithHashes !== undefined ? selectedFieldData.fillWithHashes : true} 
                          onChange={e => updateSelectedField({fillWithHashes: e.target.checked})} 
                          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        <label htmlFor="fillWithHashes" className="text-gray-700 cursor-pointer font-medium truncate">بستن هشتگ (#####)</label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="checkbox" 
                          id="isPerforated" 
                          checked={selectedFieldData.isPerforated || false} 
                          onChange={e => updateSelectedField({isPerforated: e.target.checked})} 
                          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        <label htmlFor="isPerforated" className="text-gray-700 cursor-pointer font-medium truncate">پرفراژ (* 1 * 2 *)</label>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <input 
                           type="checkbox" 
                           id="removeCommas" 
                           checked={selectedFieldData.removeCommas || false} 
                           onChange={e => updateSelectedField({removeCommas: e.target.checked})} 
                           className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                         />
                         <label htmlFor="removeCommas" className="text-gray-700 cursor-pointer font-medium truncate">حذف کاما (,)</label>
                      </div>
                    </div>
                  )}
                  
                  {selectedFieldData.id === 'numericDate' && (
                    <div className="flex flex-col gap-2 col-span-2 mt-1 bg-gray-50 p-2 rounded border border-gray-200 text-[10px]">
                      <div className="flex items-center gap-1.5">
                         <input 
                           type="checkbox" 
                           id="removeSlashes" 
                           checked={selectedFieldData.removeSlashes || false} 
                           onChange={e => updateSelectedField({removeSlashes: e.target.checked})} 
                           className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                         />
                         <label htmlFor="removeSlashes" className="text-gray-700 cursor-pointer font-medium truncate">حذف اسلش (/)</label>
                      </div>
                    </div>
                  )}
                  
                  {['textualAmount', 'payee', 'description', 'nationalId', 'textualDate'].includes(selectedFieldData.id) && (
                    <div className="flex flex-col gap-2 col-span-2 mt-1 bg-gray-50 p-2 rounded border border-gray-200 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="checkbox" 
                          id="fillWithDashes" 
                          checked={selectedFieldData.fillWithDashes || false} 
                          onChange={e => updateSelectedField({fillWithDashes: e.target.checked})} 
                          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        <label htmlFor="fillWithDashes" className="text-gray-700 cursor-pointer font-medium truncate">تیره (---متن---)</label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className={`flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden relative transition-all duration-300`}>
          {(!selectedBankId || !templateValues.title) && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-auto">
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-amber-200 flex flex-col items-center gap-2 max-w-sm text-center">
                <span className="text-amber-500 font-bold text-xl">⚠️ توجه</span>
                <span className="text-gray-700 font-medium text-sm leading-relaxed">
                  لطفاً ابتدا <strong className="text-amber-600">انتخاب بانک</strong> و <strong className="text-amber-600">عنوان قالب</strong> را کامل کنید تا بخش طراحی فعال شود.
                </span>
              </div>
            </div>
          )}
          
          <div className="border-b border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" />
              طراحی قالب چاپی
            </span>
            <div className="flex items-center gap-3">
              {!selectedBankId && (
                <span className="text-xs text-amber-600 font-medium">لطفاً ابتدا بانک را انتخاب کنید</span>
              )}
              {templateValues.imageBlob && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded transition-colors text-xs font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف تصویر
                </button>
              )}
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="check-image-upload" />
                <label htmlFor="check-image-upload" className="flex items-center gap-2 bg-white border border-blue-300 text-blue-600 px-3 py-1.5 rounded cursor-pointer hover:bg-blue-50 transition-colors text-xs font-semibold">
                  <Upload className="w-4 h-4" />
                  بارگذاری تصویر چک
                </label>
              </div>
            </div>
          </div>
          
          <div 
            className="flex-1 relative overflow-auto bg-slate-100 flex items-center justify-center p-4 relative"
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
            onMouseLeave={onCanvasMouseUp}
          >
            {templateValues.imageBlob ? (
              <div 
                ref={containerRef}
                className="relative bg-white shadow-xl max-w-full overflow-hidden" 
                style={{ width: '800px', height: '400px' }} // Standard check aspect ratio approx
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => setSelectedFieldId(null)}
              >
                <img src={templateValues.imageBlob} alt="Check template" className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" draggable={false} />
                
                {fieldsLayout.map(f => {
                  const padding = 2; // For visual clear padding
                  return (
                    <div
                      key={f.id}
                      title={f.title}
                      onMouseDown={(e) => onFieldMouseDown(e, f.id)}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute cursor-move flex items-center transition-shadow ${
                        selectedFieldId === f.id ? 'ring-2 ring-blue-500 shadow-md z-10' : 'hover:ring-1 hover:ring-blue-300 shadow-sm z-0'
                      }`}
                      style={{
                        left: f.x,
                        top: f.y,
                        width: f.width || 150,
                        height: f.height || 30,
                        fontSize: `${f.fontSize || 14}px`,
                        fontFamily: f.fontFamily || 'tahoma, sans-serif',
                        color: f.color || '#000000',
                        backgroundColor: f.backgroundColor || 'transparent',
                        textAlign: f.textAlign || 'center',
                        letterSpacing: `${f.letterSpacing || 0}px`,
                        border: selectedFieldId === f.id ? '1px dashed #3b82f6' : '1px dashed #9ca3af',
                        padding: `0 ${padding}px`,
                        justifyContent: f.textAlign === 'right' ? 'flex-end' : f.textAlign === 'left' ? 'flex-start' : 'center',
                        overflow: 'visible' // Changed to visible for resize handles
                      }}
                    >
                      <span className="whitespace-nowrap w-full truncate overflow-hidden">
                        {f.isPerforated 
                          ? `* 1 * 5 * 0 * 0 * 0 * 0 *` 
                          : f.fillWithDashes 
                            ? `--- ${f.sample || f.title} ---` 
                            : (f.fillWithHashes === true || (f.id === 'numericAmount' && f.fillWithHashes !== false))
                              ? `##### ${f.id === 'numericAmount' && f.removeCommas ? (f.sample || '').replace(/,/g, '') : (f.sample || f.title)} #####`
                              : f.id === 'numericAmount' && f.removeCommas
                                ? (f.sample || '').replace(/,/g, '')
                                : f.id === 'numericDate' && f.removeSlashes
                                  ? (f.sample || '').replace(/\//g, '')
                                  : (f.sample || f.title)}
                      </span>
                      
                      {/* Resize Handles */}
                      {selectedFieldId === f.id && (
                        <>
                          {/* Corners */}
                          <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 cursor-nwse-resize -translate-x-1/2 -translate-y-1/2 rounded-full z-20" onMouseDown={(e) => onResizeMouseDown(e, f.id, 'nw')} />
                          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 cursor-nesw-resize translate-x-1/2 -translate-y-1/2 rounded-full z-20" onMouseDown={(e) => onResizeMouseDown(e, f.id, 'ne')} />
                          <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 cursor-nesw-resize -translate-x-1/2 translate-y-1/2 rounded-full z-20" onMouseDown={(e) => onResizeMouseDown(e, f.id, 'sw')} />
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-nwse-resize translate-x-1/2 translate-y-1/2 rounded-full z-20" onMouseDown={(e) => onResizeMouseDown(e, f.id, 'se')} />
                          
                          {/* Edges */}
                          <div className="absolute top-0 left-1/2 w-full h-2 bg-transparent cursor-ns-resize hover:bg-blue-500/30 -translate-x-1/2 -translate-y-1/2 z-10" onMouseDown={(e) => onResizeMouseDown(e, f.id, 'n')} />
                          <div className="absolute bottom-0 left-1/2 w-full h-2 bg-transparent cursor-ns-resize hover:bg-blue-500/30 -translate-x-1/2 translate-y-1/2 z-10" onMouseDown={(e) => onResizeMouseDown(e, f.id, 's')} />
                          <div className="absolute left-0 top-1/2 w-2 h-full bg-transparent cursor-ew-resize hover:bg-blue-500/30 -translate-x-1/2 -translate-y-1/2 z-10" onMouseDown={(e) => onResizeMouseDown(e, f.id, 'w')} />
                          <div className="absolute right-0 top-1/2 w-2 h-full bg-transparent cursor-ew-resize hover:bg-blue-500/30 translate-x-1/2 -translate-y-1/2 z-10" onMouseDown={(e) => onResizeMouseDown(e, f.id, 'e')} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div 
                className="text-center flex flex-col items-center gap-4 text-gray-400 bg-white p-12 rounded-xl border border-dashed border-gray-300 w-full max-w-md mx-auto"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-700">بارگذاری تصویر نمونه</h3>
                  <p className="text-sm">برای شروع طراحی قالب، تصویر یک چک خام را بارگذاری کنید.</p>
                </div>
              </div>
            )}
          </div>
        </div>



      </div>
      </SimpleFormTwoRow>
    </div>
  );
}

