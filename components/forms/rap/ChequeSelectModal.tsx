import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/utils';
import { LoadingOverlay } from '../../ui/LoadingOverlay';

interface ChequeSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedCheques: any[]) => void;
}

export function ChequeSelectModal({ open, onClose, onSelect }: ChequeSelectModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const fetchAvailableCheques = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/rap/receipt-notifications/cheques/available-for-assignment');
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailableCheques();
      setSelectedItems([]);
    }
  }, [open]);

  const toggleSelection = (item: any) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 w-[90%] max-w-[900px] h-[600px] shadow-lg rounded flex flex-col overflow-hidden">
        <div className="flex px-4 py-3 justify-between items-center border-b border-gray-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">انتخاب چک واگذاری</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
        </div>
        
        <div className="flex-1 overflow-auto relative p-2 bg-white dark:bg-slate-900">
          <LoadingOverlay visible={loading} message="در حال بارگزاری..." />
          <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
              <tr>
                <th className="p-2 border border-slate-200 dark:border-slate-700 w-10 text-center">
                  #
                </th>
                <th className="p-2 border border-slate-200 dark:border-slate-700">شماره چک</th>
                <th className="p-2 border border-slate-200 dark:border-slate-700">تاریخ چک</th>
                <th className="p-2 border border-slate-200 dark:border-slate-700">مبلغ</th>
                <th className="p-2 border border-slate-200 dark:border-slate-700">بانک</th>
                <th className="p-2 border border-slate-200 dark:border-slate-700">کد عملیات</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr 
                  key={item.id || i}
                  onClick={() => toggleSelection(item)}
                  className={`cursor-pointer border-b border-slate-200 dark:border-slate-700 ${selectedItems.find(s => s.id === item.id) ? 'bg-blue-50 dark:bg-blue-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <td className="p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={!!selectedItems.find(s => s.id === item.id)}
                      onChange={() => {}}
                    />
                  </td>
                  <td className="p-2">{item.chequeNumber}</td>
                  <td className="p-2">{item.transferChequeDate || ''}</td>
                  <td className="p-2">{item.amount?.toLocaleString('en-US')}</td>
                  <td className="p-2">{item.bankName}</td>
                  <td className="p-2">{item.opCode} - {item.opTitle}</td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-slate-500">
                    رکوردی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={onClose}
            type="button"
            className="flex items-center justify-center rounded px-4 py-2 font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
          >
           انصراف
          </button>
          <button
            onClick={() => onSelect(selectedItems)}
            type="button"
            disabled={selectedItems.length === 0}
            className={`flex items-center justify-center rounded px-4 py-2 font-medium transition-colors ${selectedItems.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-300 dark:bg-slate-800 text-black/40 dark:text-white/40 cursor-not-allowed'}`}
          >
            انتخاب
          </button>
        </div>
      </div>
    </div>
  );
}
