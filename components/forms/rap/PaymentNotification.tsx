"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { useConfirm } from '@/components/ConfirmProvider';
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { MultiColumnDropdown } from "../../inputs/MultiColumnDropdown";
import { ReasonSingleDropDown, RAP_REASON_NATURE_ENUM } from "../../inputs/ReasonSingleDropDown";
import { SingleSelectDropDown } from "../../inputs/SingleSelectDropDown";
import { StateListInput, isStatusApprovedOrReviewed } from "../../inputs/StateListInput";
import { CreditCard, Printer, Info, CheckCircle2, List } from "lucide-react";
import { eventBus, EVENTS } from "@/lib/events";
import { PrintChequeDialog } from "./PrintChequeDialog";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { apiFetch, toEnglishDigits } from "@/lib/utils";
import { DateInput } from "../../inputs/DateInput";
import { NumberInput } from "../../inputs/NumberInput";
import { FormLabel } from "../../inputs/FormLabel";
import { PrintDropdownButton } from "../../buttons/PrintDropdownButton";
import { VoucherActionButtons } from "../../buttons/VoucherActionButtons";
import { DocumentAccountingInfoModal } from "../../ui/DocumentAccountingInfoModal";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportViewer } from "@/components/forms/common/ReportViewer";
import moment from "moment-jalaali";
import { DynamicDetailedFields } from "@/components/ui/DynamicDetailedFields";
import { usePaymentNotificationStore } from "@/lib/stores/paymentNotificationStore";
import { generateVoucherInitialDataFromAccountingInfo } from "@/lib/voucher-utils";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ChequeSelectModal } from "./ChequeSelectModal";

interface PaymentNotificationFormProps {
 id?: number | string;
 initialData?: any;
 tabId?: string;
}

import { usePaymentNotificationColumns } from "./PaymentNotificationList";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";

export function PaymentNotificationForm({id, initialData, tabId }: PaymentNotificationFormProps) {
  const { confirm } = useConfirm();

  const rawListColumns = usePaymentNotificationColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const [isAccModalOpen, setIsAccModalOpen] = React.useState(false);

 const { t } = useLanguage();
 const { removeTab, addTab, activeTabId } = useTabs();
 const { showToast } = useToast();
 
 

  const { activeId, isUpdate, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id || initialData?.paymentNotificationId);
  const activeIdRef = React.useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);
 const { isUsed } = useFormUsageCheck("PaymentNotification", activeId);
  const [associatedVoucher, setAssociatedVoucher] = useState<any>(null);
 


 const {
 values,
 setValues,
 errors,
 setErrors,
 printCheckData,
 setPrintCheckData,
 isPrintDialogOpen,
 setIsPrintDialogOpen,
 activeRowData,
 setActiveRowData,
 reset
 } = usePaymentNotificationStore();

