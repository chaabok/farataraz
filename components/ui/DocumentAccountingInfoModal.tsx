import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { apiFetch } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, Tag } from 'lucide-react';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';

interface DocumentAccountingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  documentRef?: number | null;
  party?: any;
  activeRowData?: any;
}

const getRelatedDetailedTypes = (accountInfo: any, level: number): any[] => {
  if (!accountInfo || !accountInfo.relatedDetailedAccounts) return [];
  const rels = accountInfo.relatedDetailedAccounts.filter((r: any) => Number(r.detailedLevel) === level);
  return rels.map((r: any) => r.detailedType).filter(Boolean);
};

const getRelatedDetailedType = (accountInfo: any, level: number) => {
  const list = getRelatedDetailedTypes(accountInfo, level);
  return list.length > 0 ? list[0] : null;
};

export function DocumentAccountingInfoModal({ isOpen, onClose, documentType, documentRef, party, activeRowData }: DocumentAccountingInfoModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [detailedAccounts, setDetailedAccounts] = useState<any[]>([]);
  const [accountingSettings, setAccountingSettings] = useState<any>(null);

  
  

  
  

  const loadSettings = async () => {
    try {
      const res = await apiFetch('/api/common/base-settings/6');
      const settingsData = await res.json();
      setAccountingSettings(settingsData.data || settingsData);
    } catch (e) {
      console.error('Failed to load accounting settings', e);
    }
  };

  const loadDetailedAccounts = async () => {
    try {
      const res = await apiFetch('/api/accounting/detailed-accounts');
      const json = await res.json();
      let arr: any[] = [];
      if (Array.isArray(json)) arr = json;
      else if (json && Array.isArray(json.data)) arr = json.data;
      else if (json && json.data && Array.isArray(json.data.data)) arr = json.data.data;
      else if (json && Array.isArray(json.items)) arr = json.items;
      setDetailedAccounts(arr);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/rap/document-accounting-info?documentType=${documentType}&documentRef=${documentRef}`);
      const json = await res.json();
      if (json.success && json.items) {
        setItems(json.items);
      } else if (json.success && json.opAccountInfo !== undefined) {
        // Fallback for single item
        setItems([{
           rowType: 'سند پایه',
           rowRef: 0,
           opAccountInfo: json.opAccountInfo,
           forAccountInfo: json.forAccountInfo,
           data: json.data || {}
        }]);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadDetailedAccounts();
      if (documentRef) {
        loadData();
      } else {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [isOpen, documentRef]);

  // Apply default auto-set logic if not loaded yet
  useEffect(() => {
    if (isOpen && (documentType === 'ReceiptNotification' || documentType === 'PaymentNotification' || documentType === 'ReceivedChequeOperation' || documentType === 'PettyCashSummary') && items.length > 0) {
      setItems((prevItems) => {
        let anyChanged = false;
        const nextItems = prevItems.map(item => {
           let changed = false;
           const nextData = { ...(item.data || {}) };
           
           const partyAccountId = item.suggestedPartyDetailedAccountId;
           const opPartyAccountId = item.suggestedOpPartyDetailedAccountId !== undefined ? item.suggestedOpPartyDetailedAccountId : item.suggestedPartyDetailedAccountId;
           const forPartyAccountId = item.suggestedForPartyDetailedAccountId !== undefined ? item.suggestedForPartyDetailedAccountId : item.suggestedPartyDetailedAccountId;
           const opAccountId = item.suggestedOpDetailedAccountId;

           const pAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(partyAccountId));
           const pTypesId = pAccount?.detailedTypesId || pAccount?.DetailedTypesID || pAccount?.detailedType?.detailedTypesId || pAccount?.detailedType?.DetailedTypesID || null;

           const opPartyAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(opPartyAccountId));
           const opPartyTypesId = opPartyAccount?.detailedTypesId || opPartyAccount?.DetailedTypesID || opPartyAccount?.detailedType?.detailedTypesId || opPartyAccount?.detailedType?.DetailedTypesID || null;

           const forPartyAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(forPartyAccountId));
           const forPartyTypesId = forPartyAccount?.detailedTypesId || forPartyAccount?.DetailedTypesID || forPartyAccount?.detailedType?.detailedTypesId || forPartyAccount?.detailedType?.DetailedTypesID || null;

           const oAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(opAccountId));
           const oTypesId = oAccount?.detailedTypesId || oAccount?.DetailedTypesID || oAccount?.detailedType?.detailedTypesId || oAccount?.detailedType?.DetailedTypesID || null;

           let matchedForLevel = null;
           if (pTypesId && item.forAccountInfo?.relatedDetailedAccounts) {
             const rel = item.forAccountInfo.relatedDetailedAccounts.find(
               (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(pTypesId)
             );
             if (rel) matchedForLevel = Number(rel.detailedLevel);
           }
           
           let matchedOpCashLevel = null;
           if (oTypesId && item.opAccountInfo?.relatedDetailedAccounts) {
             const rel = item.opAccountInfo.relatedDetailedAccounts.find(
               (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(oTypesId)
             );
             if (rel) matchedOpCashLevel = Number(rel.detailedLevel);
           }
           
           let matchedOpPartyLevel = null;
           if (opPartyTypesId && item.opAccountInfo?.relatedDetailedAccounts) {
             const rel = item.opAccountInfo.relatedDetailedAccounts.find(
               (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(opPartyTypesId)
             );
             if (rel) matchedOpPartyLevel = Number(rel.detailedLevel);
           }

           let matchedForPartyLevel = null;
           if (forPartyTypesId && item.forAccountInfo?.relatedDetailedAccounts) {
             const rel = item.forAccountInfo.relatedDetailedAccounts.find(
               (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(forPartyTypesId)
             );
             if (rel) matchedForPartyLevel = Number(rel.detailedLevel);
           }

           if (matchedOpPartyLevel && opPartyAccountId) {
             const key = `opDetail${matchedOpPartyLevel}Ref`;
             if (String(nextData[key]) !== String(opPartyAccountId)) {
               nextData[key] = opPartyAccountId;
               changed = true;
             }
           } else if (matchedOpCashLevel && opAccountId) {
             const key = `opDetail${matchedOpCashLevel}Ref`;
             if (String(nextData[key]) !== String(opAccountId)) {
               nextData[key] = opAccountId;
               changed = true;
             }
           }
           
           if (matchedForPartyLevel && forPartyAccountId) {
             const key = `forDetail${matchedForPartyLevel}Ref`;
             if (String(nextData[key]) !== String(forPartyAccountId)) {
               nextData[key] = forPartyAccountId;
               changed = true;
             }
           } else if (matchedForLevel && partyAccountId) {
             const key = `forDetail${matchedForLevel}Ref`;
             if (String(nextData[key]) !== String(partyAccountId)) {
               nextData[key] = partyAccountId;
               changed = true;
             }
           }

           let matchedBankLevel = null;
           if (item.forAccountInfo?.relatedDetailedAccounts) {
             const rel = item.forAccountInfo.relatedDetailedAccounts.find(
               (r: any) => r.detailedType?.title === 'حساب بانکی' || r.detailedType?.title?.includes('حساب بانکی') || Number(r.detailedType?.code) === 1 || Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID) === 1
             );
             if (rel) matchedBankLevel = Number(rel.detailedLevel);
           }

           if (matchedBankLevel && item.suggestedBankDetailedAccountId) {
             const key = `forDetail${matchedBankLevel}Ref`;
             if (!nextData[key] && String(nextData[key]) !== String(item.suggestedBankDetailedAccountId)) {
               nextData[key] = item.suggestedBankDetailedAccountId;
               changed = true;
             }
           }

           if (changed) {
             anyChanged = true;
             return { ...item, data: nextData };
           }
           return item;
        });
        return anyChanged ? nextItems : prevItems;
      });
    }
  }, [isOpen, documentType, items, detailedAccounts]);

  const handleSave = async () => {
    if (!documentRef) return;
    setSaving(true);
    try {
      const payload = items.map(item => ({
         documentType,
         documentRef,
         rowType: item.rowType,
         rowRef: item.rowRef,
         ...item.data
      }));
      const res = await apiFetch('/api/rap/document-accounting-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onClose();
      } else {
        alert('Error saving: ' + (data.message || 'Unknown error'));
      }
    } catch (e: any) {
      console.error(e);
      alert('Exception: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (itemIndex: number, prefix: 'Op' | 'For', accountInfo: any) => {
    const item = items[itemIndex];
    const data = item.data || {};
    const levels = parseInt(accountingSettings?.detailedLevels || '3', 10);
    const inputs = [];

    const partyAccountId = item.suggestedPartyDetailedAccountId;
    const opPartyAccountId = item.suggestedOpPartyDetailedAccountId !== undefined ? item.suggestedOpPartyDetailedAccountId : item.suggestedPartyDetailedAccountId;
    const forPartyAccountId = item.suggestedForPartyDetailedAccountId !== undefined ? item.suggestedForPartyDetailedAccountId : item.suggestedPartyDetailedAccountId;
    const opAccountId = item.suggestedOpDetailedAccountId;

    const pAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(partyAccountId));
    const pTypesId = pAccount?.detailedTypesId || pAccount?.DetailedTypesID || pAccount?.detailedType?.detailedTypesId || pAccount?.detailedType?.DetailedTypesID || null;

    const opPartyAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(opPartyAccountId));
    const opPartyTypesId = opPartyAccount?.detailedTypesId || opPartyAccount?.DetailedTypesID || opPartyAccount?.detailedType?.detailedTypesId || opPartyAccount?.detailedType?.DetailedTypesID || null;

    const forPartyAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(forPartyAccountId));
    const forPartyTypesId = forPartyAccount?.detailedTypesId || forPartyAccount?.DetailedTypesID || forPartyAccount?.detailedType?.detailedTypesId || forPartyAccount?.detailedType?.DetailedTypesID || null;

    const oAccount = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(opAccountId));
    const oTypesId = oAccount?.detailedTypesId || oAccount?.DetailedTypesID || oAccount?.detailedType?.detailedTypesId || oAccount?.detailedType?.DetailedTypesID || null;

    let matchedForLevel = null;
    let matchedOpCashLevel = null;
    let matchedOpPartyLevel = null;
    let matchedForPartyLevel = null;

    if (pTypesId && item.forAccountInfo?.relatedDetailedAccounts) {
      const rel = item.forAccountInfo.relatedDetailedAccounts.find(
        (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(pTypesId)
      );
      if (rel) matchedForLevel = Number(rel.detailedLevel);
    }
    
    if (oTypesId && item.opAccountInfo?.relatedDetailedAccounts) {
      const rel = item.opAccountInfo.relatedDetailedAccounts.find(
        (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(oTypesId)
      );
      if (rel) matchedOpCashLevel = Number(rel.detailedLevel);
    }
    
    if (opPartyTypesId && item.opAccountInfo?.relatedDetailedAccounts) {
      const rel = item.opAccountInfo.relatedDetailedAccounts.find(
        (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(opPartyTypesId)
      );
      if (rel) matchedOpPartyLevel = Number(rel.detailedLevel);
    }

    if (forPartyTypesId && item.forAccountInfo?.relatedDetailedAccounts) {
      const rel = item.forAccountInfo.relatedDetailedAccounts.find(
        (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(forPartyTypesId)
      );
      if (rel) matchedForPartyLevel = Number(rel.detailedLevel);
    }

    let matchedBankLevel = null;
    if (item.forAccountInfo?.relatedDetailedAccounts) {
      const rel = item.forAccountInfo.relatedDetailedAccounts.find(
        (r: any) => r.detailedType?.title === 'حساب بانکی' || r.detailedType?.title?.includes('حساب بانکی') || Number(r.detailedType?.code) === 1 || Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID) === 1
      );
      if (rel) matchedBankLevel = Number(rel.detailedLevel);
    }

    for (let i = 1; i <= levels; i++) {
      const key = `${prefix.toLowerCase()}Detail${i}Ref`;
      const selectedValue = data[key] || data[`${prefix}Detail${i}Ref`];
      const selectedItem = detailedAccounts.find(a => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(selectedValue)) || null;
      
      const relDetailedType = getRelatedDetailedType(accountInfo, i);
      const isLocked = !accountInfo || !relDetailedType;

      const isReceiptOrPayment = documentType === 'ReceiptNotification' || documentType === 'PaymentNotification' || documentType === 'ReceivedChequeOperation' || documentType === 'PaidDocumentClearing' || documentType === 'PromissoryNote' || documentType === 'PettyCashSummary';
      const isForcedByParty = isReceiptOrPayment && prefix === 'For' && i === matchedForLevel && !!partyAccountId;
      const isForcedByForParty = isReceiptOrPayment && prefix === 'For' && i === matchedForPartyLevel && !!forPartyAccountId;
      const isForcedByCash = isReceiptOrPayment && prefix === 'Op' && i === matchedOpCashLevel && !!opAccountId;
      const isForcedByOpParty = isReceiptOrPayment && prefix === 'Op' && i === matchedOpPartyLevel && !!opPartyAccountId;
      const isForcedByBank = isReceiptOrPayment && prefix === 'For' && i === matchedBankLevel && !!item.suggestedBankDetailedAccountId;
      const isForced = isForcedByParty || isForcedByForParty || isForcedByCash || isForcedByOpParty || isForcedByBank;

      const allowedDetailedTypesIds = getRelatedDetailedTypes(accountInfo, i).map((dt: any) => Number(dt.detailedTypesId || dt.id || dt.DetailedTypesID));
      const filteredDetailedAccounts = detailedAccounts.filter(acc => {
        const typeId = acc.detailedTypesId || acc.DetailedTypesID || acc.detailedType?.detailedTypesId || acc.detailedType?.DetailedTypesID;
        return allowedDetailedTypesIds.includes(Number(typeId));
      });
      if (i === 1 && detailedAccounts.length > 0) {
      }

      inputs.push(
        <div key={key} className="w-full min-w-0">
          {isLocked ? (
            <div className="flex items-center justify-center gap-2 px-2 h-[25px] w-full text-[11px] bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded text-slate-400 dark:text-slate-500 cursor-not-allowed min-w-0">
              <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>غیر مرتبط</span>
            </div>
          ) : isForced ? (
            <div className="flex items-center justify-between gap-2 px-2 h-[25px] w-full text-[11px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded text-amber-800 dark:text-amber-200 font-medium cursor-not-allowed min-w-0">
              <span className="flex-1 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{selectedItem ? `${selectedItem.code ? `${selectedItem.code} - ` : ''}${selectedItem.title}` : 'در حال بارگذاری...'}</span>
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-500 shrink-0" />
            </div>
          ) : (
            <SingleSelectDropDown
              data={filteredDetailedAccounts}
              columns={[
                { key: 'code', label: 'کد', width: 80 },
                { key: 'title', label: 'عنوان', width: 200 },
              ]}
              value={selectedItem}
              onChange={(sel: any) => {
                setItems((prev: any[]) => {
                  const newItems = [...prev];
                  if (!newItems[itemIndex].data) newItems[itemIndex].data = {};
                  newItems[itemIndex].data[key] = sel ? (sel.detailedAccountId || sel.id || sel.DetailedAccountID) : null;
                  return newItems;
                });
              }}
              displayKey="title"
              placeholder={`-- انتخاب ${relDetailedType?.title || 'تفصیلی'} --`}
              renderSelection={(sel: any) => sel ? `${sel.code ? `${sel.code} - ` : ''}${sel.title}` : `-- انتخاب ${relDetailedType?.title || 'تفصیلی'} --`}
            />
          )}
        </div>
      );
    }
    
    return (
      <div key={itemIndex} className="grid grid-cols-[80px_200px_1fr_1fr_1fr] gap-4 items-center py-3 border-b last:border-0 border-slate-200 dark:border-slate-800">
         {/* نوع */}
         <div className="font-bold text-sm text-slate-800 dark:text-slate-200 text-center">
             {item.rowType || 'سند پایه'}
         </div>
         {/* معین */}
         <div className="flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 h-[25px] rounded text-center overflow-x-auto whitespace-nowrap scrollbar-none mx-auto w-full max-w-[180px] select-all [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
             {accountInfo ? `${accountInfo.code || ''} - ${accountInfo.title || ''}` : '(نامشخص)'}
         </div>
         {/* تفصیلی ها */}
         {inputs}
      </div>
    );
  };

  const renderSection = (prefix: 'Op' | 'For', title: string, icon: React.ReactNode) => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/30 shadow-sm mt-4">
        {/* Section Header */}
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
           {icon}
           <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{title}</span>
         </div>
        
        <div className="overflow-x-auto custom-scrollbar">
           <div className="min-w-[800px]">
              {/* Table/Grid Header */}
              <div className="grid grid-cols-[80px_200px_1fr_1fr_1fr] gap-4 items-center px-4 py-2 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
                 <div className="text-center">نوع</div>
                 <div className="text-center">معین</div>
                 <div className="text-center">سطح تفصیلی 1</div>
                 <div className="text-center">سطح تفصیلی 2</div>
                 <div className="text-center">سطح تفصیلی 3</div>
              </div>

              {/* Rows */}
              <div className="px-4 bg-white dark:bg-slate-950/50 max-h-[180px] overflow-y-auto custom-scrollbar">
                 {items.map((item, index) => {
                     const accountInfo = prefix === 'Op' ? item.opAccountInfo : item.forAccountInfo;
                     return renderRow(index, prefix, accountInfo);
                 })}
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl text-right flex flex-col max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-800 dark:text-white">اطلاعات حسابداری (تفصیلی‌ها)</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">در حال بارگذاری...</div>
        ) : (
          <div className="flex flex-col gap-2 py-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {!documentRef && (
              <div className="text-amber-600 bg-amber-50 p-3 text-xs rounded border border-amber-200">
                برای ثبت اطلاعات حسابداری ابتدا باید سند پایه را ذخیره نمایید.
              </div>
            )}
            
            {items.length === 0 && documentRef && (
              <div className="text-slate-500 text-center text-sm p-8 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                هیچ اطلاعات مالی (نقد، چک، واریز و ...) برای این سند ثبت نشده است.
              </div>
            )}

            {items.length > 0 && (
               <>
                 {renderSection('Op', 'عملیات حسابداری:', <Tag className="w-4 h-4 text-slate-500" />)}
                 {renderSection('For', 'بابت:', <Tag className="w-4 h-4 text-slate-500" />)}
               </>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-start gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
          <Button onClick={handleSave} disabled={saving || !documentRef} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
          </Button>
          <Button variant="outline" onClick={onClose}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
