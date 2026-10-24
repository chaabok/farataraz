'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFetch } from '@/lib/utils';

interface PrintChequeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  checkData: any; // e.g. { num, desc, amount, due, payee, bankId... maybe bank is global to the form? }
  bankId: string | null;  // The bank of the chequebook used.
}

export function PrintChequeDialog({ isOpen, onClose, checkData, bankId }: PrintChequeDialogProps) {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchTemplate = async (id: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/rap/cheque-print-templates');
      const data = await res.json();
      const existing = Array.isArray(data) ? data.find((t: any) => String(t.bankRef) === String(id)) : null;
      if (existing) {
        setTemplate(existing);
      } else {
        setTemplate(null);
        toast.error('قالبی برای این بانک تنظیم نشده است.');
      }
    } catch(e) {
      toast.error('خطا در دریافت قالب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bankId) {
      fetchTemplate(bankId);
    }
  }, [isOpen, bankId]);

  const handlePrint = () => {
    if (!template) return;
    
    // Create an iframe to print just the check content
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Use absolute positioning to replicate the drag&drop setup
    // But WITHOUT the background image when actually printing, since the check is in the printer
    const noBackground = true; 
    
    // Extract textual amount and date using basic helper if checkData only has numeric.
    const numericAmount = checkData.amount || '';
    const textualAmount = `(${numericAmount} ریال)`; // We should ideally use a number-to-words library, mock for now
    
    doc.write('<html><head><title>Print Check</title>');
    doc.write(`<style>
      @media print {
        @page { margin: 0; size: auto; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; font-family: tahoma, sans-serif; }
      }
      .field { position: absolute; direction: rtl; }
      /* Basic security perforation styling hint */
      .perforage { letter-spacing: 5px; font-weight: bold; font-family: 'Courier New', Courier, monospace; }
    </style>`);
    doc.write('</head><body>');
    
    // Map of IDs to actual check data
    const dataMap: Record<string, string> = {
      'numericDate': checkData.due || '',
      'textualDate': checkData.due || '',
      'payee': checkData.payee || 'در وجه حامل',
      'description': checkData.desc || '',
      'nationalId': checkData.nationalId || '',
      'numericAmount': numericAmount,
      'textualAmount': textualAmount,
      'perforage': numericAmount, // Perforage usually prints amount again
    };

    const els = (template.config || []).map((f: any) => {
      let val = dataMap[f.id] || '';
      
      if (f.id === 'numericAmount' && f.removeCommas) {
         val = val.replace(/,/g, '');
      }
      if (f.id === 'numericDate' && f.removeSlashes) {
         val = val.replace(/\//g, '');
      }
      
      if (f.id === 'numericAmount' && f.isPerforated && val) {
         val = `* ${val.split('').join(' * ')} *`;
      }
      if (['textualAmount', 'payee', 'description'].includes(f.id) && f.fillWithDashes && val) {
         val = `--- ${val} ---`;
      }

      const extraClass = (f.id === 'numericAmount' && f.isPerforated) || f.id === 'perforage' ? 'perforage' : '';

      if (f.separateBoxes && (f.id === 'numericAmount' || f.id === 'numericDate')) {
        const boxWidth = f.boxWidth || 15;
        const flexInner = val.split('').map((c: string) => `<span style="width: ${boxWidth}px; flex-shrink: 0; display: inline-flex; justify-content: center; align-items: center;">${c}</span>`).join('');
        return `<div class="field ${extraClass}" style="left: ${f.x}px; top: ${f.y}px; width: ${f.width}px; height: ${f.height}px; font-size: ${f.fontSize}px; font-family: ${f.fontFamily || 'tahoma, sans-serif'}; color: ${f.color || '#000'}; text-align: ${f.textAlign || 'center'}; display: flex; flex-direction: row; direction: ltr;">
          ${flexInner}
        </div>`;
      }

      return `<div class="field ${extraClass}" style="left: ${f.x}px; top: ${f.y}px; width: ${f.width}px; height: ${f.height}px; font-size: ${f.fontSize}px; font-family: ${f.fontFamily || 'tahoma, sans-serif'}; color: ${f.color || '#000'}; letter-spacing: ${f.letterSpacing || 0}px; text-align: ${f.textAlign || 'center'};">
        ${val}
      </div>`;
    }).join('');

    doc.write(els);
    doc.write('</body></html>');
    doc.close();

    // Call print after a tiny delay to ensure render
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      document.body.removeChild(iframe);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rtl">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-[95vw] h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">چاپ چک</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center bg-gray-100 overflow-y-auto">
          {loading ? (
            <div className="m-auto text-gray-500">در حال دریافت قالب...</div>
          ) : !template ? (
            <div className="m-auto text-red-500 bg-red-50 px-4 py-2 rounded">
              هیچ قالبی برای این بانک تنظیم نشده است. ابتدا در بخش تنظیمات قالب، شکل چک را طراحی کنید.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex justify-between w-full max-w-[800px] mb-2 px-4">
                <span className="text-sm font-medium text-gray-600">پیش‌نمایش (تصویر زمینه در زمان چاپ حذف خواهد شد)</span>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
                >
                  <Printer className="w-4 h-4" />
                  چاپ روی چک
                </button>
              </div>

              {/* Preview Area */}
              <div 
                ref={printRef}
                className="relative bg-white shadow-xl max-w-full overflow-hidden" 
                style={{ width: '800px', height: '400px' }} // MUST match design aspect ratio
              >
                {template.imageBlob && (
                  <img src={template.imageBlob} alt="Check template" className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />
                )}
                
                {(template.config || []).map((f: any) => {
                  let val = '';
                  if (f.id === 'numericAmount') val = f.removeCommas ? (checkData.amount || '').replace(/,/g, '') : (checkData.amount || '');
                  else if (f.id === 'textualAmount') val = checkData.amount ? `(${checkData.amount} ریال)` : '';
                  else if (f.id === 'numericDate') val = f.removeSlashes ? (checkData.due || '').replace(/\//g, '') : (checkData.due || '');
                  else if (f.id === 'textualDate') val = checkData.due || '';
                  else if (f.id === 'payee') val = checkData.payee || 'در وجه حامل';
                  else if (f.id === 'description') val = checkData.desc || '';
                  else if (f.id === 'nationalId') val = checkData.nationalId || '';
                  else if (f.id === 'perforage') val = checkData.amount || '';

                  if (f.id === 'numericAmount' && f.isPerforated && val) {
                     val = `* ${val.split('').join(' * ')} *`;
                  }
                  if (['textualAmount', 'payee', 'description'].includes(f.id) && f.fillWithDashes && val) {
                     val = `--- ${val} ---`;
                  }

                  const isPerf = (f.id === 'numericAmount' && f.isPerforated) || f.id === 'perforage';

                  return (
                    <div
                      key={f.id}
                      className={`absolute overflow-hidden text-blue-900 border border-blue-200/50 bg-blue-50/20 backdrop-blur-[1px] px-1 whitespace-nowrap ${isPerf ? 'tracking-[5px] font-bold font-mono text-center w-full block' : ''}`}
                      style={{
                        left: f.x,
                        top: f.y,
                        width: f.width,
                        height: f.height,
                        fontSize: `${f.fontSize}px`,
                        fontFamily: f.fontFamily || 'tahoma, sans-serif',
                        color: f.color || '#000000',
                        letterSpacing: `${f.letterSpacing || 0}px`,
                        textAlign: f.textAlign || ('center' as any)
                      }}
                    >
                      {f.separateBoxes && (f.id === 'numericAmount' || f.id === 'numericDate') ? (
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', direction: 'ltr' }}>
                           {val.split('').map((c: string, idx: number) => (
                             <span key={idx} style={{ 
                               width: `${f.boxWidth || 15}px`, 
                               flexShrink: 0, 
                               display: 'flex', 
                               justifyContent: 'center', 
                               alignItems: 'center'
                              }}>
                               {c}
                             </span>
                           ))}
                        </div>
                      ) : (
                        <span className={f.fillWithDashes || isPerf ? "text-center w-full block" : ""}>
                          {val}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