const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
  const [fiscalYearDetails, setFiscalYearDetails] = useState<any>(null);
  const [dateError, setDateError] = useState<string>('');
  const [refreshNumberingTrigger, setRefreshNumberingTrigger] = useState(0);

 const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);
 const [originalData, setOriginalData] = useState<any>(initialData || null);
 const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(true);
 const isReadonly = isUsed || !!associatedVoucher || String(values.status) === "8" || String(originalData?.status) === "8" || isFormDisabledDueToFiscalYear;
 const [chequeSelectState, setChequeSelectState] = useState({ open: false, rowIndex: -1 });

  const [isVoucherLoading, setIsVoucherLoading] = useState(false);
  const [isDeletingVoucher, setIsDeletingVoucher] = useState(false);

  const [activeTabs, setActiveTabs] = useState<Record<string, boolean>>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("rap_payment_tab_settings");
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      paymentTabCash: true,
      paymentTabCheque: true,
      paymentTabWithdrawal: true,
      paymentTabTransfer: true,
      paymentTabRefund1: true,
      paymentTabPromissoryNote: true,
      paymentTabRefund2: true,
      paymentTabGuarantee: true,
      paymentTabRefund3: true,
    };
  });

  const [isSettingsLoaded, setIsSettingsLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("rap_payment_tab_settings");
    }
    return false;
  });

  useEffect(() => {
    const fetchActiveTabs = async () => {
      try {
        const res = await apiFetch("/api/common/base-settings/tab/6");
        if (res.ok) {
          const result = await res.json();
          const data = result.data || {};
          const loadedSettings = {
            paymentTabCash: data.paymentTabCash !== "false",
            paymentTabCheque: data.paymentTabCheque !== "false",
            paymentTabWithdrawal: data.paymentTabWithdrawal !== "false",
            paymentTabTransfer: data.paymentTabTransfer !== "false",
            paymentTabRefund1: data.paymentTabRefund1 !== "false",
            paymentTabPromissoryNote: data.paymentTabPromissoryNote !== "false",
            paymentTabRefund2: data.paymentTabRefund2 !== "false",
            paymentTabGuarantee: data.paymentTabGuarantee !== "false",
            paymentTabRefund3: data.paymentTabRefund3 !== "false",
          };
          setActiveTabs(loadedSettings);
          setIsSettingsLoaded(true);
          try {
            localStorage.setItem("rap_payment_tab_settings", JSON.stringify(loadedSettings));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error("Error fetching active tabs settings:", err);
      }
    };
    fetchActiveTabs();
  }, []);

  
  
  const loadAssociatedVoucher = async () => {
    const currentId = activeIdRef.current;
    if (!currentId) {
      setAssociatedVoucher(null);
      return;
    }
    try {
      let currentVoucherHeaderRef = values.voucherHeaderRef;
      
      if (currentId) {
        const parentRes = await apiFetch(`/api/rap/payment-notifications/${currentId}`);
        if (parentRes.ok) {
          if (activeIdRef.current !== currentId) return;
          const parentData = await parentRes.json();
          const pData = parentData.data || parentData;
          currentVoucherHeaderRef = pData.voucherHeaderRef || null;
          setValues(prev => ({
            ...prev,
            status: pData.status !== undefined ? pData.status : prev.status,
            voucherHeaderRef: pData.voucherHeaderRef || null
          }));
          if (typeof setOriginalData === 'function') {
            setOriginalData((prev: any) => prev ? ({ ...prev, status: pData.status !== undefined ? pData.status : prev.status, voucherHeaderRef: pData.voucherHeaderRef || null }) : prev);
          }
        }
      }

      if (currentVoucherHeaderRef) {
        const res = await apiFetch(`/api/accounting/vouchers/${currentVoucherHeaderRef}`);
        if (res.ok) {
          if (activeIdRef.current !== currentId) return;
          const voucher = await res.json();
          setAssociatedVoucher(voucher.data || voucher);
          return;
        }
      }

      const res = await apiFetch('/api/accounting/vouchers?limit=1000');
      if (res.ok) {
        if (activeIdRef.current !== currentId) return;
        const vouchers = await res.json();
        const list = vouchers.data || vouchers;
        const matched = list.find((v: any) => 
          
          (currentVoucherHeaderRef && String(v.voucherId) === String(currentVoucherHeaderRef))
        );
        setAssociatedVoucher(matched || null);
      }
    } catch (error) {
      console.error("Error fetching associated voucher:", error);
    }
  };

  useEffect(() => {
    loadAssociatedVoucher();
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, () => {
      loadAssociatedVoucher();
    });
    const interval = setInterval(() => {
      loadAssociatedVoucher();
    }, 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [activeId, values.voucherHeaderRef]);

  useEffect(() => {
    if (activeTabId && tabId && activeTabId === tabId) {
      loadAssociatedVoucher();
    }
  }, [activeTabId, tabId]);

  const handleVoucherInsert = async () => {
    setIsVoucherLoading(true);
    try {
      const initialData = await generateVoucherInitialDataFromAccountingInfo(
        "PaymentNotification",
        id || activeId,
        values,
        false,
        "بابت اعلامیه پرداخت شماره"
      );
      addTab("سند حسابداری جدید", "accounting", null, "Voucher", { initialData });
    } finally {
      setIsVoucherLoading(false);
    }
  };

  const handleVoucherView = () => {
    if (associatedVoucher) {
      const finalId = associatedVoucher.voucherId || associatedVoucher.id;
      addTab(`مشاهده سند ${associatedVoucher.voucherNumber || finalId}`, 'accounting', null, 'Voucher', { id: finalId });
    }
  };

  const handleVoucherEdit = () => {
    if (associatedVoucher) {
      const finalId = associatedVoucher.voucherId || associatedVoucher.id;
      addTab(`ویرایش سند ${associatedVoucher.voucherNumber || finalId}`, 'accounting', null, 'Voucher', { id: finalId, isExistingItemsReadOnly: true });
    }
  };

  const handleVoucherDelete = async () => {
    if (associatedVoucher) {
      const finalId = associatedVoucher.voucherId || associatedVoucher.id;
      const voucherNum = associatedVoucher.voucherNumber || associatedVoucher.number || '';
      
      const isConfirmed = await confirm({
        title: 'حذف سند',
        message: `از حذف سند شماره ${voucherNum} اطمینان دارید؟`,
        confirmText: 'بلی',
        cancelText: 'خیر'
      });
      
      if (isConfirmed) {
        setIsDeletingVoucher(true);
        try {
          const currentId = activeIdRef?.current || id;
          if (currentId) {
            const apiPath = 'payment-notifications';
            
            // 1. Update document to clear voucherHeaderRef and set status back to 5
            const updateRes = await apiFetch(`/api/rap/${apiPath}/${currentId}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 5, voucherHeaderRef: null })
            });
            
            if (updateRes.ok) {
              // 2. Delete the voucher
              const res = await apiFetch(`/api/accounting/vouchers/${finalId}`, { method: 'DELETE' });
              if (res.ok) {
                showToast(`حذف سند شماره ${voucherNum} با موفقیت انجام گردید.`, 'success');
                
                if (typeof setValues === 'function') {
                  setValues((prev: any) => ({ ...prev, status: 5, voucherHeaderRef: null }));
                }
                if (typeof setOriginalData === 'function') {
                  setOriginalData((prev: any) => prev ? ({ ...prev, status: 5, voucherHeaderRef: null }) : prev);
                }
                if (typeof eventBus !== 'undefined') {
                  eventBus.emit(EVENTS.DATA_CHANGED);
                }
                setAssociatedVoucher(null);
                if (typeof loadAssociatedVoucher === 'function') {
                  loadAssociatedVoucher();
                }
              } else {
                showToast('خطا در حذف سند حسابداری', 'error');
              }
            } else {
              showToast('خطا در بروزرسانی مدرک جهت حذف سند', 'error');
            }
          }
        } catch (err) {
          console.error("Error deleting voucher:", err);
          showToast('خطا در عملیات حذف سند', 'error');
        } finally {
          setIsDeletingVoucher(false);
        }
      }
    }
  };

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedFiscalYear(localStorage.getItem('app-fiscal-year') || '');
    }
    const handleStorage = () => {
      setSelectedFiscalYear(localStorage.getItem('app-fiscal-year') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (selectedFiscalYear) {
      apiFetch(`/api/common/fiscalyear/${selectedFiscalYear}`)
        .then(res => { if (res.ok) return res.json(); throw new Error('Failed to fetch fiscal year details'); })
        .then(data => {
          const detail = data?.data || data;
          if (detail && detail.startDate && detail.endDate) {
            setFiscalYearDetails({ startDate: detail.startDate, endDate: detail.endDate });
          }
        })
        .catch(console.error);
    }
  }, [selectedFiscalYear]);

  // validation effect
  useEffect(() => {
    if (!values.date) {
      setDateError('');
      return;
    }
    const cleanDate = toEnglishDigits(values.date);
    const dateMoment = moment(cleanDate, 'jYYYY/jMM/jDD');
    if (!dateMoment.isValid() || cleanDate.length !== 10) {
      if (cleanDate.length !== 10) {
        setDateError('');
      } else {
        setDateError('تاریخ وارد شده نامعتبر است.');
      }
      return;
    }
    if (fiscalYearDetails) {
      const startMoment = moment(fiscalYearDetails.startDate).startOf('day');
      const endMoment = moment(fiscalYearDetails.endDate).endOf('day');
      if (startMoment.isValid() && endMoment.isValid()) {
        if (dateMoment.isBefore(startMoment, 'day') || dateMoment.isAfter(endMoment, 'day')) {
          const startJalali = moment(fiscalYearDetails.startDate).locale('en').format('jYYYY/jMM/jDD');
          const endJalali = moment(fiscalYearDetails.endDate).locale('en').format('jYYYY/jMM/jDD');
          setDateError(`تاریخ سند خارج از محدوده سال مالی است (بازه مجاز: از ${startJalali} تا ${endJalali})`);
        } else {
          setDateError('');
        }
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [values.date, fiscalYearDetails]);

 useEffect(() => {
 if (!id && !initialData) {
 reset();
 setValues((prev) => ({ ...prev, date: moment().locale('en').format("jYYYY/jMM/jDD") }));
 }
 }, [id, initialData, reset, setValues]);

 useEffect(() => {
 if (initialData) {
 setOriginalData(initialData);
 setValues({
 baseType: initialData.baseType || 1,
 number: initialData.documentNumber || "",
 date: initialData.documentDate ? moment(initialData.documentDate).format("jYYYY/jMM/jDD") : "",
 partyRef: initialData.partyRef || null,
 party: initialData.party || null,
 paymentType: initialData.paymentType || 1,
 baseNumber: initialData.baseNumber || "",
 baseNumberObj: initialData.baseNumber ? { requestNumber: initialData.baseNumber } : null,
 status: initialData.status || 2,
 description: initialData.description || "",
 cashes: initialData.cashItems?.map((c: any) => ({
 ...c, 
 // normalize fields for UI
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 base: initialData.baseNumber || "",
 baseDocument: initialData.baseNumber || "",
 })) || [],
 cheques: initialData.chequeItems?.map((c: any) => ({
  ...c,
  account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : { id: c.bankAccountRef },
  op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
  reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
  num: c.chequebook ? { ...c.chequebook, id: c.chequebook.chequebookId || c.chequebook.id, selectedCheckNumber: c.chequeNumber } : (c.chequeNumber || c.chequebookRef),
  desc: c.description,
  endorNum: c.endorsementNumber,
  sayad: c.sayyadNumber,
  due: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
  currency: c.currency,
  base: initialData.baseNumber || "",
  baseDocument: initialData.baseNumber || "",
 })) || [],
 withdrawals: initialData.withdrawalItems?.map((c: any) => ({
 ...c,
 account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : { id: c.bankAccountRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 trackingNum: c.trackingNumber,
 base: initialData.baseNumber || "",
 baseDocument: initialData.baseNumber || "",
 })) || [],
 transfers: initialData.assignmentItems?.map((c: any) => ({
 ...c,
 chequeObj: c.receiptCheque ? { id: c.receiptCheque.receiptChequeId, chequeNumber: c.receiptCheque.chequeNumber } : { id: c.receiptChequeRef },
 transferChequeNum: c.receiptCheque?.chequeNumber || "",
 transferChequeDate: c.receiptCheque?.receiptNotification?.documentDate ? moment(c.receiptCheque.receiptNotification.documentDate).format("jYYYY/jMM/jDD") : "",
 transferChequeAmount: c.amount,
 op: c.receiptCheque?.accountingSetting ? { ...c.receiptCheque.accountingSetting, id: c.receiptCheque.accountingSetting.recieptAndPaymentAccountingSettingId } : (c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null),
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 base: initialData.baseNumber || "",
 baseDocument: initialData.baseNumber || "",
 })) || [],
 refund1s: initialData.returnedReceivedCheques?.map((c: any) => ({
 ...c,
 chequeObj: c.receiptCheque ? { id: c.receiptCheque.receiptChequeId, chequeNumber: c.receiptCheque.chequeNumber } : { id: c.receiptChequeRef },
 refundableChequeNum: c.receiptCheque?.chequeNumber || "",
 chequeDate: c.receiptCheque?.receiptNotification?.documentDate ? moment(c.receiptCheque.receiptNotification.documentDate).format("jYYYY/jMM/jDD") : "",
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef, title: c.cashRef } : null),
 chequeAmount: c.amount,
 base: initialData.baseNumber || "",
 baseDocument: initialData.baseNumber || "",
 })) || [],
 promissoryNotes: initialData.promissoryNoteItems?.map((c: any) => ({
   ...c,
   id: c.paymentPromissoryNoteId,
   currency: c.currency ? { ...c.currency, id: c.currency.currencyID } : null,
   promissoryNoteNum: c.promissoryNoteItem ? {
       promissoryNoteItemId: c.promissoryNoteItemRef,
       id: c.promissoryNoteItemRef,
       promissoryNoteNumber: c.promissoryNoteItem.promissoryNoteNumber
   } : null,
   equivalentAmount: c.equivalentAmount || "",
   amount: c.amount,
   dueDate: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
   op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
   reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
   desc: c.description,
 })) || [],
 guarantees: initialData.guaranteeItems?.map((c: any) => ({
   ...c,
   id: c.paymentGuaranteeId || c.paymentPromissoryNoteId || c.id,
   amount: c.amount,
   dueDate: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
   op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
   reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
   desc: c.description,
   guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
   guaranteeNumber: c.guaranteeNumber || c.dynamicDetailedData?.guaranteeNumber || "",
   baseDocument: c.baseDocument || c.dynamicDetailedData?.baseDocument || "",
   bank: c.bank ? { ...c.bank, id: c.bank.bankId } : (c.bankRef ? { id: c.bankRef, title: c.bankRef } : null),
   bankAccount: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : (c.bankAccountRef ? { id: c.bankAccountRef } : null),
    accountNumber: c.accountNumber || c.dynamicDetailedData?.accountNumber || "",
   notificationDate: c.notificationDate ? moment(c.notificationDate).format("jYYYY/jMM/jDD") : (c.dynamicDetailedData?.notificationDate ? moment(c.dynamicDetailedData.notificationDate).format("jYYYY/jMM/jDD") : "")
 })) || [],
 refund2s: initialData.returnedReceivedPromissoryNotes?.filter((c: any) => !c.dynamicDetailedData?.isGuarantee).map((c: any) => ({
   ...c,
   promissoryNoteObj: c.receiptPromissoryNote ? { id: c.receiptPromissoryNote.receiptPromissoryNoteId, promissoryNoteNumber: c.receiptPromissoryNote.promissoryNoteNumber } : { id: c.receiptPromissoryNoteRef },
   promissoryNoteNum: c.receiptPromissoryNote?.promissoryNoteNumber || "",
   amount: c.amount,
   dueDate: c.receiptPromissoryNote?.dueDate ? moment(c.receiptPromissoryNote.dueDate).format("jYYYY/jMM/jDD") : "",
   op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
   reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
   opTitle: c.accountingSetting?.title || "",
   reasonTitle: (c.reason as any)?.Title || (c.reason as any)?.title || "",
   base: initialData.baseNumber || "",
   baseDocument: initialData.baseNumber || "",
 })) || [],
 refund3s: initialData.returnedReceivedPromissoryNotes?.filter((c: any) => c.dynamicDetailedData?.isGuarantee).map((c: any) => ({
   ...c,
   amount: c.amount,
   description: c.description,
   op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
   reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
   guaranteeType: c.dynamicDetailedData?.guaranteeType?.toString() || "",
   guaranteeNumber: c.dynamicDetailedData?.guaranteeNumber || "",
   base: initialData.baseNumber || "",
   baseDocument: c.dynamicDetailedData?.baseDocument || initialData.baseNumber || "",
 })) || [],
 });
 } else if (activeId) {
 apiFetch(`/api/rap/payment-notifications/${activeId}`)
 .then(res => res.json())
 .then(data => {
 setOriginalData(data);
 setValues({
 baseType: data.baseType || 1,
 number: data.documentNumber || "",
 date: data.documentDate ? moment(data.documentDate).format("jYYYY/jMM/jDD") : "",
 partyRef: data.partyRef || null,
 party: data.party || null,
 paymentType: data.paymentType || 1,
 baseNumber: data.baseNumber || "",
 baseNumberObj: data.baseNumber ? { requestNumber: data.baseNumber } : null,
 status: data.status || 2,
 voucherHeaderRef: data.voucherHeaderRef || null,
 description: data.description || "",
 cashes: data.cashItems?.map((c: any) => ({
 ...c, 
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 base: data.baseNumber || "",
 baseDocument: data.baseNumber || "",
 })) || [],
 cheques: data.chequeItems?.map((c: any) => ({
  ...c,
  account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : { id: c.bankAccountRef },
  op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
  reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
  num: c.chequebook ? { ...c.chequebook, id: c.chequebook.chequebookId || c.chequebook.id, selectedCheckNumber: c.chequeNumber } : (c.chequeNumber || c.chequebookRef),
  desc: c.description,
  endorNum: c.endorsementNumber,
  sayad: c.sayyadNumber,
  due: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
  currency: c.currency,
  base: data.baseNumber || "",
  baseDocument: data.baseNumber || "",
 })) || [],
 withdrawals: data.withdrawalItems?.map((c: any) => ({
 ...c,
 account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : { id: c.bankAccountRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 trackingNum: c.trackingNumber,
 base: data.baseNumber || "",
 baseDocument: data.baseNumber || "",
 })) || [],
 transfers: data.assignmentItems?.map((c: any) => ({
 ...c,
 chequeObj: c.receiptCheque ? { id: c.receiptCheque.receiptChequeId, chequeNumber: c.receiptCheque.chequeNumber } : { id: c.receiptChequeRef },
 transferChequeNum: c.receiptCheque?.chequeNumber || "",
 transferChequeDate: c.receiptCheque?.receiptNotification?.documentDate ? moment(c.receiptCheque.receiptNotification.documentDate).format("jYYYY/jMM/jDD") : "",
 transferChequeAmount: c.amount,
 op: c.receiptCheque?.accountingSetting ? { ...c.receiptCheque.accountingSetting, id: c.receiptCheque.accountingSetting.recieptAndPaymentAccountingSettingId } : (c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null),
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 base: data.baseNumber || "",
 baseDocument: data.baseNumber || "",
 })) || [],
 promissoryNotes: data.promissoryNoteItems?.map((c: any) => ({
         ...c,
         id: c.paymentPromissoryNoteId,
         currency: c.currency ? { ...c.currency, id: c.currency.currencyID } : null,
         promissoryNoteNum: c.promissoryNoteItem ? {
             promissoryNoteItemId: c.promissoryNoteItemRef,
             id: c.promissoryNoteItemRef,
             promissoryNoteNumber: c.promissoryNoteItem.promissoryNoteNumber
         } : null,
         equivalentAmount: c.equivalentAmount || "",
         amount: c.amount,
         dueDate: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
         op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
         reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
         desc: c.description,
       })) || [],
       guarantees: data.guaranteeItems?.map((c: any) => ({
         ...c,
         id: c.paymentGuaranteeId || c.paymentPromissoryNoteId || c.id,
         amount: c.amount,
         dueDate: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
         op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
         reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
         desc: c.description,
         guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
         guaranteeNumber: c.guaranteeNumber || c.dynamicDetailedData?.guaranteeNumber || "",
         baseDocument: c.baseDocument || c.dynamicDetailedData?.baseDocument || "",
        bank: c.bank ? { ...c.bank, id: c.bank.bankId } : (c.bankRef ? { id: c.bankRef, title: c.bankRef } : null),
        bankAccount: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : (c.bankAccountRef ? { id: c.bankAccountRef } : null),
         accountNumber: c.accountNumber || c.dynamicDetailedData?.accountNumber || "",
        notificationDate: c.notificationDate ? moment(c.notificationDate).format("jYYYY/jMM/jDD") : (c.dynamicDetailedData?.notificationDate ? moment(c.dynamicDetailedData.notificationDate).format("jYYYY/jMM/jDD") : "")})) || [],
 refund1s: data.returnedReceivedCheques?.map((c: any) => ({
 ...c,
 chequeObj: c.receiptCheque ? { id: c.receiptCheque.receiptChequeId, chequeNumber: c.receiptCheque.chequeNumber } : { id: c.receiptChequeRef },
 refundableChequeNum: c.receiptCheque?.chequeNumber || "",
 chequeDate: c.receiptCheque?.receiptNotification?.documentDate ? moment(c.receiptCheque.receiptNotification.documentDate).format("jYYYY/jMM/jDD") : "",
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef, title: c.cashRef } : null),
 chequeAmount: c.amount,
 base: data.baseNumber || "",
 baseDocument: data.baseNumber || "",
 })) || [],
 refund2s: data.returnedReceivedPromissoryNotes?.filter((c: any) => !c.dynamicDetailedData?.isGuarantee).map((c: any) => ({
 ...c,
 promissoryNoteObj: c.receiptPromissoryNote ? { id: c.receiptPromissoryNote.receiptPromissoryNoteId, promissoryNoteNumber: c.receiptPromissoryNote.promissoryNoteNumber } : { id: c.receiptPromissoryNoteRef },
 promissoryNoteNum: c.receiptPromissoryNote?.promissoryNoteNumber || "",
 amount: c.amount,
 dueDate: c.receiptPromissoryNote?.dueDate ? moment(c.receiptPromissoryNote.dueDate).format("jYYYY/jMM/jDD") : "",
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 opTitle: c.accountingSetting?.title || "",
 reasonTitle: (c.reason as any)?.Title || (c.reason as any)?.title || "",
 base: data.baseNumber || "",
 baseDocument: data.baseNumber || "",
 })) || [],
 refund3s: data.returnedReceivedPromissoryNotes?.filter((c: any) => c.dynamicDetailedData?.isGuarantee).map((c: any) => ({
 ...c,
 amount: c.amount,
 description: c.description,
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 guaranteeType: c.dynamicDetailedData?.guaranteeType?.toString() || "",
 guaranteeNumber: c.dynamicDetailedData?.guaranteeNumber || "",
 base: data.baseNumber || "",
 baseDocument: c.dynamicDetailedData?.baseDocument || data.baseNumber || "",
 })) || [],
 });
 })
 .catch(console.error);
 }
 }, [initialData, activeId]);

 const handleSelectCheques = (selected: any[], rowIndex: number) => {
 setValues(prev => {
 const newTransfers = [...(prev.transfers || [])];
 
 selected.forEach((cheque, idx) => {
 const insertionIndex = rowIndex + idx;
 const newRow = {
 chequeObj: { id: cheque.id, chequeNumber: cheque.chequeNumber },
 transferChequeNum: cheque.chequeNumber,
 transferChequeDate: cheque.transferChequeDate,
 partyName: cheque.partyName, // wait, there is no partyName column in the transfer list? Nevermind, it's fine.
 transferChequeAmount: cheque.amount,
 bankName: cheque.bankName,
 branchName: cheque.branchName,
 description: cheque.description || "",
 currency: cheque.currency || "ریال",
 base: "",
 reason: {}, 
 op: cheque.opId ? { id: cheque.opId, code: cheque.opCode, title: cheque.opTitle } : (cheque.opCode ? { code: cheque.opCode, title: cheque.opTitle } : null),
 };
 
 if (insertionIndex < newTransfers.length) {
 if (!newTransfers[insertionIndex].transferChequeNum) {
 newTransfers[insertionIndex] = { ...newTransfers[insertionIndex], ...newRow };
 } else {
 newTransfers.splice(insertionIndex, 0, newRow);
 }
 } else {
 newTransfers.push(newRow);
 }
 });
 return { ...prev, transfers: newTransfers };
 });
 };

 const handleSelectRefundCheques = (selected: any[], rowIndex: number) => {
    setValues(prev => {
      const newRefunds = [...(prev.refund1s || [])];
      
      selected.forEach((cheque, idx) => {
        const insertionIndex = rowIndex + idx;
        const existingRow = newRefunds[insertionIndex] || {};
        const baseCash = newRefunds[rowIndex]?.cash || null;

        const newRow = {
          ...existingRow,
          chequeObj: { id: cheque.id, chequeNumber: cheque.chequeNumber },
          refundableChequeNum: cheque.chequeNumber,
          chequeDate: cheque.chequeDate,
          partyName: cheque.partyName,
          chequeAmount: cheque.amount,
          accountNumber: cheque.accountNumber,
          bankName: cheque.bankName,
          description: cheque.description || existingRow.description || "",
          currency: cheque.currency || existingRow.currency || "ریال",
          type: cheque.type,
          base: existingRow.base || "",
          reason: existingRow.reason || {}, 
          op: existingRow.op || null,
          cash: existingRow.cash || baseCash
        };
        
        if (insertionIndex < newRefunds.length) {
          if (!newRefunds[insertionIndex].refundableChequeNum) {
            newRefunds[insertionIndex] = newRow;
          } else {
            newRefunds.splice(insertionIndex, 0, newRow);
          }
        } else {
          newRefunds.push(newRow);
        }
      });
      return { ...prev, refund1s: newRefunds };
    });
  };

 const handleSelectRefundPromissoryNotes = (selected: any[], rowIndex: number) => {
 setValues(prev => {
 const newRefunds = [...(prev.refund2s || [])];
 
 selected.forEach((note, idx) => {
 const insertionIndex = rowIndex + idx;
 const newRow = {
 promissoryNoteObj: { id: note.id, promissoryNoteNumber: note.promissoryNoteNumber },
 promissoryNoteNum: note.promissoryNoteNumber,
 dueDate: note.dueDate,
 partyName: note.partyName,
 amount: note.amount,
 description: note.description || "",
 currency: note.currency || "ریال",
 base: "",
 reason: null, 
 op: null,
 opTitle: "",
 reasonTitle: ""
 };
 
 if (insertionIndex < newRefunds.length) {
 if (!newRefunds[insertionIndex].promissoryNoteNum) {
 newRefunds[insertionIndex] = { ...newRefunds[insertionIndex], ...newRow };
 } else {
 newRefunds.splice(insertionIndex, 0, newRow);
 }
 } else {
 newRefunds.push(newRow);
 }
 });
 return { ...prev, refund2s: newRefunds };
 });
 };

 useEffect(() => {
 if (!id && !initialData && !isUpdate && values.date) {
 apiFetch(`/api/rap/payment-notifications/next-numbers?date=${values.date}`)
 .then(res => res.json())
 .then(data => {
 setIsDocumentNoAuto(data.isDocumentNumberAuto);
 if (data.error) {
 showToast(data.error, "error");
 }
 if (data.isDocumentNumberAuto) {
 setValues(prev => ({ ...prev, number: data.documentNumber }));
 }
 })
 .catch(console.error);
 }
 }, [values.date, isUpdate, id, initialData, refreshNumberingTrigger]);

 const validate = () => {
 const newErrors: Record<string, string> = {};
 if (!values.baseType) newErrors.baseType = "مبنا الزامی است";
 if ((values.baseType !== 1 && values.baseType !== '1' && values.baseType !== 'بدون مبنا') && !values.baseNumber) newErrors.baseNumber = "شماره مبنا الزامی است";
 if (!isDocumentNoAuto && !values.number) newErrors.number = "شماره الزامی است";
 if (!values.date) newErrors.date = "تاریخ الزامی است";
  if (dateError) newErrors.date = dateError;
 if (!values.partyRef) newErrors.partyRef = "طرف مقابل الزامی است";
 if (!values.paymentType) newErrors.paymentType = "نوع پرداخت الزامی است";
 if (!values.status) newErrors.status = "وضعیت الزامی است";
 if (!values.description) newErrors.description = "شرح الزامی است";
 
 const validCashes = (values.cashes || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validCheques = (values.cheques || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validWithdrawals = (values.withdrawals || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validTransfers = (values.transfers || []).filter((c: any) => parseFloat(String(c.transferChequeAmount || c.amount || '0').replace(/,/g, '')) > 0);
 const validPromissoryNotes = (values.promissoryNotes || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validRefund1s = (values.refund1s || []).filter((c: any) => parseFloat(String(c.chequeObj?.amount || c.chequeAmount || c.amount || '0').replace(/,/g, '')) > 0);
 const validRefund2s = (values.refund2s || []).filter((c: any) => parseFloat(String(c.promissoryNoteObj?.amount || c.amount || '0').replace(/,/g, '')) > 0);

 if (validCashes.length === 0 && validCheques.length === 0 && validWithdrawals.length === 0 && validTransfers.length === 0 && validPromissoryNotes.length === 0 && validRefund1s.length === 0 && validRefund2s.length === 0 && (values.guarantees || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0).length === 0 && (values.refund3s || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0).length === 0) {
 newErrors.items = "ورود اطلاعات یک قلم پرداخت، الزامی است";
 }

 if (values.cashes && values.cashes.length > 0) {
 for (const cash of values.cashes) {
 const hasAnyField = cash.cash || cash.op || cash.reason || cash.amount || cash.description;
 if (hasAnyField) {
 const amt = parseFloat(String(cash.amount || "0").replace(/[^0-9.]/g, ''));
 if (!amt || amt <= 0) {
 newErrors.cashes = "مبلغ برای ردیف‌های نقد الزامی است";
 break;
 }
 if (!cash.cash) {
 newErrors.cashes = "صندوق برای تمامی ردیف‌های نقد الزامی است";
 break;
 }
 }
 }
 }

 if (values.cheques && values.cheques.length > 0) {
 const usedCheques = new Set();
 for (const cheque of values.cheques) {
 const hasAnyField = cheque.op || cheque.reason || cheque.account || cheque.num || cheque.amount || cheque.desc || cheque.due || cheque.description || values.date;
 if (hasAnyField) {
 const amt = parseFloat(String(cheque.amount || "0").replace(/[^0-9.]/g, ''));
 if (!amt || amt <= 0) {
 newErrors.cheques = "مبلغ برای ردیف‌های چک الزامی است";
 break;
 }
 if (!cheque.op) {
 newErrors.cheques = "عملیات حسابداری برای تمامی ردیف‌های چک الزامی است";
 break;
 }
 if (!cheque.reason) {
 newErrors.cheques = "بابت برای تمامی ردیف‌های چک الزامی است";
 break;
 }
 if (!cheque.account) {
 newErrors.cheques = "حساب بانکی برای تمامی ردیف‌های چک الزامی است";
 break;
 }
 const chequeDue = cheque.due || values.date; if (!chequeDue) {
 newErrors.cheques = "تاریخ سررسید برای تمامی ردیف‌های چک الزامی است";
 break;
 }
 const chequeDesc = cheque.desc || cheque.description; if (!chequeDesc) {
 newErrors.cheques = "شرح برای تمامی ردیف‌های چک الزامی است";
 break;
 }
 const chkNum = cheque.num?.selectedCheckNumber || cheque.num?.checkNumber || cheque.num?.series || cheque.num;
 if (chkNum) {
 if (usedCheques.has(String(chkNum))) {
 newErrors.cheques = `شماره چک ${chkNum} تکراری است. از یک چک نمی‌توان برای چندین ردیف پرداختی استفاده کرد.`;
 break;
 }
 usedCheques.add(String(chkNum));
 } else {
 newErrors.cheques = "شماره چک برای تمامی ردیف‌های چک الزامی است";
 break;
 }
 }
 }
 }
 
 if (values.withdrawals && values.withdrawals.length > 0) {
 for (const w of values.withdrawals) {
 const hasAnyField = w.op || w.reason || w.account || w.amount || w.description || w.trackingNum;
 if (hasAnyField) {
 const amt = parseFloat(String(w.amount || "0").replace(/[^0-9.]/g, ''));
 if (!amt || amt <= 0) {
 newErrors.withdrawals = "مبلغ برای ردیف‌های اعلامیه برداشت الزامی است";
 break;
 }
 if (!w.account) {
 newErrors.withdrawals = "حساب بانکی برای تمامی ردیف‌های اعلامیه برداشت الزامی است";
 break;
 }
 }
 }
 }

 if (values.transfers && values.transfers.length > 0) {
 for (const t of values.transfers) {
 const hasAnyField = t.chequeObj || t.transferChequeNum || t.transferChequeAmount || t.amount || t.op || t.reason || t.description;
 if (hasAnyField) {
 const amt = parseFloat(String(t.transferChequeAmount || t.amount || "0").replace(/[^0-9.]/g, ''));
 if (!amt || amt <= 0) {
 newErrors.transfers = "مبلغ برای ردیف‌های استرداد چک دریافتی الزامی است";
 break;
 }
 }
 }
 }

 if (values.promissoryNotes && values.promissoryNotes.length > 0) {
 for (const p of values.promissoryNotes) {
 const hasAnyField = p.promissoryNoteNum || p.amount || p.op || p.reason || p.description || p.currency || p.dueDate;
 if (hasAnyField) {
 const amt = parseFloat(String(p.amount || "0").replace(/[^0-9.]/g, ''));
 if (!amt || amt <= 0) {
 newErrors.promissoryNotes = "مبلغ برای ردیف‌های سفته الزامی است";
 break;
 }
 if (!p.promissoryNoteNum) {
 newErrors.promissoryNotes = "شماره سفته برای تمامی ردیف‌ها الزامی است";
 break;
 }
 }
 }
 }
 
 if ((values.paymentType === 2 || values.paymentType === '2') && (values.baseType === 5 || values.baseType === '5') && values.baseNumberObj) {
 const requestedAmt = parseFloat(values.baseNumberObj.requestedAmount) || 0;
 let currentTotal = 0;
 validCashes.forEach((c: any) => currentTotal += parseFloat(String(c.amount || '0').replace(/,/g, '')));
 validCheques.forEach((c: any) => currentTotal += parseFloat(String(c.amount || '0').replace(/,/g, '')));
 validWithdrawals.forEach((c: any) => currentTotal += parseFloat(String(c.amount || '0').replace(/,/g, '')));
 validTransfers.forEach((c: any) => currentTotal += parseFloat(String(c.transferChequeAmount || c.amount || '0').replace(/,/g, '')));
 
 if (currentTotal > requestedAmt) {
 newErrors.totalAmt = "جمع مبالغ وارد شده نباید از مبلغ درخواست تنخواه بیشتر باشد";
 showToast("جمع مبالغ وارد شده نباید از مبلغ درخواست تنخواه بیشتر باشد", "error");
 }
 }

 setErrors(newErrors);
 const isValid = Object.keys(newErrors).length === 0;
 if (!isValid) {
 if (newErrors.items) {
 showToast(newErrors.items, "error");
       } else if (newErrors.cashes) {
        showToast(newErrors.cashes, "error");
      } else if (newErrors.cheques) {
        showToast(newErrors.cheques, "error");
      } else if (newErrors.withdrawals) {
        showToast(newErrors.withdrawals, "error");
      } else if (newErrors.deposits) {
        showToast(newErrors.deposits, "error");
      } else if (newErrors.transfers) {
        showToast(newErrors.transfers, "error");
      } else if (newErrors.promissoryNotes) {
        showToast(newErrors.promissoryNotes, "error");
      } else {
        showToast("لطفا فیلدهای اجباری را تکمیل نمایید", "error");
      }
 }
 return isValid;
 };

  const handleSave = async () => {
  if (!validate()) {
    throw new Error("VALIDATION_FAILED");
  }

  // Validation: Check if manually entered cheque numbers are valid (within chequebook leaf bounds)
  const validCheques = (values.cheques || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
  const originalCheques = originalData?.chequeItems || [];

  // Group unique bank account IDs that actually need validation to prevent redundant/excessive API fetches
  const accountsToFetch = new Set<string>();
  for (const cheque of validCheques) {
    const chkNum = String(cheque.num?.selectedCheckNumber || cheque.num?.checkNumber || cheque.num?.series || cheque.num || "");
    const accId = cheque.account?.id || cheque.account?.bankAccountId;
    
    const isOriginal = isUpdate && originalCheques.find((oc: any) => String(oc.chequeNumber) === chkNum && Number(oc.bankAccountRef) === Number(accId));
    if (isOriginal) continue;

    if (chkNum && accId) {
      accountsToFetch.add(String(accId));
    }
  }

  // Fetch active chequebooks for each unique bank account exactly ONCE in parallel
  const chequebooksMap = new Map<string, any[]>();
  if (accountsToFetch.size > 0) {
    await Promise.all(
      Array.from(accountsToFetch).map(async (accId) => {
        try {
          const cbRes = await apiFetch(`/api/rap/chequebooks?isActive=true&bankAccountRef=${accId}`);
          if (cbRes.ok) {
            const cbData = await cbRes.json();
            const list = Array.isArray(cbData.data || cbData)
              ? (cbData.data || cbData)
              : (Array.isArray((cbData.data || cbData).items) ? (cbData.data || cbData).items : []);
            chequebooksMap.set(accId, list);
          }
        } catch (err) {
          console.error(`Failed to fetch chequebooks for bank account ${accId}:`, err);
        }
      })
    );
  }

  // Validate all cheques in memory
  for (const cheque of validCheques) {
    const chkNum = String(cheque.num?.selectedCheckNumber || cheque.num?.checkNumber || cheque.num?.series || cheque.num || "");
    const accId = cheque.account?.id || cheque.account?.bankAccountId;

    const isOriginal = isUpdate && originalCheques.find((oc: any) => String(oc.chequeNumber) === chkNum && Number(oc.bankAccountRef) === Number(accId));
    if (isOriginal) continue;

    if (chkNum && accId) {
      const chequebooksList = chequebooksMap.get(String(accId)) || [];
      let foundChequebook = null;
      let isValidAndAvailable = false;
      let expectedChequebookRef = null;

      for (const cb of chequebooksList) {
        if (cb.items && Array.isArray(cb.items)) {
          const leaf = cb.items.find((item: any) => String(item.checkNumber || item.CheckNumber || "") === chkNum);
          if (leaf) {
            foundChequebook = cb;
            expectedChequebookRef = Number(cb.id || cb.chequebookId);
            if (leaf.status === 1 || leaf.Status === 1) isValidAndAvailable = true;
            break;
          }
        }
      }

      if (!foundChequebook) {
        showToast(`شماره چک ${chkNum} در محدوده دسته چک‌های تعریف شده نمی‌باشد.`, "error");
        throw new Error("VALIDATION_FAILED");
      } else if (!isValidAndAvailable) {
        showToast(`شماره چک ${chkNum} قبلاً استفاده شده است.`, "error");
        throw new Error("VALIDATION_FAILED");
      } else {
        if (!cheque.chequebookRef && typeof cheque.num !== 'object' && expectedChequebookRef) {
          cheque.chequebookRef = expectedChequebookRef;
        }
      }
    }
  }


  const payload = {
  baseType: Number(values.baseType) || 1,
  baseNumber: values.baseNumber,
 documentNumber: values.number,
  documentDate: values.date || null,
 partyRef: values.partyRef,
 paymentType: Number(values.paymentType) || 1,
 status: Number(values.status) || 1,
 description: values.description,
 
 // Transform cashes for API payload
 cashItems: (values.cashes || []).map((c: any) => ({
 cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId || c.op) : null,
 amount: Number(String(c.amount).replace(/,/g, '')) || 0,
 description: c.desc || c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
 })).filter((c: any) => c.amount > 0),

 chequeItems: (values.cheques || []).map((c: any) => ({
  bankAccountRef: c.account ? Number(c.account.id || c.account.bankAccountId) : null,
  accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
  amount: Number(String(c.amount).replace(/,/g, '')) || 0,
  description: c.desc || c.description,
  reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
  chequeNumber: c.num ? (c.num.selectedCheckNumber || c.num.checkNumber || c.num.series || c.num) : null,
 chequebookRef: (c.num && typeof c.num === 'object') ? Number(c.num.id || c.num.chequebookId) : (c.chequebookRef ? Number(c.chequebookRef) : null),
  sayyadNumber: c.sayad,
  endorsementNumber: c.endorNum,
  dueDate: c.due ? moment(toEnglishDigits(c.due), "jYYYY/jMM/jDD").format('YYYY-MM-DD') : null,
  currency: c.currency,
 })).filter((c: any) => c.amount > 0),

 withdrawalItems: (values.withdrawals || []).map((c: any) => ({
 bankAccountRef: c.account ? Number(c.account.id || c.account.bankAccountId) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
 amount: Number(String(c.amount).replace(/,/g, '')) || 0,
 description: c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
 trackingNumber: c.trackingNum,
 })).filter((c: any) => c.amount > 0),

 assignmentItems: (values.transfers || []).map((c: any) => ({
 amount: Number(String(c.transferChequeAmount || c.amount || '0').replace(/,/g, '')) || 0,
 description: c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
 receiptChequeRef: c.chequeObj ? Number(c.chequeObj.id) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
 })).filter((c: any) => c.amount > 0),

 promissoryNoteItems: [
   ...(values.promissoryNotes || []).map((c: any) => ({
     accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
     reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
     promissoryNoteItemRef: c.promissoryNoteNum ? Number(c.promissoryNoteNum.id || c.promissoryNoteNum.promissoryNoteItemId || c.promissoryNoteNum.promissoryNoteItemRef) : null,
     amount: Number(String(c.amount || '0').replace(/,/g, '')) || 0,
     currencyRef: c.currency ? Number(c.currency.id || c.currency.currencyID) : null,
     equivalentAmount: c.equivalentAmount ? Number(String(c.equivalentAmount).replace(/,/g, '')) : null,
     dueDate: c.dueDate ? moment(toEnglishDigits(c.dueDate), "jYYYY/jMM/jDD").format('YYYY-MM-DD') : null,
     description: c.desc || c.description,
   })).filter((c: any) => c.amount > 0),
 ],
 guaranteeItems: (values.guarantees || []).map((c: any) => ({
     accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
     reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
     amount: Number(String(c.amount || '0').replace(/,/g, '')) || 0,
     dueDate: c.dueDate ? moment(toEnglishDigits(c.dueDate), "jYYYY/jMM/jDD").format('YYYY-MM-DD') : null,
     description: c.desc || c.description,
     guaranteeType: c.guaranteeType ? Number(c.guaranteeType) : null,
     guaranteeNumber: c.guaranteeNumber || "0",
     baseDocument: c.baseDocument,
    bankRef: c.bank ? Number(c.bank.id || c.bank.bankId) : null, bankAccountRef: c.bankAccount ? Number(c.bankAccount.id || c.bankAccount.bankAccountId) : null,
    accountNumber: c.accountNumber || null,
    notificationDate: c.notificationDate ? moment(toEnglishDigits(c.notificationDate), "jYYYY/jMM/jDD").format('YYYY-MM-DD') : null
  })).filter((c: any) => c.amount > 0),

 returnedReceivedCheques: (values.refund1s || []).map((c: any) => ({
 receiptChequeRef: c.chequeObj ? Number(c.chequeObj.id) : null,
 cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
 amount: Number(String(c.chequeObj?.amount || c.chequeAmount || c.amount || '0').replace(/,/g, '')) || 0,
 description: c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
 })).filter((c: any) => c.amount > 0),

 returnedReceivedPromissoryNotes: [
     ...(values.refund2s || []).map((c: any) => ({
       receiptPromissoryNoteRef: c.promissoryNoteObj ? Number(c.promissoryNoteObj.id || c.promissoryNoteObj.receiptPromissoryNoteId) : null,
       amount: Number(String(c.promissoryNoteObj?.amount || c.amount || '0').replace(/,/g, '')) || 0,
       description: c.description,
       reasonRef: null,
       accountingSettingRef: null,
     })).filter((c: any) => c.amount > 0),
     ...(values.refund3s || []).map((c: any) => ({
       receiptPromissoryNoteRef: null,
       amount: Number(String(c.amount || '0').replace(/,/g, '')) || 0,
       description: c.description,
       reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
       accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
       dynamicDetailedData: { isGuarantee: true, guaranteeType: c.guaranteeType ? Number(c.guaranteeType) : null, guaranteeNumber: c.guaranteeNumber, baseDocument: c.baseDocument }
     })).filter((c: any) => c.amount > 0)
 ]
 };

 try {
 const res = await apiFetch(getUrl("/api/rap/payment-notifications"), {
 method,
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload),
 });
 if (res.ok) {
 const data = await res.json();
 handleResponse(data, "paymentNotificationId");
 const responseData = data.data || data;
 setOriginalData(responseData);
 
 setValues((prev: any) => ({
   ...prev,
   status: responseData.status || prev.status,
   voucherHeaderRef: responseData.voucherHeaderRef || null,
   cashes: responseData.cashItems?.map((c: any) => ({
     ...c,
     id: c.paymentCashId || c.id,
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     base: responseData.baseNumber || "",
     baseDocument: responseData.baseNumber || "",
   })) || prev.cashes,
   cheques: responseData.chequeItems?.map((c: any) => ({
     ...c,
     id: c.paymentChequeId || c.id,
     account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : (c.bankAccountRef ? { id: c.bankAccountRef } : null),
     bankAccount: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : (c.bankAccountRef ? { id: c.bankAccountRef } : null),
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     num: c.chequebook ? { ...c.chequebook, id: c.chequebook.chequebookId || c.chequebook.id, selectedCheckNumber: c.chequeNumber } : (c.chequeNumber || c.chequebookRef),
     desc: c.description,
     description: c.description,
     endorNum: c.endorsementNumber,
     sayad: c.sayyadNumber,
     due: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
     currency: c.currency,
     base: responseData.baseNumber || "",
     baseDocument: responseData.baseNumber || "",
   })) || prev.cheques,
   withdrawals: responseData.withdrawalItems?.map((c: any) => ({
     ...c,
     id: c.paymentWithdrawalId || c.id,
     account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : (c.bankAccountRef ? { id: c.bankAccountRef } : null),
     bankAccount: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : (c.bankAccountRef ? { id: c.bankAccountRef } : null),
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     trackingNum: c.trackingNumber,
     base: responseData.baseNumber || "",
     baseDocument: responseData.baseNumber || "",
   })) || prev.withdrawals,
   transfers: responseData.assignmentItems?.map((c: any) => ({
     ...c,
     id: c.paymentAssignmentId || c.id,
     chequeObj: c.receiptCheque ? { id: c.receiptCheque.receiptChequeId, chequeNumber: c.receiptCheque.chequeNumber } : (c.receiptChequeRef ? { id: c.receiptChequeRef } : null),
     transferChequeNum: c.receiptCheque?.chequeNumber || "",
     transferChequeDate: c.receiptCheque?.receiptNotification?.documentDate ? moment(c.receiptCheque.receiptNotification.documentDate).format("jYYYY/jMM/jDD") : "",
     transferChequeAmount: c.amount,
     op: c.receiptCheque?.accountingSetting ? { ...c.receiptCheque.accountingSetting, id: c.receiptCheque.accountingSetting.recieptAndPaymentAccountingSettingId } : (c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null),
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     base: responseData.baseNumber || "",
     baseDocument: responseData.baseNumber || "",
   })) || prev.transfers,
   promissoryNotes: responseData.promissoryNoteItems?.map((c: any) => ({
     ...c,
     id: c.paymentPromissoryNoteId || c.id,
     currency: c.currency ? { ...c.currency, id: c.currency.currencyID } : null,
     promissoryNoteNum: c.promissoryNoteItem ? {
         promissoryNoteItemId: c.promissoryNoteItemRef,
         id: c.promissoryNoteItemRef,
         promissoryNoteNumber: c.promissoryNoteItem.promissoryNoteNumber
     } : (c.promissoryNoteItemRef ? { id: c.promissoryNoteItemRef } : null),
     equivalentAmount: c.equivalentAmount || "",
     amount: c.amount,
     dueDate: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     desc: c.description,
     description: c.description,
   })) || prev.promissoryNotes,
   refund1s: responseData.returnedReceivedCheques?.map((c: any) => ({
     ...c,
     id: c.paymentReturnedReceivedChequeId || c.id,
     chequeObj: c.receiptCheque ? { id: c.receiptCheque.receiptChequeId, chequeNumber: c.receiptCheque.chequeNumber } : (c.receiptChequeRef ? { id: c.receiptChequeRef } : null),
     refundableChequeNum: c.receiptCheque?.chequeNumber || "",
     chequeDate: c.receiptCheque?.receiptNotification?.documentDate ? moment(c.receiptCheque.receiptNotification.documentDate).format("jYYYY/jMM/jDD") : "",
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef, title: c.cashRef } : null),
     chequeAmount: c.amount,
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     base: responseData.baseNumber || "",
     baseDocument: responseData.baseNumber || "",
   })) || prev.refund1s,
   refund2s: responseData.returnedReceivedPromissoryNotes?.filter((c: any) => !c.dynamicDetailedData?.isGuarantee).map((c: any) => ({
     ...c,
     id: c.paymentReturnedReceivedPromissoryNoteId || c.id,
     promissoryNoteObj: c.receiptPromissoryNote ? { id: c.receiptPromissoryNote.receiptPromissoryNoteId, promissoryNoteNumber: c.receiptPromissoryNote.promissoryNoteNumber } : (c.receiptPromissoryNoteRef ? { id: c.receiptPromissoryNoteRef } : null),
     promissoryNoteNum: c.receiptPromissoryNote?.promissoryNoteNumber || "",
     amount: c.amount,
     dueDate: c.receiptPromissoryNote?.dueDate ? moment(c.receiptPromissoryNote.dueDate).format("jYYYY/jMM/jDD") : "",
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     opTitle: c.accountingSetting?.title || "",
     reasonTitle: (c.reason as any)?.Title || (c.reason as any)?.title || "",
     base: responseData.baseNumber || "",
     baseDocument: responseData.baseNumber || "",
   })) || prev.refund2s,
   refund3s: responseData.returnedReceivedPromissoryNotes?.filter((c: any) => c.dynamicDetailedData?.isGuarantee).map((c: any) => ({
     ...c,
     id: c.paymentReturnedReceivedPromissoryNoteId || c.id,
     amount: c.amount,
     description: c.description,
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     guaranteeType: c.dynamicDetailedData?.guaranteeType?.toString() || "",
     guaranteeNumber: c.dynamicDetailedData?.guaranteeNumber || "",
     base: responseData.baseNumber || "",
     baseDocument: c.dynamicDetailedData?.baseDocument || responseData.baseNumber || "",
   })) || prev.refund3s,
   guarantees: responseData.guaranteeItems?.map((c: any) => ({
     ...c,
     id: c.paymentGuaranteeId || c.id,
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     desc: c.description,
     description: c.description,
     guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
     guaranteeNumber: c.guaranteeNumber || c.dynamicDetailedData?.guaranteeNumber || "",
     baseDocument: c.baseDocument || c.dynamicDetailedData?.baseDocument || "",
     bank: c.bank ? { ...c.bank, id: c.bank.bankId } : (c.bankRef ? { id: c.bankRef, title: c.bankRef } : null),
     bankAccount: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : (c.bankAccountRef ? { id: c.bankAccountRef } : null),
     accountNumber: c.accountNumber || c.dynamicDetailedData?.accountNumber || "",
     notificationDate: c.notificationDate ? moment(c.notificationDate).format("jYYYY/jMM/jDD") : (c.dynamicDetailedData?.notificationDate ? moment(c.dynamicDetailedData.notificationDate).format("jYYYY/jMM/jDD") : ""),
   })) || prev.guarantees,
 }));

 showToast("اطلاعات با موفقیت ذخیره شد.", "success");
 } else {
 const errorText = await res.text();
 let errorMsg = "خطا در ذخیره اطلاعات.";
 try {
   const errorJson = JSON.parse(errorText);
   if (errorJson.message) {
     errorMsg = Array.isArray(errorJson.message) ? errorJson.message.join(" - ") : errorJson.message;
   }
 } catch {}
 showToast(errorMsg, "error");
 console.error("Failed to save", errorText);
 throw new Error("API_ERROR");
 }
 } catch (e: any) {
 console.error(e);
 if (e.message !== "VALIDATION_FAILED" && e.message !== "API_ERROR") {
 showToast("خطای سیستمی رخ داد.", "error");
 }
 throw e;
 }
 };

 const fields: FieldConfig[] = [
 {
 name: "baseAndBaseNumber",
 label: "",
 labelWidth: "0px",
 type: "custom" as const,
 customComponent: (
 <div className="flex w-full items-center gap-x-2 min-w-0">
 <div className="flex-1 flex items-center min-w-0 basis-1/2 gap-x-1">
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap" style={{ width: "80px" }}>
   <FormLabel required>نوع پرداخت :</FormLabel>
 </div>
 <div className="flex-1 min-w-0">
 <select
 className={`w-full h-[25px] ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-[#f4f7fc] dark:bg-gray-800"}  border px-1 rounded-sm text-[11px] text-center`}
 style={{ borderColor: errors.paymentType ? "red" : "var(--color-gray-200)" }}
											disabled={isReadonly}
 value={values.paymentType || 1}
 onChange={(e) => {
  const val = Number(e.target.value);
  setValues((prev) => ({ 
    ...prev, 
    paymentType: val, 
    partyRef: null, 
    party: null, 
    cashes: [], 
    cheques: [], 
    withdrawals: [], 
    transfers: [],
    ...(val === 2 && prev.baseType !== 5 ? { baseType: 1 } : {})
  }));
 }}
 >
 {values.baseType === 5 ? (
 <option value={2}>شارژ تنخواه</option>
 ) : (
 <>
 <option value={1}>تسویه تعهدات</option>
 <option value={2}>شارژ تنخواه</option>
 <option value={3}>بانک به بانک</option>
 <option value={4}>بانک به صندوق</option>
 <option value={5}>صندوق به بانک</option>
 <option value={6}>صندوق به صندوق</option>
 </>
 )}
 </select>
 </div>
 </div>

 <div className="flex-1 flex items-center min-w-0 basis-1/2 gap-x-1">
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap" style={{ width: "100px" }}>
   <FormLabel required>مبنا :</FormLabel>
 </div>
 <div className="flex-1 min-w-0">
 <select
 className={`w-full h-[25px] ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-white dark:bg-gray-800"}  border px-1 rounded-sm text-[11px] text-center`}
 style={{ borderColor: errors.baseType ? "red" : "var(--color-gray-300)" }} disabled={isReadonly}
 value={values.baseType || 1}
 onChange={(e) => {
 const val = Number(e.target.value);
 setValues((prev) => ({ 
 ...prev, 
 baseType: val,
 partyRef: null,
 party: null,
 cashes: [],
 cheques: [],
 withdrawals: [],
 transfers: [],
 ...(val === 5 ? { paymentType: 2 } : {})
 }));
 }}
 >
 {(values.paymentType === 6 || values.paymentType === '6') ? (
                          <>
                            <option value={1}>بدون مبنا</option>
                            <option value={3}>دستور پرداخت</option>
                          </>
                        ) : (values.paymentType === 2 || values.paymentType === '2') ? (
                          <>
                            <option value={1}>بدون مبنا</option>
                            <option value={5}>درخواست تنخواه</option>
                          </>
                        ) : (
                          <>
                            <option value={1}>بدون مبنا</option>
                            <option value={2}>سند حسابداری</option>
                            <option value={3}>دستور پرداخت</option>
                            <option value={4}>پرداخت حقوق</option>
                            <option value={5}>درخواست تنخواه</option>
                            <option value={6}>فاکتور خرید</option>
                            <option value={7}>برگشت از فروش</option>
                            <option value={8}>تسویه طرف مقابل</option>
                          </>
                        )}
                        </select>
 </div>
 </div>
 </div>
 ),
 },
 {
 name: "_number_and_date",
 label: "",
 labelWidth: "0px",
 type: "custom" as const,
 customComponent: (
 <div className="flex items-center gap-x-2 w-full text-[13px] whitespace-nowrap min-w-0">
 {(values.baseType !== 1 && values.baseType !== '1' && values.baseType !== 'بدون مبنا') && (
 <>
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300" style={{ width: '100px' }}>
   <FormLabel required>ش مبنا :</FormLabel>
 </div>
 <div className="flex flex-1 items-center rounded-sm h-[25px]" style={{ border: errors.baseNumber ? "1px solid red" : "none" }}>
   {((values.paymentType === 2 || values.paymentType === '2') && (values.baseType === 5 || values.baseType === '5')) ? (
     <MultiColumnDropdown
       id="baseNumber" disabled={isReadonly}
       value={values.baseNumberObj || null}
       onChange={(selected: any) => {
         if (selected) {
           setValues((prev: any) => ({
             ...prev,
             baseNumber: selected.requestNumber,
             baseNumberObj: selected,
             partyRef: selected.pettyCash?.partyRef,
             party: selected.pettyCash?.party
           }));
         } else {
           setValues((prev: any) => ({
             ...prev,
             baseNumber: "",
             baseNumberObj: null,
             partyRef: null,
             party: null
           }));
         }
       }}
       listApiUrl="/api/rap/petty-cash-requests"
       displayKey="requestNumber"
       columns={[
         { key: "requestNumber", label: "شماره", width: 100 },
         { key: "requestDate", label: "تاریخ", width: 100, renderItem: (item: any) => item.requestDate ? moment(item.requestDate).format("jYYYY/jMM/jDD") : "" },
         { key: "cashier", label: "تنخواه دار", width: 150, renderItem: (item: any) => item.pettyCash?.party ? ((item.pettyCash.party.firstName || "") + " " + (item.pettyCash.party.lastName || "")).trim() || item.pettyCash.party.lastName : "" },
         { key: "requestedAmount", label: "مبلغ درخواستی", width: 120, renderItem: (item: any) => item.requestedAmount?.toLocaleString() },
         { key: "description", label: "شرح", width: 200 },
         { key: "currency", label: "نوع ارز", width: 80, renderItem: (item: any) => item.pettyCash?.currency?.title || "" },
       ]}
     />
   ) : (
     <div className={`flex flex-1 items-center rounded-sm overflow-hidden h-[25px] border ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-[#f4f7fc] dark:bg-gray-800"} `} style={{ borderColor: errors.baseNumber ? "red" : "var(--color-gray-200)", width: '100%' }}>
       <input
         className="flex-1 h-[25px] bg-transparent border-none px-1 text-[13px] outline-none min-w-0 text-center w-full"
         disabled={isReadonly} value={values.baseNumber || ""}
         onChange={(e) =>
           setValues((prev: any) => ({ ...prev, baseNumber: e.target.value }))
         }
       />
       <div className="w-[20px] flex justify-center items-center text-white transition-colors shrink-0 bg-blue-500 cursor-pointer hover:bg-blue-600 self-stretch h-full">
         <span className="text-lg leading-none">+</span>
       </div>
     </div>
   )}
 </div>
 </>
 )}
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300" style={{ width: (values.baseType !== 1 && values.baseType !== '1' && values.baseType !== 'بدون مبنا') ? '60px' : '106px' }}>
   <FormLabel required>شماره :</FormLabel>
 </div>
 <div className="flex flex-1 min-w-0">
 <input
 disabled={isReadonly || isDocumentNoAuto}
 className={`w-full h-[25px] px-2 rounded-sm border ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-white dark:bg-gray-800"}  text-[13px] text-center outline-none`}
 style={{ borderColor: errors.number ? "red" : "var(--color-gray-300)" }}
 value={values.number || ""}
 onChange={(e) => setValues((prev) => ({ ...prev, number: e.target.value }))}
 />
 </div>
 <div className="shrink-0 flex justify-start px-1 text-gray-700 dark:text-gray-300" style={{ width: '45px' }}>
   <FormLabel required>تاریخ :</FormLabel>
 </div>
 <div className="w-[110px] min-w-0 [&_input]:!text-[11px]">
                       <DateInput
 isHeader={true}
 name="date" disabled={isReadonly}
 labelWidth="0px"
 value={values.date || moment().locale('en').format("jYYYY/jMM/jDD")}
 required
  error={dateError || errors.date}
 onChange={(val) => {
   setValues((prev) => ({...prev, date: val}));
   const newE = {...errors}; delete newE.date; setErrors(newE);
 }}
 />
 </div>
 </div>
 ),
 },
 {
 name: "partyRef",
 labelWidth: "80px",
 label: (values.paymentType === 2 || values.paymentType === '2') ? "تنخواه دار" : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 3 || values.paymentType === '3')) ? "بانک مقصد" : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 5 || values.paymentType === '5')) ? "حساب بانکی" : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 4 || values.paymentType === '4')) ? "صندوق" : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 6 || values.paymentType === '6')) ? "صندوق مقصد" : "طرف مقابل",
 type: "custom" as const,
 required: true,
 customComponent: (
 <div style={{ minWidth: 200, width: "100%", height: "25px", border: errors.partyRef ? "1px solid red" : "none" }}>
 <SingleSelectDropDown
 key={`${values.baseType}-${values.paymentType}`}
 id="partyRef" disabled={isReadonly}
 value={values.party}
        onChange={(selected: any) => {
          setValues((prev) => ({ 
            ...prev, 
            partyRef: selected ? (selected.party?.partyId || selected.partyId || selected.bankAccountId || selected.cashId || selected.id) : null,
            party: selected?.party || selected 
          }));
        }}
        listApiUrl={((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 3 || values.paymentType === '3' || values.paymentType === 5 || values.paymentType === '5')) ? "/api/rap/bank-accounts?isActive=true" : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 4 || values.paymentType === '4' || values.paymentType === 6 || values.paymentType === '6')) ? "/api/rap/cashes?isActive=true" : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.paymentType === 2 || values.paymentType === '2')) ? "/api/rap/petty-cashes?isActive=true" : "/api/common/parties"}
        filterItem={(((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 3 || values.paymentType === '3' || values.paymentType === 5 || values.paymentType === '5')) || ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 4 || values.paymentType === '4' || values.paymentType === 6 || values.paymentType === '6')) || ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.paymentType === 2 || values.paymentType === '2'))) ? (item: any) => item.isActive !== false && item.IsActive !== false : undefined}
        displayKey={(((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 3 || values.paymentType === '3' || values.paymentType === 5 || values.paymentType === '5')) || ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 4 || values.paymentType === '4' || values.paymentType === 6 || values.paymentType === '6'))) ? "title" : "lastName"}
        renderSelection={(item: any) => {
          if ((((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 3 || values.paymentType === '3' || values.paymentType === 5 || values.paymentType === '5')) || ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 4 || values.paymentType === '4' || values.paymentType === 6 || values.paymentType === '6')))) {
            return item.title || item.accountTitle || "";
          }
          if ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.paymentType === 2 || values.paymentType === '2')) {
            if (item.pettyCashId || item.title) {
               return `${item.title || ""} (${item.party?.firstName || ""} ${item.party?.lastName || ""})`.trim();
            }
          }
          return ((item.firstName || "") + (item.firstName && item.lastName ? " " : "") + (item.lastName || "")).trim() || String(item.lastName || "");
        }}
        columns={((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 3 || values.paymentType === '3')) ? [
          { key: "detailedCode", label: "کد تفصیل", width: 100, renderItem: (item: any) => item.detailedAccount?.code || item.detailedCode || "" },
          { key: "title", label: "عنوان", width: 150 },
          { key: "balance", label: "مانده حساب", width: 120, renderItem: (item: any) => item.balance || "0" }
        ] : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 5 || values.paymentType === '5')) ? [
          { key: "detailedCode", label: "کد تفصیل", width: 100, renderItem: (item: any) => item.detailedAccount?.code || item.detailedCode || "" },
          { key: "title", label: "عنوان", width: 150 },
          { key: "balance", label: "مانده حساب", width: 120, renderItem: (item: any) => item.balance || "0" }
        ] : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 4 || values.paymentType === '4' || values.paymentType === 6 || values.paymentType === '6')) ? [
                                          { key: "detailedCode", label: "کدتفصیلی", width: 100, renderItem: (item: any) => item.detailedAccount?.code || item.detailedCode || "" },
                                          { key: "title", label: "عنوان صندوق", width: 150 },
                                          { key: "balance", label: "مانده", width: 120, renderItem: (item: any) => item.balance || "0" }
                                        ] : ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.paymentType === 2 || values.paymentType === '2')) ? [
          { key: "title", label: "عنوان تنخواه", width: 150 },
          { key: "partyName", label: "تنخواه دار", width: 150, renderItem: (item: any) => ((item.party?.firstName || "") + " " + (item.party?.lastName || "")).trim() },
          { key: "currency", label: "ارز", width: 80, renderItem: (item: any) => item.currency?.title || "" }
        ] : [
          { key: "firstName", label: "نام", width: 120 },
          { key: "lastName", label: "نام خانوادگی", width: 140 },
          { key: "nationalCode", label: "کد ملی/شناسه اقتصادی", width: 120 }
 ]}
 />
 </div>
 ),
 },
 {
 name: "statusField",
 label: "وضعیت",
 required: true,
 type: "custom" as const,
 customComponent: (
 <div className="w-full h-[25px]">
 <StateListInput
 value={associatedVoucher ? 8 : (values.status === 2 || values.status === "ثبت اولیه" ? 2 : (values.status || 2))}
 onChange={(val) => setValues((prev) => ({ ...prev, status: val || 2 }))}
 error={errors.status} disabled={isReadonly}
 />
 </div>
 ),
 },
 {
 name: "description",
 labelWidth: "80px",
 label: "شرح",
 required: true,
 type: "custom" as const,
 customComponent: (
 <div className={`flex items-center ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-[#f4f7fc] dark:bg-gray-800"}  rounded-sm border w-full overflow-hidden h-[25px]`} style={{ borderColor: errors.description ? "red" : "var(--color-gray-200)" }}>
 <input
 className="flex-1 h-[25px] bg-transparent border-none px-3 text-[13px] outline-none w-full text-center"
 disabled={isReadonly} value={values.description || ""}
 onChange={(e) =>
 setValues((prev) => ({ ...prev, description: e.target.value }))
 }
 />
 </div>
 ),
 },
 {
 name: "isSettlement",
 label: " ",
 type: "custom" as const,
 customComponent: (
 <div className="flex w-full items-center text-[11px] whitespace-nowrap min-w-0 h-[25px]">
 <FormLabel className="cursor-pointer">
 <input
 type="checkbox"
 disabled={isReadonly} checked={values.isSettlement || false}
 onChange={(e) =>
 setValues((prev) => ({
 ...prev,
 isSettlement: e.target.checked,
 }))
 }
 className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
 />
 <span className="text-gray-700 dark:text-gray-300">استقراری</span>
 </FormLabel>
 </div>
 ),
 },
 ];

 const renderOpDropDown = (row: any, rowIndex: number, onChange: any, prefix: string, usedEntryType: string = "3") => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`${prefix}-op-${rowIndex}`}
  value={row.op}
  disabled={isReadonly}
 label={null as any}
 displayKey="code"
 onChange={(item: any) => onChange?.(item)}
 listApiUrl={`/api/rap/accounting-setting?usedEntryType=${usedEntryType}&operationType=2`}
 
 columns={[
 { key: "code", label: "کد", width: 80 },
 { key: "title", label: "عنوان", width: 150 },
 ]}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
            <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
              <input
                className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
                value={isOpen ? (sq || "") : (row.op?.code || row.op?.title || row.op?.Title || (typeof row.op === 'string' || typeof row.op === 'number' ? String(row.op) : ""))}
                onChange={(e) => {
                  setSq(e.target.value);
                }}
 onClick={(e) => { e.stopPropagation(); }}
 placeholder="تایپ یا انتخاب..."
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 >
 +
 </div>
 </div>
 )}
 />
 </div>
 );

 const renderReasonDropDown = (row: any, rowIndex: number, onChange: any, prefix: string) => (
    <div className="w-full h-full min-h-[26px]">
      <ReasonSingleDropDown noWrapper className="h-full" id={`${prefix}-reason-${rowIndex}`}
        value={row.reason}
        label={null as any}
        onChange={(item: any) => onChange?.(item)}
        filter={(item) => item.Nature === RAP_REASON_NATURE_ENUM.USE && item.IsActive !== false}
        disabled={isReadonly}
        displayKey="Code"
      />
    </div>
  );

  const renderCashDropDown = (row: any, rowIndex: number, onChange: any, prefix: string) => (
    <div className="w-full h-full min-h-[26px]">
      <SingleSelectDropDown
        id={`${prefix}-cash-${rowIndex}`}
        value={row.cash}
        label={null as any}
        onChange={(item: any) => onChange?.(item)}
        listApiUrl="/api/rap/cashes"
        disabled={isReadonly}
        displayKey="title"
        columns={[
          { key: "code", label: "کد", width: 80 },
          { key: "title", label: "عنوان", width: 150 },
          { key: "detailedAccount.code", label: "کدتفصیل", width: 100 },
          { key: "currency.title", label: "نوع ارز", width: 100 },
          { key: "balance", label: "موجودی", width: 120, renderItem: () => "0" }
        ]}
        trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
          <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
              value={isOpen ? (sq || "") : (row.cash?.title || row.cash?.Title || (typeof row.cash === 'string' ? row.cash : ""))}
              onChange={(e) => setSq(e.target.value)}
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              onFocus={(e) => { if(!isOpen) toggle(); }}
              placeholder="انتخاب..."
            />
            <div 
              className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
              onClick={(e) => { e.stopPropagation(); toggle(); }}
            >
              +
            </div>
          </div>
        )}
      />
    </div>
  );

  const renderAccountDropDown = (row: any, rowIndex: number, onChange: any, prefix: string, dataKey: string = "account") => (
    <div className="w-full h-full min-h-[26px]">
      <SingleSelectDropDown
        id={`${prefix}-account-${rowIndex}`}
        value={row[dataKey]}
        label={null as any}
        onChange={(item: any) => {
          onChange?.(item);
        }}
        listApiUrl="/api/rap/bank-accounts"
        disabled={isReadonly}
        filterItem={(item: any) => item.isActive !== false && item.IsActive !== false}
        displayKey="title"
        columns={[
          { key: "detailedCode", label: "کد تفصیل", width: 100 },
          { key: "title", label: "عنوان", width: 150 },
          { key: "balance", label: "مانده حساب", width: 120 }
        ]}
        trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
          <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
              value={isOpen ? (sq || "") : (row[dataKey]?.title || row[dataKey]?.Title || (typeof row[dataKey] === 'string' ? row[dataKey] : ""))}
              onChange={(e) => setSq(e.target.value)}
              onClick={(e) => { e.stopPropagation(); toggle(); }}
              onFocus={(e) => { if(!isOpen) toggle(); }}
              placeholder="انتخاب..."
            />
            <div 
              className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
              onClick={(e) => { e.stopPropagation(); toggle(); }}
            >
              +
            </div>
          </div>
        )}
      />
    </div>
  );

  const renderTransferChequeDropDown = (row: any, rowIndex: number, onChange: any) => (
    <div className="w-full h-full min-h-[26px]">
      <SingleSelectDropDown
        id={`transfer-chequenum-${rowIndex}`}
        value={row.chequeObj || { chequeNumber: row.transferChequeNum }}
        label={null as any}
        displayKey="chequeNumber"
        listApiUrl={`/api/rap/receipt-notifications/cheques/available-for-transfer`}
        disabled={isReadonly}
        columns={[
          { key: "chequeNumber", label: "شماره چک", width: 120 },
          { key: "amount", label: "مبلغ", width: 120 },
          { key: "transferChequeDate", label: "تاریخ", width: 120 },
        ]}
        onChange={async (item: any) => {
          if(item === undefined || item === null) return;
          if (typeof item === 'string') {
            item = { chequeNumber: item };
          }

          let fetchedOp = null;
          let fetchedReason = null;
          try {
            if (item.receiptNotificationId || item.baseRef || item.receiptNotificationRef) {
              const recId = item.receiptNotificationId || item.baseRef || item.receiptNotificationRef;
              const res = await apiFetch(`/api/rap/receipt-notifications/${recId}`);
              if (res.ok) {
                const data = await res.json();
                const matchedCheque = data.cheques?.find((c: any) => c.chequeNumber === item.chequeNumber);
                if (matchedCheque) {
                  fetchedOp = matchedCheque.op;
                  fetchedReason = matchedCheque.reason;
                  item.receiptChequeId = matchedCheque.id || matchedCheque.receiptChequeId;
                }
              }
            } else {
              const searchRes = await apiFetch(`/api/rap/receipt-notifications?chequeNumber=${item.chequeNumber}`);
              if (searchRes.ok) {
                const searchData = await searchRes.json();
                const list = Array.isArray(searchData) ? searchData : (searchData.items || []);
                for (const rec of list) {
                  const matchedCheque = rec.cheques?.find((c: any) => c.chequeNumber === item.chequeNumber);
                  if (matchedCheque) {
                    fetchedOp = matchedCheque.op;
                    fetchedReason = matchedCheque.reason;
                    item.receiptChequeId = matchedCheque.id || matchedCheque.receiptChequeId;
                    break;
                  }
                }
              }
            }
          } catch(e) {
            console.error("Error fetching cheque original op:", e);
          }

          setValues((prev: any) => {
            const newTransfers = [...(prev.transfers || [])];
            newTransfers[rowIndex] = {
              ...newTransfers[rowIndex],
              chequeObj: item,
              transferChequeNum: item?.chequeNumber,
              transferChequeDate: item?.transferChequeDate,
              transferChequeAmount: item?.amount,
              partyName: item?.partyName,
              bankName: item?.bankName,
              branchName: item?.branchName,
              currency: item?.currency || "ریال",
              op: fetchedOp || (item?.opTitle ? { title: item.opTitle, id: item.opId, code: item.opCode } : null),
              reason: fetchedReason || (item?.reasonTitle ? { title: item.reasonTitle, id: item.reasonId } : null),
            };
            return { ...prev, transfers: newTransfers };
          });
        }}
        trigger={(toggle: () => void, isOpen: boolean, sq: string, setSq: (q: string) => void) => (
          <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
            <input
              className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
              value={isOpen ? (sq || "") : ((row.chequeObj?.chequeNumber) || row.transferChequeNum || "")}
              onChange={(e) => {
                if (isOpen) {
                  setSq(e.target.value);
                } else {
                  onChange?.(e.target.value);
                }
              }}
              onClick={(e) => { e.stopPropagation(); }}
              placeholder="تایپ یا انتخاب..."
            />
            <div 
              className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
              onClick={(e) => { e.stopPropagation(); toggle(); }}
            >
              +
            </div>
          </div>
        )}
      />
    </div>
  );

  const renderRefundableChequeDropDown = (row: any, rowIndex: number, onChange: any) => {
    const selectedIds = (values.refund1s || [])
      .map((r: any) => r.chequeObj?.id || r.chequeObj?.receiptChequeId)
      .filter(Boolean);
    
    const currentRowId = row.chequeObj?.id || row.chequeObj?.receiptChequeId;
    const finalExcludeIds = selectedIds.filter((id: any) => id !== currentRowId);
    
    let apiUrl = "/api/rap/receipt-notifications/cheques/returnable";
    const queryParams = [];
    const partyRefId = values.partyRef || (typeof values.party === 'object' ? values.party?.id || values.party?.partyId || values.party?.cashId : values.party);
    if (partyRefId) {
      queryParams.push(`partyRef=${partyRefId}`);
    }
    if (finalExcludeIds.length > 0) {
      queryParams.push(`excludeIds=${finalExcludeIds.join(',')}`);
    }
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`;
    }

    return (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
 id={`refund-chequenum-${rowIndex}`}
  value={row.chequeObj || { chequeNumber: row.refundableChequeNum }}
  disabled={isReadonly}
 label={null as any}
 displayKey="chequeNumber"
 listApiUrl={apiUrl}
 enableMultiSelection={true}
 columns={[
 { key: "type", label: "نوع", width: 140 },
 { key: "chequeNumber", label: "شماره چک", width: 120 },
 { key: "chequeDate", label: "تاریخ چک", width: 100 },
 { key: "partyName", label: "صاحب چک", width: 150 },
 { key: "amount", label: "مبلغ چک", width: 120 },
 { key: "accountNumber", label: "شماره حساب چک", width: 120 },
 { key: "bankName", label: "نام بانک", width: 120 },
 ]}
 onChange={(items: any) => {
 if (!items) return;
 const selectedArray = Array.isArray(items) ? items : [items];
 handleSelectRefundCheques(selectedArray, rowIndex);
 }}
 trigger={(toggle: () => void, isOpen: boolean, sq: string, setSq: (q: string) => void) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-sm overflow-hidden text-[11px] focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : ((row.chequeObj?.chequeNumber) || row.refundableChequeNum || "")}
 onChange={(e) => setSq(e.target.value)}
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 onFocus={(e) => { if(!isOpen) toggle(); }}
 placeholder="انتخاب..."
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 >
 +
 </div>
 </div>
 )}
 />
 </div>
 );

  };

 const renderRefundablePromissoryNoteDropDown = (row: any, rowIndex: number, onChange: any) => {
 const selectedIds = (values.refund2s || [])
 .map((r: any) => r.promissoryNoteObj?.id || r.promissoryNoteObj?.receiptPromissoryNoteId)
 .filter(Boolean);
 
 const currentRowId = row.promissoryNoteObj?.id || row.promissoryNoteObj?.receiptPromissoryNoteId;
 const finalExcludeIds = selectedIds.filter((id: any) => id !== currentRowId);
 
 let apiUrl = "/api/rap/receipt-notifications/promissory-notes/returnable";
 const queryParams = [];
 if (values.party) {
 queryParams.push(`partyRef=${typeof values.party === 'object' ? values.party.id || values.party.partyId : values.party}`);
 }
 if (finalExcludeIds.length > 0) {
 queryParams.push(`excludeIds=${finalExcludeIds.join(',')}`);
 }
 if (queryParams.length > 0) {
 apiUrl += `?${queryParams.join('&')}`;
 }

 return (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
 id={`refund-promissorynotenum-${rowIndex}`}
  value={row.promissoryNoteObj || { promissoryNoteNumber: row.promissoryNoteNum }}
  disabled={isReadonly}
 label={null as any}
 displayKey="promissoryNoteNumber"
 listApiUrl={apiUrl}
 enableMultiSelection={true}
 columns={[
 { key: "promissoryNoteNumber", label: "شماره سفته", width: 120 },
 { key: "dueDate", label: "تاریخ سررسید", width: 100 },
 { key: "partyName", label: "صاحب سفته", width: 150 },
 { key: "amount", label: "مبلغ سفته", width: 120 },
 ]}
 onChange={(items: any) => {
 if (!items) return;
 const selectedArray = Array.isArray(items) ? items : [items];
 handleSelectRefundPromissoryNotes(selectedArray, rowIndex);
 }}
 trigger={(toggle: () => void, isOpen: boolean, sq: string, setSq: (q: string) => void) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-sm overflow-hidden text-[11px] focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : ((row.promissoryNoteObj?.promissoryNoteNumber) || row.promissoryNoteNum || "")}
 onChange={(e) => setSq(e.target.value)}
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 onFocus={(e) => { if(!isOpen) toggle(); }}
 placeholder="انتخاب..."
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 >
 +
 </div>
 </div>
 )}
 />
 </div>
 );
 };

 const isCharge = (values.paymentType === 2 || values.paymentType === '2') && (values.baseType === 5 || values.baseType === '5');
 const defaultBase = (isCharge && values.baseNumberObj) ? values.baseNumberObj.requestNumber : "";
 const defaultAmount = (isCharge && values.baseNumberObj) ? values.baseNumberObj.requestedAmount : "";

 const chequeColumns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "base",
 header: "مبنا",
 type: "custom" as const,
 width: "80px",
 defaultValue: defaultBase,
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.base || ""}
 readOnly
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={() => {
 if (isCharge) {
 setValues((prev: any) => {
 const newCheques = [...(prev.cheques || [])];
 newCheques[rowIndex] = { ...newCheques[rowIndex], base: defaultBase, amount: defaultAmount };
 return { ...prev, cheques: newCheques };
 });
 }
 }}
 >
 +
 </div>
 </div>
 ),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`cheque-op-${rowIndex}`}
  value={row.op}
  disabled={isReadonly}
 label={null as any}
 displayKey="code"
 onChange={(item: any) => onChange?.(item)}
 listApiUrl="/api/rap/accounting-setting?usedEntryType=1&operationType=2&isActive=true&hasAccount=true"
 
 columns={[
 { key: "code", label: "کد", width: 80 },
 { key: "title", label: "عنوان", width: 150 },
 ]}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : (row.op?.code || row.op || "")}
 onChange={(e) => setSq(e.target.value)}
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 onFocus={(e) => { if(!isOpen) toggle(); }}
 placeholder="انتخاب..."
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 >
 +
 </div>
 </div>
 )}
 />
 </div>
 )
 },
 {
 key: "account",
 header: "حساب بانکی",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderAccountDropDown(row, rowIndex, onChange, "cheque"),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderReasonDropDown(row, rowIndex, onChange, "cheque"),
 },
 {
 key: "num",
 header: "شماره چک",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => {
 const accId = row.account?.id || row.account?.bankAccountId || "";
 const apiUrl = accId ? `/api/rap/chequebooks?isActive=true&bankAccountRef=${accId}` : null;

 const extractNum = (val: any): string | null => {
   if (!val) return null;
   if (typeof val === "string" || typeof val === "number") return String(val).trim();
   return String(val.selectedCheckNumber || val.checkNumber || val.CheckNumber || val.chequeNumber || val.series || "").trim() || null;
 };
 const getUsedNumbers = () => {
   return values.cheques
     .filter((_: any, idx: number) => idx !== rowIndex)
     .map((c: any) => extractNum(c.num))
     .filter(Boolean) as string[];
 };

 return (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
   id={`cheque-num-${rowIndex}`}
   value={row.num}
   label={null as any}
   onChange={async (item: any) => {
     if (typeof item === "string") {
       onChange?.(item);
       return;
     }
     if (item?.id || item?.chequebookId) {
       try {
         const res = await apiFetch(`/api/rap/chequebooks/${item.id || item.chequebookId}`);
         if (res.ok) {
           const rootData = await res.json();
           const cb = rootData.data ? rootData.data : rootData;
           if (cb && cb.items && Array.isArray(cb.items)) {
             const usedNumbers = getUsedNumbers();
             const sortedItems = [...cb.items].sort((a: any, b: any) => {
               const numA = parseInt(String(a.checkNumber || a.CheckNumber || 0), 10);
               const numB = parseInt(String(b.checkNumber || b.CheckNumber || 0), 10);
               return numA - numB;
             });
             const nextCheque = sortedItems.find((i: any) => 
               (i.status === 1 || i.Status === 1) && 
               !usedNumbers.includes(String(i.checkNumber || i.CheckNumber || "").trim())
             );
             if (nextCheque) {
               onChange?.({ ...item, selectedCheckNumber: String(nextCheque.checkNumber || nextCheque.CheckNumber || "").trim() });
               return;
             }
           }
         }
       } catch (e) {
         console.error("Failed to fetch chequebook items:", e);
       }
     }
     onChange?.(item);
   }}
   listApiUrl={apiUrl || ""}
   filterItem={(item: any) => {
            if (item.isActive === false || item.IsActive === false) return false;
            if (!item.items || !Array.isArray(item.items)) return false;
            const usedNumbers = getUsedNumbers();
            const remainingCount = item.items.filter((i: any) =>
              (i.status === 1 || i.Status === 1) &&
              !usedNumbers.includes(String(i.checkNumber || i.CheckNumber || "").trim())
            ).length;
            return remainingCount > 0;
          }}
          disabled={!accId}
 displayKey="series"
 columns={[
 { key: "series", label: "سری", width: 80 },
 {
   key: "nextCheque",
   label: "چک بعدی",
   width: 100,
   renderItem: (r: any) => {
                if (!r?.items || !Array.isArray(r.items)) return String(r.startSerial || "");
                const usedNumbers = getUsedNumbers();
                const sortedItems = [...r.items].sort((a: any, b: any) => 
                  parseInt(String(a.checkNumber || a.CheckNumber || 0), 10) - parseInt(String(b.checkNumber || b.CheckNumber || 0), 10)
                );
                const nextCheque = sortedItems.find((i: any) => 
                  (i.status === 1 || i.Status === 1) && 
                  !usedNumbers.includes(String(i.checkNumber || i.CheckNumber || "").trim())
                );
                return nextCheque ? String(nextCheque.checkNumber || nextCheque.CheckNumber || "") : "تمام شده";
   }
 },
 { 
  key: "leafCount",
              label: "باقیمانده برگه چک",
              width: 140,
              renderItem: (r: any) => {
                if (!r?.items || !Array.isArray(r.items)) return "";
                const usedNumbers = getUsedNumbers();
                const remainingCount = r.items.filter((i: any) =>
                  (i.status === 1 || i.Status === 1) &&
                  !usedNumbers.includes(String(i.checkNumber || i.CheckNumber || "").trim())
                ).length;
                return String(remainingCount);
              }
            }
 ]}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : (row.num?.selectedCheckNumber || row.num?.checkNumber || row.num?.series || row.num?.startSerial || row.num?.title || row.num || "")}
 onChange={(e) => {
   if (isOpen) {
     setSq(e.target.value);
   } else {
     onChange?.(e.target.value);
   }
 }}
 onClick={(e) => { e.stopPropagation(); }}
 placeholder={accId ? "تایپ یا انتخاب..." : "ابتدا حساب بانکی را انتخاب کنید"}
 readOnly={!accId}
 />
 <div 
 className={`bg-blue-500 text-white w-6 flex flex-col items-center justify-center shrink-0 ${accId ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
 onClick={(e) => { if (accId) { e.stopPropagation(); toggle(); } }}
 >
 +
 </div>
 </div>
 )}
 />
 </div>
 )
 },
 },
 {
 key: "endorNum",
 header: "پشت نمره",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.endorNum || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "sayad",
 header: "کد صیادی",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.sayad || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "due",
 header: "تاریخ سررسید",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <DateInput
 id={`due-date-${rowIndex}`}
 value={row.due || values.date || ""}
 onChange={(val) => onChange?.(val)}
 noWrapper={true}
 />
 </div>
 ),
 },
 {
 key: "amount",
 header: "مبلغ",
 type: "custom" as const,
 width: "150px",
 defaultValue: defaultAmount,
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 onChange={(e) => {
 const val = e.target.value.replace(/[^0-9]/g, '');
 onChange?.(val);
 }}
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "desc",
 header: "شرح چک",
 type: "custom" as const,
 width: "300px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.desc || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const cashColumns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "base",
 header: "سند مبنا",
 type: "custom" as const,
 width: "120px",
 defaultValue: defaultBase,
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.base || ""}
 readOnly
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={() => {
 if (isCharge) {
 setValues((prev: any) => {
 const newCashes = [...(prev.cashes || [])];
 newCashes[rowIndex] = { ...newCashes[rowIndex], base: defaultBase, amount: defaultAmount };
 return { ...prev, cashes: newCashes };
 });
 }
 }}
 >
 +
 </div>
 </div>
 ),
 },
 {
 key: "cash",
 header: "صندوق",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderCashDropDown(row, rowIndex, onChange, "cash"),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "cash"),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderReasonDropDown(row, rowIndex, onChange, "cash"),
 },
 {
 key: "payDate",
 header: "تاریخ پرداخت",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <div className="flex items-center justify-center text-slate-400 px-2 bg-gray-100 dark:bg-gray-800">
 📅
 </div>
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={values.date || ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "amount",
 header: "مبلغ",
 type: "custom" as const,
 width: "150px",
 defaultValue: defaultAmount,
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 onChange={(e) => onChange?.(e.target.value.replace(/[^0-9]/g, ''))}
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "300px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const withdrawalColumns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "withdrawal", "7"),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderReasonDropDown(row, rowIndex, onChange, "withdrawal"),
 },
 {
 key: "base",
 header: "سند مبنا",
 type: "custom" as const,
 width: "120px",
 defaultValue: defaultBase,
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.base || ""}
 readOnly
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={() => {
 if (isCharge) {
 setValues((prev: any) => {
 const newWithdrawals = [...(prev.withdrawals || [])];
 newWithdrawals[rowIndex] = { ...newWithdrawals[rowIndex], base: defaultBase, amount: defaultAmount };
 return { ...prev, withdrawals: newWithdrawals };
 });
 }
 }}
 >
 +
 </div>
 </div>
 ),
 },
 {
 key: "account",
 header: "حساب بانکی",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderAccountDropDown(row, rowIndex, onChange, "withdrawal"),
 },
 {
 key: "trackingNum",
 header: "شماره پیگیری",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.trackingNum || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "payDate",
 header: "تاریخ پرداخت",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <div className="flex items-center justify-center text-slate-400 px-2 bg-gray-100 dark:bg-gray-800">
 📅
 </div>
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={values.date || ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "amount",
 header: "مبلغ",
 type: "custom" as const,
 width: "150px",
 defaultValue: defaultAmount,
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 onChange={(e) => onChange?.(e.target.value.replace(/[^0-9]/g, ''))}
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "300px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const transferColumns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "base",
 header: "سند مبنا",
 type: "custom" as const,
 width: "120px",
 defaultValue: defaultBase,
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.base || ""}
 readOnly
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={() => {
 if (isCharge) {
 setValues((prev: any) => {
 const newTransfers = [...(prev.transfers || [])];
 newTransfers[rowIndex] = { ...newTransfers[rowIndex], base: defaultBase, amount: defaultAmount };
 return { ...prev, transfers: newTransfers };
 });
 }
 }}
 >
 +
 </div>
 </div>
 ),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderReasonDropDown(row, rowIndex, onChange, "transfer"),
 },
 {
 key: "transferChequeNum",
 header: "شماره چک واگذاری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderTransferChequeDropDown(row, rowIndex, onChange),
 },
 {
 key: "transferChequeDate",
 header: "تاریخ چک واگذارشده",
 type: "custom" as const,
 width: "120px",
 render: (row: any) => (
 <div className="flex items-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 <span className="text-slate-400 mr-2">📅</span>
 {row.transferChequeDate || ""}
 </div>
 ),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center cursor-not-allowed opacity-70"
 value={row.op?.code ? `${row.op.code} - ${row.op.title || ''}` : row.op?.title || row.op || ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "transferChequeAmount",
 header: "مبلغ چک",
 type: "custom" as const,
 width: "150px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.transferChequeAmount ? Number(row.transferChequeAmount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "300px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const promissoryNoteColumns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "base",
 header: "سند مبنا",
 type: "custom" as const,
 width: "120px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.base || ""}
 readOnly
 />
 <div className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0">
 +
 </div>
 </div>
 ),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`promissoryNote-op-${rowIndex}`}
  value={row.op}
  disabled={isReadonly}
 label={null as any}
 displayKey="code"
 onChange={(item: any) => onChange?.(item)}
 listApiUrl="/api/rap/accounting-setting?usedEntryType=2&operationType=2&isActive=true&hasAccount=true"
 
 columns={[
 { key: "code", label: "کد", width: 80 },
 { key: "title", label: "عنوان", width: 150 },
 ]}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : (row.op?.code || row.op || "")}
 onChange={(e) => setSq(e.target.value)}
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 onFocus={(e) => { if(!isOpen) toggle(); }}
 placeholder="انتخاب..."
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 >
 +
 </div>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderReasonDropDown(row, rowIndex, onChange, "promissoryNote"),
 },
 {
 key: "promissoryNoteNum",
 header: "شماره سفته",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`promissoryNote-num-${rowIndex}`}
  value={typeof row.promissoryNoteNum === 'object' && row.promissoryNoteNum !== null ? row.promissoryNoteNum : { promissoryNoteNumber: row.promissoryNoteNum }}
  disabled={isReadonly}
 label={null as any}
 onChange={(item: any) => {
 onChange?.(item);
 if (item && (item.value || item.amount)) {
 setValues((prev: any) => {
 const newArray = [...(prev.promissoryNotes || [])];
 if (newArray[rowIndex]) {
 newArray[rowIndex] = { ...newArray[rowIndex], amount: item.value || item.amount };
 }
 return { ...prev, promissoryNotes: newArray };
 });
 }
 }}
 listApiUrl="/api/rap/promissory-notes/unused"
 displayKey="promissoryNoteNumber"
 columns={[
 { key: "promissoryNoteNumber", label: "شماره سفته", width: 150 },
 { key: "value", label: "ارزش سفته", width: 150 }
 ]}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : (row.promissoryNoteNum?.promissoryNoteNumber || row.promissoryNoteNum || "")}
 onChange={(e) => {
   if (isOpen) {
     setSq(e.target.value);
   } else {
     onChange?.(e.target.value);
   }
 }}
 onClick={(e) => { e.stopPropagation(); }}
 placeholder="تایپ یا انتخاب..."
 />
 <div 
 className="bg-blue-500 text-white w-6 absolute inset-y-0 left-0 flex flex-col items-center justify-center cursor-pointer shrink-0"
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 >
 +
 </div>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "amount",
 header: "مبلغ سفته",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 onChange={(e) => onChange?.(e.target.value.replace(/[^0-9]/g, ''))}
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "dueDate",
 header: "سررسید سفته",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <div className="flex items-center justify-center text-slate-400 px-2 bg-gray-100 dark:bg-gray-800">
 📅
 </div>
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.dueDate ?? values.date ?? ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "durationType",
 header: "نوع مدت",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <select
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 block"
 value={row.durationType || "short"}
 onChange={(e) => onChange?.(e.target.value)}
 >
 <option value="short">کوتاه مدت</option>
 <option value="long">بلندمدت</option>
 </select>
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "300px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const refund1Columns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "cash",
 header: "صندوق",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderCashDropDown(row, rowIndex, onChange, "refund1"),
 },
 {
 key: "refundableChequeNum",
 header: "شماره چک قابل استرداد",
 type: "custom" as const,
 width: "180px",
 render: (row: any, rowIndex: number, onChange: any) => renderRefundableChequeDropDown(row, rowIndex, onChange),
 },
 {
 key: "chequeDate",
 header: "تاریخ چک",
 type: "custom" as const,
 width: "120px",
 render: (row: any) => (
 <div className="flex items-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 <span className="text-slate-400 mr-2">📅</span>
 {row.chequeDate || ""}
 </div>
 ),
 },
 {
 key: "chequeAmount",
 header: "مبلغ چک",
 type: "custom" as const,
 width: "150px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.chequeAmount ? Number(row.chequeAmount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "300px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const refund2Columns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "promissoryNoteNum",
 header: "شماره سفته",
 type: "custom" as const,
 width: "180px",
 render: (row: any, rowIndex: number, onChange: any) => renderRefundablePromissoryNoteDropDown(row, rowIndex, onChange),
 },
 {
 key: "amount",
 header: "مبلغ سفته",
 type: "custom" as const,
 width: "150px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.currency || "ریال"}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "dueDate",
 header: "سررسید سفته",
 type: "custom" as const,
 width: "120px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <div className="flex items-center justify-center text-slate-400 px-2 bg-gray-100 dark:bg-gray-800 border-l border-slate-200 dark:border-slate-700">
 📅
 </div>
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.dueDate || ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "300px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const firstGuaranteeType = values.guarantees?.[0]?.guaranteeType || "";
 const isBankGuarantee = firstGuaranteeType === "3";

 let guaranteeNumberHeader = "شماره چک /سریال سفته/ شماره ضمانت نامه";
 if (firstGuaranteeType === "1") {
 guaranteeNumberHeader = "شماره چک";
 } else if (firstGuaranteeType === "2") {
 guaranteeNumberHeader = "شماره سفته";
 } else if (firstGuaranteeType === "3") {
 guaranteeNumberHeader = "شماره ضمانت نامه";
 }

 const guaranteeColumns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "baseDocument",
 header: "سند مبنا",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.baseDocument || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "guarantee", "8"),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderReasonDropDown(row, rowIndex, onChange, "guarantee"),
 },
 {
 key: "guaranteeType",
 header: "نوع تضمین",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <select
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 "
 value={row.guaranteeType || ""}
 onChange={(e) => onChange?.(e.target.value)}
 >
 <option value="" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">انتخاب</option>
 <option value="1" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">چک</option>
 <option value="2" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">سفته</option>
 <option value="3" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">ضمانت نامه بانکی</option>
 </select>
 </div>
 ),
 },
 {
 key: "guaranteeNumber",
 header: guaranteeNumberHeader,
 type: "custom" as const,
 width: "220px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.guaranteeNumber || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ...(isBankGuarantee
 ? [
 {
 key: "notificationDate",
 header: "تاریخ اعتبار ضمانت نامه",
 type: "custom" as const,
 width: "220px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 <span className="text-slate-400 mr-2">📅</span>
 <input
 className="bg-transparent border-none outline-none w-full"
 value={row.notificationDate || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ]
 : []),
 ...(firstGuaranteeType === "1" ||
 firstGuaranteeType === "3"
 ? [
 {
 key: "bankAccount",
 header: "حساب بانکی",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderAccountDropDown(row, rowIndex, onChange, "guarantee", "bankAccount"),
 },
 ]
 : []),
 {
 key: "amount",
 header: "مبلغ تضمین",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 onChange={(e) => onChange?.(e.target.value.replace(/[^0-9]/g, ''))}
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "250px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const refund3Columns = [
 {
 key: "rowNum",
 header: "ردیف",
 type: "custom" as const,
 width: "50px",
 render: (row: any, rowIndex: number) => (
 <div className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 {rowIndex + 1}
 </div>
 ),
 },
 {
 key: "baseDocument",
 header: "سند مبنا",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.baseDocument || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "guaranteeType",
 header: "نوع تضمین",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <select
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 "
 value={row.guaranteeType || ""}
 onChange={(e) => onChange?.(e.target.value)}
 >
 <option value="" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">انتخاب</option>
 <option value="1" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">چک</option>
 <option value="2" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">سفته</option>
 <option value="3" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">ضمانت نامه بانکی</option>
 </select>
 </div>
 ),
 },
 {
 key: "guaranteeNumber",
 header: "شماره چک /سریال سفته/ شماره ضمانت نامه",
 type: "custom" as const,
 width: "220px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.guaranteeNumber || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "dueDate",
 header: "تاریخ سررسیداعلامیه/ تاریخ اعتبار ضمانت نامه",
 type: "custom" as const,
 width: "220px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 rounded-sm text-xs text-slate-800 dark:text-slate-200 ">
 <span className="text-slate-400 mr-2">📅</span>
 <input
 className="bg-transparent border-none outline-none w-full flex-1 px-2"
 value={row.dueDate || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "bankName",
 header: "نام بانک",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.bankName || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "bankBranch",
 header: "شعبه بانک",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.bankBranch || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "amount",
 header: "مبلغ تضمین",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 onChange={(e) => onChange?.(e.target.value.replace(/[^0-9]/g, ''))}
 />
 </div>
 ),
 },
 {
 key: "currency",
 header: "نوع ارز",
 type: "custom" as const,
 width: "100px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
  disabled={isReadonly}
  data={[
  { id: "ریال", title: "ریال" },
 { id: "دلار", title: "دلار" },
 { id: "یورو", title: "یورو" },
 ]}
 columns={[{ key: "title", label: "عنوان", width: 90 }]}
 value={{ title: row.currency || "ریال" }}
 onChange={(item: any) => onChange?.(item.title)}
 displayKey="title"
 trigger={(toggle: any, isOpen: any) => (
 <div
 onClick={(e) => { e.stopPropagation(); toggle(); }}
 className="flex items-center justify-center w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs cursor-pointer text-center"
 >
 <span>{row.currency || "ریال"}</span>
 </div>
 )}
 />
 </div>
 ),
 },
 {
 key: "description",
 header: "شرح قلم",
 type: "custom" as const,
 width: "250px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.description || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 ];

 const isHeaderComplete = !!(
 values.baseType &&
 ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') || values.baseNumber) &&
 (isDocumentNoAuto || values.number) &&
 values.date &&
 values.partyRef &&
 values.paymentType &&
 values.status &&
 values.description
 );

 

 const filterCols = (cols: any[]) => cols.filter((col: any) => !((col.key === 'base' || col.key === 'baseDocument') && (values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا')));

 const bottomTabs = [
 {
 id: "cash",
 label: "نقد",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[{ id: "cashes", label: "نقد", columns: filterCols(cashColumns) }]}
 value={values.cashes}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, cashes: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "cheque",
 label: "چک",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[{ id: "cheques", label: "چک‌ها", columns: filterCols(chequeColumns) }]}
 value={values.cheques}
 onChange={(value) => setValues((prev) => ({ ...prev, cheques: value }))} 
 footerActions={<>
<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>
<button type="button" onClick={() => { if (!activeRowData) { showToast("لطفاً ابتدا یک ردیف را انتخاب کنید", "error"); return; } setPrintCheckData(activeRowData); setIsPrintDialogOpen(true); }} disabled={!activeRowData} className="p-1 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-30 transition-colors rounded drop-shadow-sm flex items-center gap-1 text-xs" title="چاپ چک"> <Printer className="w-4 h-4" /> چاپ </button>
</>} 
 
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 />
 </div>
 ),
 },
 {
 id: "withdrawal",
 label: "اعلامیه برداشت",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "withdrawals",
 label: "اعلامیه برداشت",
 columns: filterCols(withdrawalColumns),
 },
 ]}
 value={values.withdrawals || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, withdrawals: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "transfer",
 label: "واگذار به غیر",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "transfers",
 label: "واگذار به غیر",
 columns: filterCols(transferColumns),
 },
 ]}
 value={values.transfers || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, transfers: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "refund1",
 label: "استرداد چک دریافتنی",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "refund1",
 label: "استرداد چک دریافتنی",
 columns: filterCols(refund1Columns),
 },
 ]}
 value={values.refund1s || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, refund1s: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "promissoryNote",
 label: "سفته",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 { id: "promissoryNote", label: "سفته", columns: filterCols(promissoryNoteColumns) },
 ]}
 value={values.promissoryNotes || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, promissoryNotes: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "refund2",
 label: "استرداد سفته دریافتنی",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "refund2",
 label: "استرداد سفته دریافتنی",
 columns: filterCols(refund2Columns),
 },
 ]}
 value={values.refund2s || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, refund2s: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "guarantee",
 label: "تضمین",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 { id: "guarantee", label: "تضمین", columns: filterCols(guaranteeColumns) },
 ]}
 value={values.guarantees || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, guarantees: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "refund3",
 label: "استرداد تضمین",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "refund3",
 label: "استرداد تضمین",
 columns: filterCols(refund3Columns),
 },
 ]}
 value={values.refund3s || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, refund3s: value }))
 }
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 ];

 
 const tabKeyMap: Record<string, string> = {
   cash: "paymentTabCash",
   cheque: "paymentTabCheque",
   withdrawal: "paymentTabWithdrawal",
   transfer: "paymentTabTransfer",
   refund1: "paymentTabRefund1",
   promissoryNote: "paymentTabPromissoryNote",
   refund2: "paymentTabRefund2",
   guarantee: "paymentTabGuarantee",
   refund3: "paymentTabRefund3",
 };

  const filteredBottomTabs = React.useMemo(() => {
    if (!isSettingsLoaded) {
      return [];
    }
    let tabs = bottomTabs;
    
    // First apply original filtering by paymentType and baseType
    if (values.paymentType === 6 || values.paymentType === '6') {
      tabs = tabs.filter((t: any) => ["cash"].includes(t.id));
    } else if ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 5 || values.paymentType === '5')) {
      tabs = tabs.filter((t: any) => ["cash", "cheque"].includes(t.id));
    } else if ((values.paymentType === 3 || values.paymentType === '3') || ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 4 || values.paymentType === '4'))) {
      tabs = tabs.filter((t: any) => ["cheque", "withdrawal"].includes(t.id));
    } else if (values.baseType === 5 || values.baseType === '5') {
      tabs = tabs.filter((t: any) => ["cash", "cheque", "withdrawal", "transfer"].includes(t.id));
    }
    
    // Then apply activeTabs settings filtering
    return tabs.filter((tab) => {
      const key = tabKeyMap[tab.id];
      return !key || activeTabs[key] !== false;
    });
  }, [bottomTabs, values.paymentType, values.baseType, activeTabs, isSettingsLoaded]);

 const totalAmount = React.useMemo(() => {
   let sum = 0;
   const addSum = (arr: any[]) => {
     if (!Array.isArray(arr)) return;
     arr.forEach(item => {
       const amtStr = String(item.amount || item.chequeAmount || item.transferChequeAmount || item.promissoryNoteAmount || '').replace(/[^0-9]/g, '');
       const amt = Number(amtStr);
       if (!isNaN(amt)) sum += amt;
     });
   };
   addSum(values.cashes);
   addSum(values.cheques);
   addSum(values.promissoryNotes);
   addSum(values.transfers);
   addSum(values.withdrawals);
   addSum(values.refund1s);
   addSum(values.refund2s);
   addSum(values.refund3s);
   return sum;
 }, [values.cashes, values.cheques, values.promissoryNotes, values.transfers, values.withdrawals, values.refund1s, values.refund2s, values.refund3s]);

 const footer = (
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 text-[11px] font-medium items-end h-auto">
     <div className="flex flex-col gap-1.5">
       <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
         <span className="text-gray-600 dark:text-gray-400">عنوان عملیات حسابداری :</span>
         <span className="font-bold">{activeRowData?.op?.title || "-"}</span>
       </div>
       <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
         <span className="text-gray-600 dark:text-gray-400">عنوان بابت :</span>
         <span className="font-bold">{activeRowData?.reason?.Title || activeRowData?.reason?.title || "-"}</span>
       </div>
     </div>
     <div className="flex flex-col gap-1.5">
       <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
         <span className="text-gray-600 dark:text-gray-400">شماره سند حسابداری :</span>
         <span className="font-bold">{associatedVoucher?.voucherNumber || "-"}</span>
       </div>
       <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
         <span className="text-gray-600 dark:text-gray-400">تاریخ سند حسابداری :</span>
         <span className="font-bold">{associatedVoucher?.voucherDate ? moment(associatedVoucher.voucherDate).format("jYYYY/jMM/jDD") : "-"}</span>
       </div>
     </div>
     <div className="flex flex-col gap-1.5 h-full justify-end w-2/3 mr-auto">
       <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
         <span className="text-gray-800 dark:text-gray-200 font-bold">جمع کل :</span>
         <span className="font-bold">
           {((values.paymentType === 2 || values.paymentType === '2') && (values.baseType === 5 || values.baseType === '5') && values.baseNumberObj?.requestedAmount)
             ? Number(values.baseNumberObj.requestedAmount).toLocaleString('en-US')
             : (totalAmount > 0 ? totalAmount.toLocaleString('en-US') : "-")}
         </span>
       </div>
     </div>
   </div>
 );

 const defaultBottomTabId = React.useMemo(() => {
 const isPettyCash = values.baseType === 5 || values.baseType === '5';
 if (values.cashes && values.cashes.length > 0) return "cash";
 if (values.cheques && values.cheques.length > 0) return "cheque";
 if (values.withdrawals && values.withdrawals.length > 0) return "withdrawal";
 if (values.transfers && values.transfers.length > 0) return "transfer";
 if (!isPettyCash) {
 if (values.refund1s && values.refund1s.length > 0) return "refund1";
 if (values.promissoryNotes && values.promissoryNotes.length > 0) return "promissoryNote";
 if (values.refund2s && values.refund2s.length > 0) return "refund2";
 if (values.refund3s && values.refund3s.length > 0) return "refund3";
 }

 if ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا' || values.baseType === 3 || values.baseType === '3' || values.baseType === 'دستور پرداخت') && (values.paymentType === 5 || values.paymentType === '5')) {
 return "cash";
 }

 if (values.paymentType === 3 || values.paymentType === '3' || values.paymentType === 4 || values.paymentType === '4') {
 return "withdrawal";
 }

 return "cash";
 }, [values.baseType, values.paymentType, values.cashes, values.cheques, values.withdrawals, values.transfers, values.refund1s, values.promissoryNotes, values.refund2s, values.refund3s]);

  return (
    <>
      <LoadingOverlay visible={isVoucherLoading} message="در حال بارگذاری سند حسابداری" />
      <LoadingOverlay visible={isDeletingVoucher} message="در حال حذف سند..." />
      <SimpleFormTwoRowTabbed
        hasDateInput={true}
        isReadonly={isReadonly || false}
        headerTop={
          associatedVoucher ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 text-xs rounded-sm mb-2 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              این اعلامیه پرداخت دارای سند حسابداری (به شماره {associatedVoucher.voucherNumber || associatedVoucher.referenceNumber}) می‌باشد و غیرقابل ویرایش است. برای ویرایش، ابتدا سند حسابداری را حذف نمایید.
            </div>
          ) : null
        }
        title={isUpdate ? "ویرایش اعلامیه پرداخت" : "اعلامیه پرداخت جدید"}
        icon={<CreditCard className="w-5 h-5" />}
        fields={fields}
        values={values}
        errors={errors}
        tabResetTrigger={activeId}
        defaultBottomTabId={defaultBottomTabId}
        showListButton={true}
        listApiUrl="/api/rap/payment-notifications"
        listColumns={listColumns} /* 
          { key: "paymentNotificationId", label: "کد", width: 80 },
          { key: "documentNumber", label: "شماره", width: 120 },
          { key: "paymentType", label: "نوع پرداخت", width: 150 },
        */ 
        listDisplayKey="documentNumber"
        onListSelect={(item: any) => {
          const itemId = item.paymentNotificationId || item.id;
          if (activeId !== itemId) {
            if (!activeId) {
               setActiveId(itemId);
               return;
            }
            if (addTab) {
              addTab(
                `ویرایش اعلامیه (${item.documentNumber || ''})`,
                'rap',
                <List className="w-4 h-4" />,
                "PaymentNotificationForm",
                { id: itemId }
              );
            }
          }
        }}
 onChange={(name, value) => {
 if (name === "partyRef" || name === "party") return; // Handled specially
 setValues((prev) => ({ ...prev, [name]: value }))
 }}
 onSave={handleSave}
  onSaveNew={async () => {
    activeIdRef.current = undefined;
  await handleSave();
  reset();
  setValues((prev) => ({ 
    ...prev, 
    date: moment().locale('en').format("jYYYY/jMM/jDD") 
  }));
  setActiveId(undefined);
  setRefreshNumberingTrigger(prev => prev + 1);
  }}
 onSaveClose={async () => {
 await handleSave();
 removeTab(`PaymentNotificationForm-${activeId || 'new'}`);
 }}
 onDelete={activeId ? async () => {
 try {
 const res = await apiFetch(`/api/rap/payment-notifications/${activeId}`, { method: "DELETE" });
 if (!res.ok) throw new Error(await res.text());
 } catch (e: any) {
 throw e;
 }
 } : undefined}
  onNew={() => {
    setAssociatedVoucher(null);
    setOriginalData(null);
    activeIdRef.current = undefined;
    reset();
    setValues((prev) => ({ 
      ...prev, 
      date: moment().locale('en').format("jYYYY/jMM/jDD") 
    }));
    setActiveId(undefined);
    setRefreshNumberingTrigger(prev => prev + 1);
  }}
 bottomTabs={filteredBottomTabs}
        footer={footer}
 headerGradient="bg-gradient-to-r from-[#6b7280] to-[#7c3aed]"
 labelWidth="100px"
 actionbar={
    <div className="flex items-center gap-1.5">
      <VoucherActionButtons action="insert" onClick={handleVoucherInsert} disabled={!activeId || !!associatedVoucher || values.status !== 5} />
      <VoucherActionButtons action="view" onClick={handleVoucherView} disabled={!activeId || (!associatedVoucher && String(values.status) !== "8")} />
      <VoucherActionButtons action="edit" onClick={handleVoucherEdit} disabled={!activeId || (!associatedVoucher && String(values.status) !== "8")} />
      <VoucherActionButtons action="delete" onClick={handleVoucherDelete} disabled={!activeId || (!associatedVoucher && String(values.status) !== "8")} />
      <PrintDropdownButton 
        targetForm="Rap.PaymentNotification"
        defaultAction={() => {
          showToast("چاپ پیش‌فرض اجرا شد...", "info");
        }}
        onPrint={(reportId, isUserReport) => {
          if (reportId) {
            showToast(`در حال تولید خروجی گزارش...`, "info");
            addTab(
              `چاپ پیش‌نمایش`,
              `general_group`,
              undefined,
              'ReportViewer',
              { reportId: reportId.toString(), recordId: activeId?.toString(), isUserReport }
            );
          } else {
            showToast("در حال تولید خروجی قالب PaymentNotificationA4...", "info");
            addTab(
              `چاپ پیش‌نمایش`,
              `general_group`,
              undefined,
              'ReportViewer',
              { reportId: 'PaymentNotificationA4', recordId: activeId?.toString(), isFileReport: true }
            );
          }
        }}
        disabled={!activeId}
      />
    </div>
  }
 />
 <PrintChequeDialog
 isOpen={isPrintDialogOpen}
 onClose={() => setIsPrintDialogOpen(false)}
 checkData={printCheckData}
 bankId={values.bankAccount || "1"} // Usually grabbed from bank selection in the row or form
 />
 <ChequeSelectModal
 open={chequeSelectState.open}
 onClose={() => setChequeSelectState({ open: false, rowIndex: -1 })}
 onSelect={(selected) => {
 handleSelectCheques(selected, chequeSelectState.rowIndex);
 setChequeSelectState({ open: false, rowIndex: -1 });
 }}
 />
 
      <DocumentAccountingInfoModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} documentType="PaymentNotification" documentRef={activeId ? Number(activeId) : null} party={values.party} activeRowData={activeRowData || (values.cashes && values.cashes.length > 0 ? values.cashes[0] : null)} />
</>
 );
}
