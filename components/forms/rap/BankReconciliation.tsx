"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "@/components/Providers";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import moment from "moment-jalaali";
import { BankAccountDropDown, SingleSelectDropDown, TextInput, DateInput, CheckBoxRightLabel } from "@/components/inputs";
import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle2, RotateCcw, Eye, X, HelpCircle, Filter } from "lucide-react";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn, apiFetch } from "@/lib/utils";

interface BankReconciliationProps {
  id?: string;
}

export default function BankReconciliation({ id }: BankReconciliationProps) {
  const { t, language } = useLanguage();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();
  const { activeId, isUpdate, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("BankReconciliation", activeId);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoMethod, setAutoMethod] = useState("numberAndAmount");
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const [bookFilter, setBookFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");

  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);
  const [refreshNumberingTrigger, setRefreshNumberingTrigger] = useState(0);

  const [values, setValues] = useState<Record<string, any>>({
    number: "",
    date: moment().locale('en').format("jYYYY/jMM/jDD"),
    bankAccountRef: null,
    bankAccount: null,
    bankStatementRef: null,
    bankStatement: null,
    isOpening: false,
  });

  const [gridData, setGridData] = useState<Record<string, any[]>>({
    book: [],
    bank: []
  });

  const getFilteredBookData = () => {
    return gridData.book.filter(row => {
      if (bookFilter === "cleared") return row.clearanceStatus === "پاس شده";
      if (bookFilter === "not_cleared") return row.clearanceStatus !== "پاس شده";
      return true;
    });
  };

  const getFilteredBankData = () => {
    return gridData.bank.filter(row => {
      if (bankFilter === "cleared") return row.clearanceStatus === "پاس شده";
      if (bankFilter === "not_cleared") return row.clearanceStatus !== "پاس شده";
      return true;
    });
  };

  const gridTabs: TabCellConfig[] = [
    {
      id: "book",
      label: "اقلام دفتر",
      columns: [
        { key: "type", header: "نوع", type: "text", width: "120px" },
        { key: "number", header: "شماره", type: "text", width: "120px" },
        { key: "date", header: "تاریخ", type: "text", width: "120px" },
        { key: "debit", header: "بدهکار", type: "amount", width: "150px" },
        { key: "credit", header: "بستانکار", type: "amount", width: "150px" },
        { key: "clearanceStatus", header: "وضعیت پاس", type: "text", width: "150px" },
      ],
    },
    {
      id: "bank",
      label: "اقلام بانک",
      columns: [
        { key: "type", header: "نوع", type: "text", width: "120px" },
        { key: "number", header: "شماره", type: "text", width: "120px" },
        { key: "date", header: "تاریخ", type: "text", width: "120px" },
        { key: "debit", header: "بدهکار", type: "amount", width: "150px" },
        { key: "credit", header: "بستانکار", type: "amount", width: "150px" },
        { key: "clearanceStatus", header: "وضعیت پاس", type: "text", width: "150px" },
      ],
    }
  ];

  const handleGridChange = (newGridData: any) => {
    setGridData(newGridData);
  };

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!isUpdate && values.date) {
      apiFetch(`/api/rap/bank-reconciliations/next-numbers?date=${values.date}`)
        .then(res => res.json())
        .then(data => {
          setIsDocumentNoAuto(data.isDocumentNumberAuto);
          if (data.error) {
            showToast(data.error, "error");
          }
          if (data.isDocumentNumberAuto && data.documentNumber) {
            setValues(prev => ({ ...prev, number: data.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [values.date, isUpdate, refreshNumberingTrigger]);

  useEffect(() => {
    if (values.bankStatementRef) {
      setIsLoading(true);
      apiFetch(`/api/rap/reconcile-bank-statements/${values.bankStatementRef}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          const bankItems = (data.items || []).map((item: any, index: number) => ({
            _id: `bank-${item.ReconcileBankStatementItemID || index}`,
            type: item.description || "",
            number: item.documentNumber || "",
            date: item.documentDate || "",
            debit: item.debit || 0,
            credit: item.credit || 0,
            clearanceStatus: "مغایرت",
          }));
          
          setGridData((prev) => ({
            ...prev,
            bank: bankItems
          }));
        })
        .catch((err) => {
          console.error(err);
          showToast("خطا در دریافت اطلاعات صورتحساب بانکی", "error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setGridData((prev) => ({
        ...prev,
        bank: []
      }));
    }
  }, [values.bankStatementRef]);

  const fields: FieldConfig[] = [
    {
      name: "rightGroup",
      label: "",
      type: "custom",
      customComponent: (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1 min-w-0">
            <BankAccountDropDown
              label="حساب بانکی :"
              value={values.bankAccount || null}
              onChange={(selected) => {
                handleChange("bankAccount", selected);
                handleChange("bankAccountRef", selected ? (selected.bankAccountId || selected.id) : null);
                handleChange("bankStatement", null);
                handleChange("bankStatementRef", null);
              }}
              required
              labelWidth="80px"
              disabled={isUsed || isLoading}
            />
          </div>
          <div className="flex-1 min-w-0">
            <SingleSelectDropDown
              label="صورتحساب بانکی :"
              value={values.bankStatement || null}
              onChange={(selected: any) => {
                handleChange("bankStatement", selected);
                handleChange("bankStatementRef", selected ? (selected.ReconcileBankStatementID || selected.id) : null);
              }}
              listApiUrl="/api/rap/reconcile-bank-statements"
              displayKey="Number"
              columns={[
                { key: "Number", label: "شماره", width: 120 },
                { key: "Date", label: "تاریخ", width: 120 },
                { key: "balance", label: "مانده", width: 150 },
              ]}
              required
              labelWidth="95px"
              disabled={isUsed || isLoading || !values.bankAccountRef}
            />
          </div>
        </div>
      )
    },
    {
      name: "leftGroup",
      label: "",
      type: "custom",
      customComponent: (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1 min-w-0">
            <TextInput
              label="شماره :"
              value={values.number || ""}
              onChange={(val) => handleChange("number", val)}
              disabled={isUsed || isLoading || isDocumentNoAuto}
              required={!isDocumentNoAuto}
              labelWidth="80px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <DateInput
              label="تاریخ :"
              value={values.date || ""}
              onChange={(val) => {
                handleChange("date", val);
                if (!isUpdate) {
                  setRefreshNumberingTrigger(prev => prev + 1);
                }
              }}
              required
              labelWidth="80px"
              disabled={isUsed || isLoading}
            />
          </div>
        </div>
      )
    },
    {
      name: "isOpening",
      label: "",
      type: "custom",
      customComponent: (
        <CheckBoxRightLabel
          text="استقرار"
          checked={values.isOpening || false}
          onChange={(checked) => handleChange("isOpening", checked)}
          disabled={isUsed || isLoading}
        />
      )
    },
  ];

  const handleReset = () => {
    setActiveId(undefined);
    setValues({
      number: "",
      date: moment().locale('en').format("jYYYY/jMM/jDD"),
      bankAccountRef: null,
      bankAccount: null,
      bankStatementRef: null,
      bankStatement: null,
      isOpening: false,
    });
    setGridData({
      book: [],
      bank: []
    });
  };

  const handleSave = async () => {
    showToast("این نسخه پیش‌نمایش رابط کاربری است.", "info");
  };

  const isActionEnabled = !!values.bankAccountRef && !!values.bankStatementRef;

  const actionbar = (
    <div className="flex items-center gap-1 border-r pr-3 ml-3">
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 text-[11px] gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
        disabled={!isActionEnabled}
        onClick={() => setIsAutoModalOpen(true)}
      >
        <Calculator className="h-3.5 w-3.5" />
        مغایرت بانکی اتوماتیک
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5" disabled={!isActionEnabled}>
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        پاس
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5" disabled={!isActionEnabled}>
        <RotateCcw className="h-3.5 w-3.5 text-orange-600" />
        برگشت
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5" disabled={!isActionEnabled}>
        <Eye className="h-3.5 w-3.5 text-blue-600" />
        نمایش
      </Button>
    </div>
  );

  return (
    <SimpleFormTwoRowTabbed
      title="مغایرت بانکی"
      fields={fields}
      values={values}
      onChange={(name, value) => setValues(prev => ({ ...prev, [name]: value }))}
      onSave={handleSave}
      onSaveNew={async () => { await handleSave(); handleReset(); }}
      onSaveClose={async () => { await handleSave(); if(activeTabId) removeTab(activeTabId); }}
      onNew={handleReset}
      showListButton={true}
      listApiUrl="/api/rap/bank-reconciliations"
      listColumns={[
        { key: "BankReconciliationID", label: "کد", width: 80 },
        { key: "Number", label: "شماره", width: 120 },
        { key: "Date", label: "تاریخ", width: 120 },
      ]}
      listDisplayKey="Number"
      onListSelect={(item: any) => {
        const itemId = item.BankReconciliationID || item.id;
        if (activeId !== itemId) {
          if (addTab) {
            addTab(
              `مغایرت بانکی ${item.Number || ''}`,
              'rap',
              null,
              "BankReconciliationForm",
              { id: itemId }
            );
          }
        }
      }}
      actionbar={actionbar}
      isReadonly={isUsed || isLoading}
      showLoadingOverlay={isLoading}
      childrenPaddingClassName="p-[1px] flex flex-col h-full overflow-hidden"
    >
      <div className="flex flex-col gap-[1px] relative z-10 w-full h-full min-h-0">
        {/* Box 1: اقلام دفتر */}
        <div className="flex-1 min-h-0 flex flex-row border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-[#1a1c23]">
          {/* Vertical Title Column on the Right */}
          <div className="w-8 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-l border-gray-300 dark:border-gray-700 shrink-0 select-none">
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold text-gray-700 dark:text-gray-200 tracking-widest leading-none text-center">
              اقلام دفتر
            </span>
          </div>
          
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <TabCellRow
              tabs={[gridTabs[0]]}
              value={{ book: gridData.book }}
              onChange={(newBookData: any) => {
                handleGridChange({
                  ...gridData,
                  book: newBookData
                });
              }}
              hideHeader={true}
              isReadonly={isUsed || isLoading}
              onActiveRowChange={(tabId, rowIndex, rowData) => {
                if (rowData?.matchId) {
                  setActiveMatchId(rowData.matchId);
                } else {
                  setActiveMatchId(null);
                }
              }}
              rowClassName={(row) => {
                let isHidden = false;
                if (bookFilter === "cleared" && row.clearanceStatus !== "پاس شده") isHidden = true;
                if (bookFilter === "not_cleared" && row.clearanceStatus === "پاس شده") isHidden = true;
                
                return cn(
                  (row.matchId && row.matchId === activeMatchId) ? "bg-green-100 dark:bg-green-900/40" : "",
                  isHidden ? "hidden" : ""
                );
              }}
              footerActions={
                <div className="flex items-center gap-1 text-[11px] text-gray-600 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-1 ml-auto">
                  <Filter className="w-3 h-3 text-gray-500" />
                  <select 
                    value={bookFilter}
                    onChange={(e) => setBookFilter(e.target.value)}
                    className="bg-transparent outline-none py-0.5 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <option value="all">همه</option>
                    <option value="cleared">پاس شده</option>
                    <option value="not_cleared">پاس نشده</option>
                  </select>
                </div>
              }
            />
          </div>
        </div>

        {/* Box 2: اقلام بانک */}
        <div className="flex-1 min-h-0 flex flex-row border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-[#1a1c23]">
          {/* Vertical Title Column on the Right */}
          <div className="w-8 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-l border-gray-300 dark:border-gray-700 shrink-0 select-none">
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold text-gray-700 dark:text-gray-200 tracking-widest leading-none text-center">
              اقلام بانک
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden relative">
            <TabCellRow
              tabs={[gridTabs[1]]}
              value={{ bank: gridData.bank }}
              onChange={(newBankData: any) => {
                handleGridChange({
                  ...gridData,
                  bank: newBankData
                });
              }}
              hideHeader={true}
              isReadonly={isUsed || isLoading}
              onActiveRowChange={(tabId, rowIndex, rowData) => {
                if (rowData?.matchId) {
                  setActiveMatchId(rowData.matchId);
                } else {
                  setActiveMatchId(null);
                }
              }}
              rowClassName={(row) => {
                let isHidden = false;
                if (bankFilter === "cleared" && row.clearanceStatus !== "پاس شده") isHidden = true;
                if (bankFilter === "not_cleared" && row.clearanceStatus === "پاس شده") isHidden = true;
                
                return cn(
                  (row.matchId && row.matchId === activeMatchId) ? "bg-green-100 dark:bg-green-900/40" : "",
                  isHidden ? "hidden" : ""
                );
              }}
              footerActions={
                <div className="flex items-center gap-1 text-[11px] text-gray-600 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-1 ml-auto">
                  <Filter className="w-3 h-3 text-gray-500" />
                  <select 
                    value={bankFilter}
                    onChange={(e) => setBankFilter(e.target.value)}
                    className="bg-transparent outline-none py-0.5 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <option value="all">همه</option>
                    <option value="cleared">پاس شده</option>
                    <option value="not_cleared">پاس نشده</option>
                  </select>
                </div>
              }
            />
          </div>
        </div>
      </div>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isAutoModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#f0f0f0] rounded shadow-xl w-[400px] flex flex-col border border-gray-300"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gradient-to-b from-[#f9f9f9] to-[#eaeaea]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-[13px]">مغایرت بانکی اتوماتیک</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="text-blue-500 hover:text-blue-700 p-1">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsAutoModalOpen(false)}
                      className="text-gray-500 hover:text-red-500 p-1"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Modal Body */}
                <div className="p-6 bg-[#f7f7f7]">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-medium text-gray-700 whitespace-nowrap">روش پاس شدن اتوماتیک:</span>
                    
                    <div className="flex items-center gap-6 bg-white p-2 border border-gray-300 rounded flex-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="autoMethod" 
                          value="numberAndAmount"
                          checked={autoMethod === "numberAndAmount"}
                          onChange={() => setAutoMethod("numberAndAmount")}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-[12px] text-gray-800">شماره و مبلغ</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="autoMethod" 
                          value="onlyAmount"
                          checked={autoMethod === "onlyAmount"}
                          onChange={() => setAutoMethod("onlyAmount")}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-[12px] text-gray-800">فقط مبلغ</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="flex justify-start gap-2 p-3 border-t border-gray-300 bg-[#f0f0f0]">
                  <button
                    onClick={() => setIsAutoModalOpen(false)}
                    className="px-6 py-1.5 text-[12px] font-medium text-gray-800 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded hover:from-gray-100 hover:to-gray-300 active:bg-gray-300"
                    type="button"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={() => {
                      setIsAutoModalOpen(false);
                      const newBook = [...gridData.book];
                      const newBank = [...gridData.bank];
                      let matchedCount = 0;
                      
                      for (let i = 0; i < newBook.length; i++) {
                        if (newBook[i].clearanceStatus === "پاس شده") continue;
                        
                        const bookNumber = newBook[i].number;
                        const bookDebit = parseFloat(String(newBook[i].debit).replace(/,/g, "")) || 0;
                        const bookCredit = parseFloat(String(newBook[i].credit).replace(/,/g, "")) || 0;
                        
                        let matchedBankIndex = -1;
                        
                        for (let j = 0; j < newBank.length; j++) {
                          if (newBank[j].clearanceStatus === "پاس شده") continue;
                          
                          const bankNumber = newBank[j].number;
                          const bankDebit = parseFloat(String(newBank[j].debit).replace(/,/g, "")) || 0;
                          const bankCredit = parseFloat(String(newBank[j].credit).replace(/,/g, "")) || 0;
                          
                          if (autoMethod === "numberAndAmount") {
                            if (bookNumber === bankNumber) {
                              if ((bookDebit === bankCredit && bookDebit > 0) || (bookCredit === bankDebit && bookCredit > 0)) {
                                matchedBankIndex = j;
                                break;
                              }
                            }
                          } else if (autoMethod === "onlyAmount") {
                            if ((bookDebit === bankCredit && bookDebit > 0) || (bookCredit === bankDebit && bookCredit > 0)) {
                              matchedBankIndex = j;
                              break;
                            }
                          }
                        }
                        
                        if (matchedBankIndex !== -1) {
                          const matchId = `match_${Date.now()}_${i}`;
                          newBook[i] = { ...newBook[i], clearanceStatus: "پاس شده", matchId };
                          newBank[matchedBankIndex] = { ...newBank[matchedBankIndex], clearanceStatus: "پاس شده", matchId };
                          matchedCount++;
                        }
                      }
                      
                      setGridData({
                        book: newBook,
                        bank: newBank
                      });
                      
                      if (matchedCount > 0) {
                        showToast(`${matchedCount} مورد با موفقیت پاس شد.`, "success");
                      } else {
                        showToast("موردی برای پاس شدن یافت نشد.", "info");
                      }
                    }}
                    className="px-6 py-1.5 text-[12px] font-medium text-gray-800 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded hover:from-gray-100 hover:to-gray-300 active:bg-gray-300"
                    type="button"
                  >
                    شروع
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </SimpleFormTwoRowTabbed>
  );
}
