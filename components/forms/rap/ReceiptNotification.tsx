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
import { StateListInput } from "../../inputs/StateListInput";
import { CreditCard, Printer, Info, CheckCircle2, List } from "lucide-react";
import { eventBus, EVENTS } from "@/lib/events";
import { PrintChequeDialog } from "./PrintChequeDialog";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { apiFetch, toEnglishDigits } from "@/lib/utils";
import { DatePicker } from "../../inputs/DatePicker";
import { DateInput } from "../../inputs/DateInput";
import { NumberInput } from "../../inputs/NumberInput";
import { PrintDropdownButton } from "../../buttons/PrintDropdownButton";
import { VoucherActionButtons } from "../../buttons/VoucherActionButtons";
import { DocumentAccountingInfoModal } from "../../ui/DocumentAccountingInfoModal";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportViewer } from "@/components/forms/common/ReportViewer";
import moment from "moment-jalaali";
import { useReceiptNotificationStore } from "@/lib/stores/receiptNotificationStore";
import { generateVoucherInitialDataFromAccountingInfo } from "@/lib/voucher-utils";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

interface ReceiptNotificationFormProps {
 id?: number | string;
 initialData?: any;
 tabId?: string;
}

import { useReceiptNotificationColumns } from "./ReceiptNotificationList";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";

export function ReceiptNotificationForm({id, initialData, tabId }: ReceiptNotificationFormProps) {
  const { confirm } = useConfirm();

  const rawListColumns = useReceiptNotificationColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const [isAccModalOpen, setIsAccModalOpen] = React.useState(false);

 const { t } = useLanguage();
 const { removeTab, addTab, activeTabId } = useTabs();
 const { showToast } = useToast();
 
 

  const { activeId, isUpdate, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id || initialData?.receiptNotificationId);
  const activeIdRef = React.useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);
 const { isUsed } = useFormUsageCheck("ReceiptNotification", activeId);
 const [associatedVoucher, setAssociatedVoucher] = useState<any>(null);

  const [activeTabs, setActiveTabs] = useState<Record<string, boolean>>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("rap_receipt_tab_settings");
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      receiptTabCash: true,
      receiptTabCheque: true,
      receiptTabWithdrawal: true,
      receiptTabTransfer: true,
      receiptTabRefund1: true,
      receiptTabPromissoryNote: true,
      receiptTabRefund2: true,
      receiptTabGuarantee: true,
      receiptTabRefund3: true,
    };
  });

  const [isSettingsLoaded, setIsSettingsLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("rap_receipt_tab_settings");
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
            receiptTabCash: data.receiptTabCash !== "false",
            receiptTabCheque: data.receiptTabCheque !== "false",
            receiptTabWithdrawal: data.receiptTabWithdrawal !== "false",
            receiptTabTransfer: data.receiptTabTransfer !== "false",
            receiptTabRefund1: data.receiptTabRefund1 !== "false",
            receiptTabPromissoryNote: data.receiptTabPromissoryNote !== "false",
            receiptTabRefund2: data.receiptTabRefund2 !== "false",
            receiptTabGuarantee: data.receiptTabGuarantee !== "false",
            receiptTabRefund3: data.receiptTabRefund3 !== "false",
          };
          setActiveTabs(loadedSettings);
          setIsSettingsLoaded(true);
          try {
            localStorage.setItem("rap_receipt_tab_settings", JSON.stringify(loadedSettings));
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
 } = useReceiptNotificationStore();

const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
  const [fiscalYearDetails, setFiscalYearDetails] = useState<any>(null);
  const [dateError, setDateError] = useState<string>('');

  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);
  const [refreshNumberingTrigger, setRefreshNumberingTrigger] = useState(0);
  const [originalData, setOriginalData] = useState<any>(initialData || null);
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(true);
  const isReadonly = isUsed || !!associatedVoucher || String(values.status) === "8" || String(originalData?.status) === "8" || isFormDisabledDueToFiscalYear;

  const [isVoucherLoading, setIsVoucherLoading] = useState(false);
  const [isDeletingVoucher, setIsDeletingVoucher] = useState(false);

  
  
  const loadAssociatedVoucher = async () => {
    const currentId = activeIdRef.current;
    if (!currentId) {
      setAssociatedVoucher(null);
      return;
    }
    try {
      let currentVoucherHeaderRef = values.voucherHeaderRef;
      
      if (currentId) {
        const parentRes = await apiFetch(`/api/rap/receipt-notifications/${currentId}`);
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
        const vRes = await apiFetch(`/api/accounting/vouchers/${currentVoucherHeaderRef}`);
        if (vRes.ok) {
          if (activeIdRef.current !== currentId) return;
          const vData = await vRes.json();
          setAssociatedVoucher(vData.data || vData);
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
    return () => unsubscribe();
  }, [activeId, values.voucherHeaderRef, activeTabId]);

  const handleVoucherInsert = async () => {
    setIsVoucherLoading(true);
    try {
      const initialData = await generateVoucherInitialDataFromAccountingInfo(
        "ReceiptNotification",
        id || activeId,
        values,
        true,
        "بابت رسید دریافت شماره"
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
            const apiPath = 'receipt-notifications';
            
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
        setDateError(''); // Don't show range error if date is incomplete
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
 promissoryNotes: initialData.promissoryNoteItems?.map((c: any) => ({
  ...c,
  id: c.receiptGuaranteeId || c.id,
  promissoryNoteNum: c.promissoryNoteNumber || "",
  promissoryNoteValue: c.promissoryNoteValue || "",
  amount: c.amount,
  cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
  op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
  reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
  })) || [],
  baseType: initialData.baseType || "بدون مبنا",
 voucherHeaderRef: initialData.voucherHeaderRef || null,
 number: initialData.documentNumber || "",
 date: initialData.documentDate ? moment(initialData.documentDate).format("jYYYY/jMM/jDD") : "",
 partyRef: initialData.partyRef || null,
 party: initialData.party || null,
 receiptType: initialData.receiptType || "تسویه مطالبات",
 baseNumber: initialData.baseNumber || "",
 status: initialData.status || 2,
 description: initialData.description || "",
 cashes: initialData.cashItems?.map((c: any) => ({
 ...c, 
 // normalize fields for UI
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 })) || [],
 cheques: initialData.chequeItems?.map((c: any) => ({
 ...c,
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
 bank: c.bank ? { ...c.bank, id: c.bank.bankId } : { id: c.bankRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 num: c.chequeNumber,
 endorNum: c.endorsementNumber,
 sayad: c.sayyadNumber,
 due: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
 currency: c.currency,
  desc: c.description || c.desc || "",
 })) || [],
 deposits: initialData.depositItems?.map((c: any) => ({
 ...c,
 account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : { id: c.bankAccountRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 trackingNum: c.trackingNumber,
 })) || [],
 returnedPaidCheques: initialData.returnedPaidCheques?.map((c: any) => ({
 ...c,
 id: c.receiptReturnedPaidChequeId,
 paymentChequeRef: c.paymentChequeRef,
 chequeObj: c.paymentCheque ? {
 chequeNumber: c.paymentCheque.chequeNumber,
 amount: c.amount, // use specific amount or cheque amount
 transferChequeDate: c.paymentCheque.paymentNotification?.documentDate ? moment(c.paymentCheque.paymentNotification.documentDate).format("jYYYY/jMM/jDD") : '',
 partyName: (c.paymentCheque.paymentNotification?.party as any)?.title || (c.paymentCheque.paymentNotification?.party as any)?.partyName || (c.paymentCheque.paymentNotification?.party?.firstName ? `${c.paymentCheque.paymentNotification.party.firstName} ${c.paymentCheque.paymentNotification.party.lastName || ''}` : ''),
 description: c.description || c.paymentCheque.description,
 id: c.paymentChequeRef,
 opCode: c.paymentCheque.accountingSetting?.code || '',
 opTitle: c.paymentCheque.accountingSetting?.title || '',
 opId: c.paymentCheque.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
 reasonTitle: c.paymentCheque.reason?.Title || c.paymentCheque.reason?.title || '',
 reasonId: c.paymentCheque.reason?.RapReasonID || null,
 } : null,
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 amount: c.amount,
 description: c.description
 })) || [],
 transfers: initialData.returnedPaymentAssignments?.map((c: any) => ({
 ...c,
 id: c.receiptReturnedPaymentAssignmentId,
 paymentAssignmentRef: c.paymentAssignmentRef,
 transferChequeNum: c.paymentAssignment?.receiptCheque?.chequeNumber || "",
 chequeObj: c.paymentAssignment ? {
 chequeNumber: c.paymentAssignment.receiptCheque?.chequeNumber || "",
 amount: c.amount,
 id: c.paymentAssignmentRef
 } : null,
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef } : null),
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 amount: c.amount,
 transferChequeAmount: c.paymentAssignment?.receiptCheque?.amount || "",
 transferChequeDate: c.paymentAssignment?.receiptCheque?.dueDate ? moment(c.paymentAssignment.receiptCheque.dueDate).format("jYYYY/jMM/jDD") : "",
 description: c.description
 })) || [],
  refund2s: initialData.returnedPaymentPromissoryNotes?.filter((c: any) => !c.dynamicDetailedData?.isGuarantee).map((c: any) => {
    const pNo = c.paymentPromissoryNote?.promissoryNoteItem?.promissoryNoteNumber || c.paymentPromissoryNote?.promissoryNoteNumber || "";
    return {
      ...c,
      id: c.receiptReturnedPaymentPromissoryNoteId,
      promissoryNoteNum: pNo,
      opTitle: c.accountingSetting?.title || "",
      reasonTitle: c.reason?.Title || c.reason?.title || "",
      promissoryObj: c.paymentPromissoryNote ? {
        promissoryNoteNumber: pNo,
        promissoryNoteNum: pNo,
        amount: c.amount,
        id: c.paymentPromissoryNoteRef
      } : null,
      op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
      reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
    };
  }) || [],
  refund3s: initialData.returnedPaymentPromissoryNotes?.filter((c: any) => c.dynamicDetailedData?.isGuarantee).map((c: any) => {
    return {
      ...c,
      id: c.receiptReturnedPaymentPromissoryNoteId,
      amount: c.amount,
      op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
      reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
      guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
      guaranteeNumber: c.dynamicDetailedData?.guaranteeNumber || "",
      baseDocument: c.dynamicDetailedData?.baseDocument || "",
      dueDate: c.dynamicDetailedData?.dueDate || "",
    };
  }) || [],
  guarantees: initialData.guaranteeItems?.map((c: any) => ({
    ...c,
    id: c.receiptGuaranteeId || c.id,
    cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef }, 
    amount: c.amount,
    op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
    reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
    guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
    guaranteeNumber: c.guaranteeNumber || c.dynamicDetailedData?.guaranteeNumber || c.promissoryNoteNumber || "",
    baseDocument: c.baseDocument || c.dynamicDetailedData?.baseDocument || "",
    bank: c.bank ? { ...c.bank, id: c.bank.bankId } : (c.bankRef ? { id: c.bankRef, title: c.bankRef } : null),
    accountNumber: c.accountNumber || c.dynamicDetailedData?.accountNumber || "",
    notificationDate: c.notificationDate ? moment(c.notificationDate).format("jYYYY/jMM/jDD") : (c.dynamicDetailedData?.notificationDate ? moment(c.dynamicDetailedData.notificationDate).format("jYYYY/jMM/jDD") : "")
  })) || [],
  });
 } else if (activeId) {
 apiFetch(`/api/rap/receipt-notifications/${activeId}`)
 .then(res => res.json())
 .then(data => {
 setValues({
 baseType: data.baseType || "بدون مبنا",
 voucherHeaderRef: data.voucherHeaderRef || null,
 number: data.documentNumber || "",
 date: data.documentDate ? moment(data.documentDate).format("jYYYY/jMM/jDD") : "",
 partyRef: data.partyRef || null,
 party: data.party || null,
 receiptType: data.receiptType || "تسویه مطالبات",
 baseNumber: data.baseNumber || "",
 status: data.status || 2,
 description: data.description || "",
 cashes: data.cashItems?.map((c: any) => ({
 ...c, 
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 })) || [],
 cheques: data.chequeItems?.map((c: any) => ({
 ...c,
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
 bank: c.bank ? { ...c.bank, id: c.bank.bankId } : { id: c.bankRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 num: c.chequeNumber,
 endorNum: c.endorsementNumber,
 sayad: c.sayyadNumber,
 due: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
 currency: c.currency,
  desc: c.description || c.desc || "",
 })) || [],
 deposits: data.depositItems?.map((c: any) => ({
 ...c,
 account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : { id: c.bankAccountRef },
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 trackingNum: c.trackingNumber,
 })) || [],
 returnedPaidCheques: data.returnedPaidCheques?.map((c: any) => ({
 ...c,
 id: c.receiptReturnedPaidChequeId,
 paymentChequeRef: c.paymentChequeRef,
 chequeObj: c.paymentCheque ? {
 chequeNumber: c.paymentCheque.chequeNumber,
 amount: c.amount,
 transferChequeDate: c.paymentCheque.paymentNotification?.documentDate ? moment(c.paymentCheque.paymentNotification.documentDate).format("jYYYY/jMM/jDD") : '',
 partyName: (c.paymentCheque.paymentNotification?.party as any)?.title || (c.paymentCheque.paymentNotification?.party as any)?.partyName || (c.paymentCheque.paymentNotification?.party?.firstName ? `${c.paymentCheque.paymentNotification.party.firstName} ${c.paymentCheque.paymentNotification.party.lastName || ''}` : ''),
 description: c.description || c.paymentCheque.description,
 id: c.paymentChequeRef,
 opCode: c.paymentCheque.accountingSetting?.code || '',
 opTitle: c.paymentCheque.accountingSetting?.title || '',
 opId: c.paymentCheque.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
 reasonTitle: c.paymentCheque.reason?.Title || c.paymentCheque.reason?.title || '',
 reasonId: c.paymentCheque.reason?.RapReasonID || null,
 } : null,
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef } : null),
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 amount: c.amount,
 description: c.description
 })) || [],
 transfers: data.returnedPaymentAssignments?.map((c: any) => ({
 ...c,
 id: c.receiptReturnedPaymentAssignmentId,
 paymentAssignmentRef: c.paymentAssignmentRef,
 transferChequeNum: c.paymentAssignment?.receiptCheque?.chequeNumber || "",
 chequeObj: c.paymentAssignment ? {
 chequeNumber: c.paymentAssignment.receiptCheque?.chequeNumber || "",
 amount: c.amount,
 id: c.paymentAssignmentRef
 } : null,
 cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef } : null),
 op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
 reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
 amount: c.amount,
 transferChequeAmount: c.paymentAssignment?.receiptCheque?.amount || "",
 transferChequeDate: c.paymentAssignment?.receiptCheque?.dueDate ? moment(c.paymentAssignment.receiptCheque.dueDate).format("jYYYY/jMM/jDD") : "",
 description: c.description
 })) || [],
 promissoryNotes: data.promissoryNoteItems?.map((c: any) => ({
         ...c,
         id: c.receiptPromissoryNoteId,
         cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef }, 
         promissoryNoteNum: c.promissoryNoteNumber || "",
         promissoryNoteValue: c.promissoryNoteValue || "",
         amount: c.amount,
         op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
         reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
       })) || [],
       guarantees: data.guaranteeItems?.map((c: any) => ({
         ...c,
         id: c.receiptGuaranteeId || c.id,
         cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef }, 
         amount: c.amount,
         op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
         reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
         guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
         guaranteeNumber: c.guaranteeNumber || c.dynamicDetailedData?.guaranteeNumber || c.promissoryNoteNumber || "",
         baseDocument: c.baseDocument || c.dynamicDetailedData?.baseDocument || "",
        bank: c.bank ? { ...c.bank, id: c.bank.bankId } : (c.bankRef ? { id: c.bankRef, title: c.bankRef } : null),
        accountNumber: c.accountNumber || c.dynamicDetailedData?.accountNumber || "",
        notificationDate: c.notificationDate ? moment(c.notificationDate).format("jYYYY/jMM/jDD") : (c.dynamicDetailedData?.notificationDate ? moment(c.dynamicDetailedData.notificationDate).format("jYYYY/jMM/jDD") : "")})) || [],
 refund2s: data.returnedPaymentPromissoryNotes?.filter((c: any) => !c.dynamicDetailedData?.isGuarantee).map((c: any) => {
         const pNo = c.paymentPromissoryNote?.promissoryNoteItem?.promissoryNoteNumber || c.paymentPromissoryNote?.promissoryNoteNumber || "";
         return {
           ...c,
           id: c.receiptReturnedPaymentPromissoryNoteId,
           promissoryNoteNum: pNo,
           opTitle: c.accountingSetting?.title || "",
           reasonTitle: c.reason?.Title || c.reason?.title || "",
           promissoryObj: c.paymentPromissoryNote ? {
             promissoryNoteNumber: pNo,
             promissoryNoteNum: pNo,
             amount: c.amount,
             id: c.paymentPromissoryNoteRef
           } : null,
           op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
           reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
         };
       }) || [],
       refund3s: data.returnedPaymentPromissoryNotes?.filter((c: any) => c.dynamicDetailedData?.isGuarantee).map((c: any) => {
         return {
           ...c,
           id: c.receiptReturnedPaymentPromissoryNoteId,
           amount: c.amount,
           op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
           reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
           guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
           guaranteeNumber: c.dynamicDetailedData?.guaranteeNumber || "",
           baseDocument: c.dynamicDetailedData?.baseDocument || "",
           dueDate: c.dynamicDetailedData?.dueDate || "",
         };
       }) || [],
 });
 })
 .catch(console.error);
 }
 }, [initialData, activeId]);

 useEffect(() => {
 if (!id && !initialData && !isUpdate && values.date) {
 apiFetch(`/api/rap/receipt-notifications/next-numbers?date=${values.date}`)
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
 if (values.baseType !== "بدون مبنا" && !values.baseNumber) newErrors.baseNumber = "شماره مبنا الزامی است";
 if (!isDocumentNoAuto && !values.number) newErrors.number = "شماره الزامی است";
 if (!values.date) newErrors.date = "تاریخ الزامی است";
  if (dateError) newErrors.date = dateError;
 if (!values.partyRef) newErrors.partyRef = "طرف مقابل الزامی است";
 if (!values.receiptType) newErrors.receiptType = "نوع دریافت الزامی است";
 if (!values.status) newErrors.status = "وضعیت الزامی است";
 if (!values.description) newErrors.description = "شرح الزامی است";
 
 const validCashes = (values.cashes || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validCheques = (values.cheques || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validDeposits = (values.deposits || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validReturnedCheques = (values.returnedPaidCheques || []).filter((c: any) => parseFloat(String(c.chequeObj?.amount || c.amount || '0').replace(/,/g, '')) > 0);
 const validTransfers = (values.transfers || []).filter((c: any) => parseFloat(String(c.transferChequeAmount || c.amount || '0').replace(/,/g, '')) > 0);
 const validPromissoryNotes = (values.promissoryNotes || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validRefund2s = (values.refund2s || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);
 const validGuarantees = (values.guarantees || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0);

 if (
 validCashes.length === 0 &&
 validCheques.length === 0 &&
 validDeposits.length === 0 &&
 validReturnedCheques.length === 0 &&
 validTransfers.length === 0 &&
 validPromissoryNotes.length === 0 &&
 validRefund2s.length === 0 && (values.refund3s || []).filter((c: any) => parseFloat(String(c.amount || '0').replace(/,/g, '')) > 0).length === 0 &&
 validGuarantees.length === 0
 ) {
 newErrors.items = "ورود اطلاعات یک قلم دریافت، الزامی است";
 }

 if (values.cashes && values.cashes.length > 0) {
 for (const cash of values.cashes) {
 const hasAnyField = cash.cash || cash.op || cash.reason || cash.amount || cash.description;
 if (hasAnyField) {
 if (!cash.cash || !cash.op || !cash.reason || !cash.amount || !cash.description) {
 newErrors.cashes = "در تب نقد، ورود اطلاعات فیلدهای صندوق، عملیات حسابداری، بابت، تاریخ دریافت، مبلغ، نوع ارز و شرح قلم اجباری است";
 break;
 }
 }
 }
 }

 if (values.cheques && values.cheques.length > 0) {
 const usedCheques = new Set();
 for (const cheque of values.cheques) {
 const hasAnyField = cheque.cash || cheque.op || cheque.reason || cheque.bank || cheque.accountNumber || cheque.num || cheque.amount || cheque.desc || cheque.due;
 if (hasAnyField) {
 if (!cheque.cash || !cheque.op || !cheque.reason || (!cheque.due && !values.date) || !cheque.bank || !cheque.accountNumber || !cheque.num || !cheque.amount || !cheque.desc) {
 newErrors.cheques = "در تب چک، ورود اطلاعات فیلدهای صندوق، عملیات حسابداری، بابت، تاریخ سررسید، نام بانک، شماره حساب، شماره چک، مبلغ، نوع ارز و شرح چک اجباری است";
 break;
 }
 const chkNum = cheque.num;
 if (chkNum) {
 if (usedCheques.has(String(chkNum))) {
 newErrors.cheques = `شماره چک ${chkNum} تکراری است. از یک چک نمی‌توان برای چندین ردیف پرداختی استفاده کرد.`;
 break;
 }
 usedCheques.add(String(chkNum));
 }
 }
 }
 }
 
 if (values.deposits && values.deposits.length > 0) {
 for (const w of values.deposits) {
 if (!w.amount) {
 newErrors.deposits = "مبلغ برای تمامی ردیف‌های اعلامیه واریز الزامی است";
 break;
 }
 if (!w.account) {
 newErrors.deposits = "حساب بانکی برای تمامی ردیف‌های اعلامیه واریز الزامی است";
 break;
 }
 }
 }
 
 if (values.returnedPaidCheques && values.returnedPaidCheques.length > 0) {
 for (const w of values.returnedPaidCheques) {
 if (!w.amount && !w.chequeObj?.amount) {
 newErrors.returnedPaidCheques = "مبلغ برای تمامی ردیف‌های استرداد چک پرداختنی الزامی است";
 break;
 }
 if (!w.chequeObj) {
 newErrors.returnedPaidCheques = "شماره چک برای تمامی ردیف‌های استرداد چک پرداختنی الزامی است";
 break;
 }
 }
 }

 if (values.transfers && values.transfers.length > 0) {
 for (const w of values.transfers) {
 if (!w.chequeObj && !w.transferChequeNum) {
 newErrors.transfers = "شماره چک واگذار شده الزامی است";
 break;
 }
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

 const payload = {
 baseType: values.baseType,
 baseNumber: values.baseNumber,
 documentNumber: values.number,
 documentDate: values.date || null,
 partyRef: values.partyRef,
 receiptType: values.receiptType,
 status: values.status,
 description: values.description,
 
 // Transform cashes for API payload
 cashItems: (values.cashes || []).map((c: any) => ({
 cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId || c.op) : null,
 amount: Number(String(c.amount).replace(/,/g, '')) || 0,
 description: c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
 })).filter((c: any) => c.amount > 0),

 chequeItems: (values.cheques || []).map((c: any) => ({
 cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
 bankRef: c.bank ? Number(c.bank.id || c.bank.bankId || c.bank) : null,
 branchName: c.branchName || null,
 accountNumber: c.accountNumber || null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
 amount: Number(String(c.amount).replace(/,/g, '')) || 0,
 description: c.desc || c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
 chequeNumber: c.num || null,
 sayyadNumber: c.sayad,
 endorsementNumber: c.endorNum,
 dueDate: c.due ? moment(toEnglishDigits(c.due), "jYYYY/jMM/jDD").format('YYYY-MM-DD') : null,
 currency: c.currency,
 })).filter((c: any) => c.amount > 0),

 depositItems: (values.deposits || []).map((c: any) => ({
 bankAccountRef: c.account ? Number(c.account.id || c.account.bankAccountId) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
 amount: Number(String(c.amount).replace(/,/g, '')) || 0,
 description: c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
 trackingNumber: c.trackingNum,
 })).filter((c: any) => c.amount > 0),

 returnedPaymentChequesItems: (values.returnedPaidCheques || []).map((c: any) => ({
 paymentChequeRef: c.chequeObj ? Number(c.chequeObj.id) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : (c.chequeObj?.opId ? Number(c.chequeObj.opId) : null),
 amount: Number(String(c.chequeObj?.amount || c.amount || '0').replace(/,/g, '')) || 0,
 description: c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : (c.chequeObj?.reasonId ? Number(c.chequeObj.reasonId) : null),
 cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
 })).filter((c: any) => c.paymentChequeRef && c.amount > 0),

 returnedPaymentAssignments: (values.transfers || []).map((c: any) => ({
 paymentAssignmentRef: c.chequeObj ? Number(c.chequeObj.id) : null,
 accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : (c.chequeObj?.opId ? Number(c.chequeObj.opId) : null),
 amount: Number(String(c.transferChequeAmount || c.amount || '0').replace(/,/g, '')) || 0,
 description: c.description,
 reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : (c.chequeObj?.reasonId ? Number(c.chequeObj.reasonId) : null),
 cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
 })).filter((c: any) => c.paymentAssignmentRef && c.amount > 0),

 returnedPaymentPromissoryNotes: [
     ...(values.refund2s || []).map((c: any) => ({
       paymentPromissoryNoteRef: c.promissoryObj ? Number(c.promissoryObj.id) : null,
       accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : (c.promissoryObj?.opId ? Number(c.promissoryObj.opId) : null),
       amount: Number(String(c.amount || '0').replace(/,/g, '')) || 0,
       description: c.description,
       reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : (c.promissoryObj?.reasonId ? Number(c.promissoryObj.reasonId) : null),
     })).filter((c: any) => c.paymentPromissoryNoteRef && c.amount > 0),
     ...(values.refund3s || []).map((c: any) => ({
       paymentPromissoryNoteRef: null,
       accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
       amount: Number(String(c.amount || '0').replace(/,/g, '')) || 0,
       description: c.description,
       reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
       dynamicDetailedData: { isGuarantee: true, guaranteeType: c.guaranteeType ? Number(c.guaranteeType) : null, guaranteeNumber: c.guaranteeNumber, dueDate: c.dueDate, baseDocument: c.baseDocument }
     })).filter((c: any) => c.amount > 0)
 ],

 promissoryNoteItems: [
   ...(values.promissoryNotes || []).map((c: any) => ({
     promissoryNoteNumber: c.promissoryNoteNum,
     cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
     promissoryNoteValue: c.promissoryNoteValue ? Number(String(c.promissoryNoteValue).replace(/,/g, '')) : null,
     amount: Number(String(c.amount).replace(/,/g, '')) || 0,
     accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
     reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
     description: c.description,
   })).filter((c: any) => c.promissoryNoteNumber && c.amount > 0),
   ],
   guaranteeItems: (values.guarantees || []).map((c: any) => ({
     guaranteeNumber: c.guaranteeNumber || "0",
     cashRef: c.cash ? Number(c.cash.id || c.cash.cashId || c.cash) : null,
     amount: Number(String(c.amount).replace(/,/g, '')) || 0,
     accountingSettingRef: c.op ? Number(c.op.id || c.op.recieptAndPaymentAccountingSettingId) : null,
     reasonRef: c.reason ? Number(c.reason.id || c.reason.RapReasonID) : null,
     description: c.description,
     guaranteeType: c.guaranteeType ? Number(c.guaranteeType) : null,
     baseDocument: c.baseDocument,
    bankRef: c.bank ? Number(c.bank.id || c.bank.bankId) : null,
    accountNumber: c.accountNumber || null,
    notificationDate: c.notificationDate ? moment(toEnglishDigits(c.notificationDate), "jYYYY/jMM/jDD").format('YYYY-MM-DD') : null
   })).filter((c: any) => c.amount > 0)
 };

 try {
 const res = await apiFetch(getUrl("/api/rap/receipt-notifications"), {
 method,
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload),
 });
 if (res.ok) {
 const data = await res.json();
 handleResponse(data, "receiptNotificationId");
 const savedData = data.data || data;
 setOriginalData(savedData);
 
 setValues({
   baseType: savedData.baseType || "بدون مبنا",
   voucherHeaderRef: savedData.voucherHeaderRef || null,
   number: savedData.documentNumber || "",
   date: savedData.documentDate ? moment(savedData.documentDate).format("jYYYY/jMM/jDD") : "",
   partyRef: savedData.partyRef || null,
   party: savedData.party || null,
   receiptType: savedData.receiptType || "تسویه مطالبات",
   baseNumber: savedData.baseNumber || "",
   status: savedData.status || 2,
   description: savedData.description || "",
   cashes: savedData.cashItems?.map((c: any) => ({
     ...c, 
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
   })) || [],
   cheques: savedData.chequeItems?.map((c: any) => ({
     ...c,
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef },
     bank: c.bank ? { ...c.bank, id: c.bank.bankId } : { id: c.bankRef },
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     num: c.chequeNumber,
     endorNum: c.endorsementNumber,
     sayad: c.sayyadNumber,
     due: c.dueDate ? moment(c.dueDate).format("jYYYY/jMM/jDD") : "",
     currency: c.currency,
     desc: c.description || c.desc || "",
   })) || [],
   deposits: savedData.depositItems?.map((c: any) => ({
     ...c,
     account: c.bankAccount ? { ...c.bankAccount, id: c.bankAccount.bankAccountId } : { id: c.bankAccountRef },
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     trackingNum: c.trackingNumber,
   })) || [],
   returnedPaidCheques: savedData.returnedPaidCheques?.map((c: any) => ({
     ...c,
     id: c.receiptReturnedPaidChequeId,
     paymentChequeRef: c.paymentChequeRef,
     chequeObj: c.paymentCheque ? {
       chequeNumber: c.paymentCheque.chequeNumber,
       amount: c.amount,
       transferChequeDate: c.paymentCheque.paymentNotification?.documentDate ? moment(c.paymentCheque.paymentNotification.documentDate).format("jYYYY/jMM/jDD") : '',
       partyName: (c.paymentCheque.paymentNotification?.party as any)?.title || (c.paymentCheque.paymentNotification?.party as any)?.partyName || (c.paymentCheque.paymentNotification?.party?.firstName ? `${c.paymentCheque.paymentNotification.party.firstName} ${c.paymentCheque.paymentNotification.party.lastName || ''}` : ''),
       description: c.description || c.paymentCheque.description,
       id: c.paymentChequeRef,
       opCode: c.paymentCheque.accountingSetting?.code || '',
       opTitle: c.paymentCheque.accountingSetting?.title || '',
       opId: c.paymentCheque.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
       reasonTitle: c.paymentCheque.reason?.Title || c.paymentCheque.reason?.title || '',
       reasonId: c.paymentCheque.reason?.RapReasonID || null,
     } : null,
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef } : null),
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     amount: c.amount,
     description: c.description
   })) || [],
   transfers: savedData.returnedPaymentAssignments?.map((c: any) => ({
     ...c,
     id: c.receiptReturnedPaymentAssignmentId,
     paymentAssignmentRef: c.paymentAssignmentRef,
     transferChequeNum: c.paymentAssignment?.receiptCheque?.chequeNumber || "",
     chequeObj: c.paymentAssignment ? {
       chequeNumber: c.paymentAssignment.receiptCheque?.chequeNumber || "",
       amount: c.amount,
       id: c.paymentAssignmentRef
     } : null,
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : (c.cashRef ? { id: c.cashRef } : null),
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     amount: c.amount,
     transferChequeAmount: c.paymentAssignment?.receiptCheque?.amount || "",
     transferChequeDate: c.paymentAssignment?.receiptCheque?.dueDate ? moment(c.paymentAssignment.receiptCheque.dueDate).format("jYYYY/jMM/jDD") : "",
     description: c.description
   })) || [],
   promissoryNotes: savedData.promissoryNoteItems?.map((c: any) => ({
     ...c,
     id: c.receiptPromissoryNoteId,
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef }, 
     promissoryNoteNum: c.promissoryNoteNumber || "",
     promissoryNoteValue: c.promissoryNoteValue || "",
     amount: c.amount,
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
   })) || [],
   guarantees: savedData.guaranteeItems?.map((c: any) => ({
     ...c,
     id: c.receiptGuaranteeId || c.id,
     cash: c.cash ? { ...c.cash, id: c.cash.cashId } : { id: c.cashRef, title: c.cashRef }, 
     amount: c.amount,
     op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
     reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
     guaranteeNumber: c.guaranteeNumber || c.dynamicDetailedData?.guaranteeNumber || c.promissoryNoteNumber || "",
     baseDocument: c.baseDocument || c.dynamicDetailedData?.baseDocument || "",
     bank: c.bank ? { ...c.bank, id: c.bank.bankId } : (c.bankRef ? { id: c.bankRef, title: c.bankRef } : null),
     accountNumber: c.accountNumber || c.dynamicDetailedData?.accountNumber || "",
     notificationDate: c.notificationDate ? moment(c.notificationDate).format("jYYYY/jMM/jDD") : (c.dynamicDetailedData?.notificationDate ? moment(c.dynamicDetailedData.notificationDate).format("jYYYY/jMM/jDD") : "")
   })) || [],
   refund2s: savedData.returnedPaymentPromissoryNotes?.filter((c: any) => !c.dynamicDetailedData?.isGuarantee).map((c: any) => {
     const pNo = c.paymentPromissoryNote?.promissoryNoteItem?.promissoryNoteNumber || c.paymentPromissoryNote?.promissoryNoteNumber || "";
     return {
       ...c,
       id: c.receiptReturnedPaymentPromissoryNoteId,
       promissoryNoteNum: pNo,
       opTitle: c.accountingSetting?.title || "",
       reasonTitle: c.reason?.Title || c.reason?.title || "",
       promissoryObj: c.paymentPromissoryNote ? {
         promissoryNoteNumber: pNo,
         promissoryNoteNum: pNo,
         amount: c.amount,
         id: c.paymentPromissoryNoteRef
       } : null,
       op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
       reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
     };
   }) || [],
   refund3s: savedData.returnedPaymentPromissoryNotes?.filter((c: any) => c.dynamicDetailedData?.isGuarantee).map((c: any) => {
     return {
       ...c,
       id: c.receiptReturnedPaymentPromissoryNoteId,
       amount: c.amount,
       op: c.accountingSetting ? { ...c.accountingSetting, id: c.accountingSetting.recieptAndPaymentAccountingSettingId } : null,
       reason: c.reason ? { ...c.reason, id: c.reason.RapReasonID ? c.reason.RapReasonID.toString() : c.reason.id } : null,
       guaranteeType: (c.guaranteeType || c.dynamicDetailedData?.guaranteeType || "").toString(),
       guaranteeNumber: c.dynamicDetailedData?.guaranteeNumber || "",
       baseDocument: c.dynamicDetailedData?.baseDocument || "",
       dueDate: c.dynamicDetailedData?.dueDate || "",
      };
    }) || [],
  });

  showToast("اطلاعات با موفقیت ذخیره شد.", "success");
  } else {
 showToast("خطا در ذخیره اطلاعات.", "error");
 console.error("Failed to save", await res.text());
 throw new Error("API_ERROR");
 }
 } catch (e: any) {
 console.error(e);
 if (e.message !== "VALIDATION_FAILED") {
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
 <label className="text-[13px]"><span className="text-red-500 mr-1">*</span>نوع دریافت :</label>
 </div>
 <div className="flex-1 min-w-0">
 <select
 className={`w-full h-[25px] ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-[#f4f7fc] dark:bg-gray-800"}  border px-1 rounded-sm text-[11px] text-center`}
 style={{ borderColor: errors.receiptType ? "red" : "var(--color-gray-200)" }} disabled={isReadonly} value={values.receiptType || "تسویه مطالبات"}
 onChange={(e) =>
 setValues((prev) => ({ 
     ...prev, 
     receiptType: e.target.value, 
     partyRef: null, 
     party: null, 
     cashes: [], 
     cheques: [], 
     deposits: [],
     returnedPaidCheques: [], 
     transfers: [], 
     promissoryNotes: [], 
     refund2s: [], 
     guarantees: []
 }))
 }
 >
 <option value="تسویه مطالبات">تسویه مطالبات</option>
 <option value="تسویه تنخواه">تسویه تنخواه</option>
 <option value="بانک به بانک">بانک به بانک</option>
 <option value="بانک به صندوق">بانک به صندوق</option>
 <option value="صندوق به بانک">صندوق به بانک</option>
 <option value="صندوق به صندوق">صندوق به صندوق</option>
 </select>
 </div>
 </div>

 <div className="flex-1 flex items-center min-w-0 basis-1/2 gap-x-1">
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap" style={{ width: "100px" }}>
 <label className="text-[13px]"><span className="text-red-500 mr-1">*</span>مبنا :</label>
 </div>
 <div className="flex-1 min-w-0">
 <select
 className={`w-full h-[25px] ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-white dark:bg-gray-800"}  border px-1 rounded-sm text-[11px] text-center`}
 style={{ borderColor: errors.baseType ? "red" : "var(--color-gray-300)" }} disabled={isReadonly} value={values.baseType || "بدون مبنا"}
 onChange={(e) => {
 setValues((prev) => ({ 
 ...prev, 
 baseType: e.target.value,
 partyRef: null,
 party: null,
cashes: [],
cheques: [],
deposits: [],
returnedPaidCheques: [],
transfers: [],
promissoryNotes: [],
refund2s: [],
guarantees: []
 }));
 }}
 >
 <option value="بدون مبنا">بدون مبنا</option>
 <option value="سند حسابداری">سند حسابداری</option>
 <option value="دستور دریافت">دستور دریافت</option>
 <option value="دریافت حقوق">دریافت حقوق</option>
 <option value="درخواست تنخواه">درخواست تنخواه</option>
 <option value="فاکتور خرید">فاکتور خرید</option>
 <option value="برگشت از فروش">برگشت از فروش</option>
 <option value="تسویه طرف مقابل">تسویه طرف مقابل</option>
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
 values.baseType === "بدون مبنا" ? (
 <div className="flex w-full items-center gap-x-2 min-w-0 text-[13px] whitespace-nowrap">
 <div className="flex-1 flex items-center min-w-0 basis-1/2 gap-x-1">
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap" style={{ width: "80px" }}>
 <label className="text-[13px]"><span className="text-red-500 mr-1">*</span>شماره :</label>
 </div>
 <div className="flex-1 min-w-0">
 <input
 disabled={isReadonly || isDocumentNoAuto}
 className={`w-full h-[25px] px-2 rounded-sm border ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-white dark:bg-gray-800"}  text-[13px] text-center outline-none`}
 style={{ borderColor: errors.number ? "red" : "var(--color-gray-300)" }}
 value={values.number || ""}
 onChange={(e) => setValues((prev) => ({ ...prev, number: e.target.value }))}
 />
 </div>
 </div>
 <div className="flex-1 flex items-center min-w-0 basis-1/2 gap-x-1">
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap" style={{ width: "100px" }}>
 <label className="text-[13px]"><span className="text-red-500 mr-1">*</span>تاریخ :</label>
 </div>
 <div className="flex-1 min-w-0 [&_input]:!text-[11px]">
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
 </div>
 ) : (
 <div className="flex items-center gap-x-2 w-full text-[13px] whitespace-nowrap min-w-0">
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300" style={{ width: '100px' }}>
 <label className="text-[13px]"><span className="text-red-500 mr-1">*</span>ش مبنا :</label>
 </div>
 <div className={`flex flex-1 items-center rounded-sm overflow-hidden h-[25px] border ${isReadonly ? "bg-gray-50/50 dark:bg-slate-800/50 opacity-50 pointer-events-none" : "bg-[#f4f7fc] dark:bg-gray-800"} `} style={{ borderColor: errors.baseNumber ? "red" : "var(--color-gray-200)" }}>
 <input
 className="flex-1 h-[25px] bg-transparent border-none px-1 text-[13px] outline-none min-w-0 text-center w-full"
 disabled={isReadonly} value={values.baseNumber || ""}
 onChange={(e) =>
 setValues((prev) => ({ ...prev, baseNumber: e.target.value }))
 }
 />
 <div className="w-[20px] flex justify-center items-center text-white transition-colors shrink-0 bg-blue-500 cursor-pointer hover:bg-blue-600 self-stretch h-full">
 <span className="text-lg leading-none">+</span>
 </div>
 </div>
 <div className="shrink-0 flex justify-start px-1.5 text-gray-700 dark:text-gray-300" style={{ width: '60px' }}>
 <label className="text-[13px]"><span className="text-red-500 mr-1">*</span>شماره :</label>
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
 <label className="text-[13px]"><span className="text-red-500 mr-1">*</span>تاریخ :</label>
 </div>
 <div className="w-[110px] min-w-0 [&_input]:!text-[11px]">
                        <DateInput
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
 )
 ),
 },
 {
 name: "partyRef",
        label: (values.receiptType === "تسویه تنخواه" || values.receiptType === "تسویه تنخواه") ? "تنخواه دار" : "طرف مقابل",
        type: "custom" as const,
        required: true,
        customComponent: (
          <div style={{ minWidth: 200, width: "100%", height: "25px", border: errors.partyRef ? "1px solid red" : "none" }}>
            <MultiColumnDropdown
              disabled={isReadonly} value={values.party}
              onChange={(selected: any) => {
                setValues((prev) => ({ 
                  ...prev, 
                  partyRef: selected ? (selected.party?.partyId || selected.partyId || selected.id) : null,
                  party: selected?.party || selected 
                }));
              }}
              listApiUrl={((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.receiptType === 'تسویه تنخواه' || values.receiptType === 2)) ? "/api/rap/petty-cashes?isActive=true" : "/api/common/parties"}
              filterItem={((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.receiptType === 'تسویه تنخواه' || values.receiptType === 2)) ? (item: any) => item.isActive !== false && item.IsActive !== false : undefined}
              displayKey={((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.receiptType === 'تسویه تنخواه' || values.receiptType === 2)) ? "title" : "lastName"}
              renderSelection={(item: any) => {
                if ((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.receiptType === 'تسویه تنخواه' || values.receiptType === 2)) {
                  if (item.pettyCashId || item.title) {
                     return `${item.title || ""} (${item.party?.firstName || ""} ${item.party?.lastName || ""})`.trim();
                  }
                }
                return ((item.firstName || "") + (item.firstName && item.lastName ? " " : "") + (item.lastName || "")).trim() || String(item.lastName || "");
              }}
              columns={((values.baseType === 1 || values.baseType === '1' || values.baseType === 'بدون مبنا') && (values.receiptType === 'تسویه تنخواه' || values.receiptType === 2)) ? [
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
 <div className="flex w-full items-center text-[13px] whitespace-nowrap min-w-0 h-[25px]">
 <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
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
 </label>
 </div>
 ),
 },
 ];

 const renderOpDropDown = (row: any, rowIndex: number, onChange: any, prefix: string, usedEntryType: string = "3", operationType: string = "1") => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`${prefix}-op-${rowIndex}`}
 value={row.op}
 label={null as any}
 displayKey="code"
 onChange={(item: any) => onChange?.(item)}
 listApiUrl={`/api/rap/accounting-setting?operationType=${operationType}&usedEntryType=${usedEntryType}`}
 disabled={isReadonly}
 
 columns={[
 { key: "code", label: "کد", width: 80 },
 { key: "title", label: "عنوان", width: 150 },
 ]}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : (row.op?.code || (typeof row.op === 'string' ? row.op : ""))}
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
 // if account changes, we may want to clear chequebook depending on logic, but basic assignment is handled by onChange
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

 const renderBankDropDown = (row: any, rowIndex: number, onChange: any, prefix: string) => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`${prefix}-bank-${rowIndex}`}
 value={row.bank}
 label={null as any}
 onChange={(item: any) => onChange?.(item)}
 listApiUrl="/api/rap/banks?isActive=true"
 disabled={isReadonly}
 displayKey="title"
 columns={[
 { key: "code", label: "کد", width: 80 },
 { key: "title", label: "عنوان", width: 150 },
 ]}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : (row.bank?.title || row.bank?.Title || (typeof row.bank === 'string' ? row.bank : ""))}
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
 { key: "base", header: "مبنا", type: "text" as const, width: "80px" },
 {
 key: "cash",
 header: "صندوق",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderCashDropDown(row, rowIndex, onChange, "cheque"),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "cheque", "1", "1")
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderReasonDropDown(row, rowIndex, onChange, "cheque"),
 },
 {
 key: "bank",
 header: "نام بانک",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderBankDropDown(row, rowIndex, onChange, "cheque"),
 },
 {
 key: "branchName",
 header: "کد/عنوان شعبه",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.branchName || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "accountNumber",
 header: "شماره حساب",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.accountNumber || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 },
 {
 key: "num",
 header: "شماره چک",
 type: "custom" as const,
 width: "120px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.num || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 )
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
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "cash", "3", "1"),
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
 header: "تاریخ دریافت",
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

 const returnedPaidChequesColumns = [
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
 render: (row: any, rowIndex: number, onChange: any) => renderCashDropDown(row, rowIndex, onChange, "returnedcheque"),
 },
 {
 key: "chequeObj",
 header: "شماره چک قابل استرداد",
 type: "custom" as const,
 width: "200px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`returnedcheque-chequeObj-${rowIndex}`}
 value={row.chequeObj}
 label={null as any}
 onChange={(item: any) => {
 if (item === undefined || item === null) return;
 if (typeof item === 'string') {
 item = { chequeNumber: item };
 }
 setValues((prev: any) => {
 const newReturnedPaidCheques = [...(prev.returnedPaidCheques || [])];
 newReturnedPaidCheques[rowIndex] = {
 ...newReturnedPaidCheques[rowIndex],
 chequeObj: item,
 amount: item?.amount || newReturnedPaidCheques[rowIndex]?.amount,
 op: item?.opId ? { title: item.opTitle || '', id: item.opId, code: item.opCode || '' } : null,
 reason: item?.reasonId ? { title: item.reasonTitle || '', id: item.reasonId } : null,
 };
 return { ...prev, returnedPaidCheques: newReturnedPaidCheques };
 });
 }}
 listApiUrl={values.partyRef ? `/api/rap/receipt-notifications/cheques/paid-to-party?partyRef=${values.partyRef}` : undefined}
 displayKey="chequeNumber"
 columns={[
 { key: "chequeNumber", label: "شماره چک", width: 100 },
 { key: "transferChequeDate", label: "تاریخ چک", width: 100 },
 { key: "amount", label: "مبلغ", width: 100 },
 { key: "opTitle", label: "عملیات حسابداری", width: 150 },
 { key: "reasonTitle", label: "بابت", width: 150 },
 ]}
 disabled={isReadonly || !values.partyRef}
 placeholder={values.partyRef ? "انتخاب..." : "ابتدا طرف مقابل را انتخاب کنید"}
 trigger={(toggle: any, isOpen: any, sq: any, setSq: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-text text-center "
 value={isOpen ? (sq || "") : (row.chequeObj?.chequeNumber || "")}
 onChange={(e) => setSq(e.target.value)}
 onClick={(e) => { e.stopPropagation(); if (values.partyRef) toggle(); }}
 onFocus={(e) => { if(!isOpen && values.partyRef) toggle(); }}
 placeholder={values.partyRef ? "انتخاب..." : "طرف مقابل را مشخص کنید"}
 disabled={!values.partyRef}
 />
 <div 
 className={`text-white w-6 flex flex-col items-center justify-center shrink-0 ${values.partyRef ? 'bg-blue-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
 onClick={(e) => { e.stopPropagation(); if (values.partyRef) toggle(); }}
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
 header: "مبلغ",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-gray-100 dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 text-center"
 value={row.chequeObj?.amount ? Number(row.chequeObj.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : (row.amount ? Number(row.amount.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : "")}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "transferChequeDate",
 header: "تاریخ چک",
 type: "custom" as const,
 width: "120px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-gray-100 dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 text-center"
 value={row.chequeObj?.transferChequeDate || ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-gray-100 dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 text-center"
 value={row.chequeObj?.opCode ? `${row.chequeObj.opCode} - ${row.chequeObj.opTitle}` : (row.chequeObj?.opTitle || (row.op?.code ? `${row.op.code} - ${row.op.title}` : (row.op?.title || row.op?.code || row.op || "")))}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-gray-100 dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 text-center"
 value={row.chequeObj?.reasonTitle || (row.reason?.Title || row.reason?.title || row.reason || "")}
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
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "withdrawal", "5", "1"),
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
 header: "تاریخ دریافت",
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

 const renderTransferChequeDropDown = (row: any, rowIndex: number, onChange: any) => (
 <div className="w-full h-full min-h-[26px]">
 <SingleSelectDropDown
 id={`transfer-chequenum-${rowIndex}`}
 value={row.chequeObj || { chequeNumber: row.transferChequeNum }}
 label={null as any}
 displayKey="chequeNumber"
 listApiUrl={`/api/rap/receipt-notifications/cheques/assigned-to-others${values.partyRef ? `?partyRef=${values.partyRef}` : ''}`}
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
 op: fetchedOp || (item?.opTitle ? { title: item.opTitle, id: item.opId } : null),
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
     // NOTE: This will invoke the `onChange` of the SingleSelectDropDown's rendering context
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
 key: "cash",
 header: "صندوق",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderCashDropDown(row, rowIndex, onChange, "transfer"),
 },
 {
 key: "transferChequeNum",
 header: "شماره چک واگذار شده",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderTransferChequeDropDown(row, rowIndex, onChange),
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
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs bg-gray-100 dark:bg-gray-800">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 text-center"
 value={row.op?.title || ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs bg-gray-100 dark:bg-gray-800">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 text-center"
 value={row.reason?.Title || row.reason?.title || row.reasonTitle || ""}
 readOnly
 />
 </div>
 ),
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
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "promissoryNote", "2", "1"),
	},
	{
	key: "cash",
	header: "صندوق",
	type: "custom" as const,
	width: "150px",
	render: (row: any, rowIndex: number, onChange: any) => renderCashDropDown(row, rowIndex, onChange, "promissoryNote"),
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
    <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
    <input
    className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
    value={row.promissoryNoteNum || ""}
    onChange={(e) => onChange?.(e.target.value.replace(/\D/g, ""))}
    />
    </div>
    ),
    },,
 {
 key: "promissoryNoteValue",
 header: "ارزش سفته",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.promissoryNoteValue ? Number(row.promissoryNoteValue.toString().replace(/[^0-9]/g, '')).toLocaleString('en-US') : ""}
 onChange={(e) => onChange?.(e.target.value.replace(/[^0-9]/g, ''))}
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
  <DateInput
  id={`promissoryNote-dueDate-${rowIndex}`}
  noWrapper={true}
  disabled={isReadonly}
  className="w-full h-full text-center text-xs text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none pl-7"
  value={row.dueDate !== undefined ? row.dueDate : values.date || ""}
  onChange={(val) => onChange?.(val)}
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
 key: "refundableChequeNum",
 header: "شماره چک قابل استرداد",
 type: "custom" as const,
 width: "180px",
 render: (row: any, rowIndex: number) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
 id={`refund1-cheque-${rowIndex}`}
 displayKey="chequeNumber"
 label={null as any}
 enableMultiSelection={true}
 disabled={isReadonly}
 listApiUrl={`/api/rap/receipt-notifications/cheques/paid-to-party${values.partyRef ? `?partyRef=${values.partyRef}` : ''}`}
 columns={[
 { key: "chequeNumber", label: "شماره چک", width: 120 },
 { key: "chequeDate", label: "تاریخ چک", width: 100 },
 { key: "chequeAmount", label: "مبلغ چک", width: 120 },
 { key: "opTitle", label: "عملیات حسابداری", width: 120 },
 { key: "reasonTitle", label: "بابت", width: 120 },
 ]}
 value={row.chequeObj || { chequeNumber: row.refundableChequeNum }}
 onChange={(items: any) => {
 if (!items) return;
 const selectedItems = Array.isArray(items) ? items : [items];
 if (selectedItems.length === 0) return;
 setValues((prev: any) => {
 const newRefund1s = [...(prev.refund1s || [])];
 const firstItem = selectedItems[0];
 newRefund1s[rowIndex] = {
 ...newRefund1s[rowIndex],
 chequeObj: firstItem,
 refundableChequeNum: firstItem.chequeNumber,
 chequeDate: firstItem.chequeDate,
 chequeAmount: firstItem.amount || firstItem.chequeAmount,
 currency: firstItem.currency || "ریال",
 opTitle: firstItem.opTitle,
 op: { title: firstItem.opTitle, id: firstItem.opId },
 reasonTitle: firstItem.reasonTitle,
 reason: { title: firstItem.reasonTitle, id: firstItem.reasonId }
 };

 let insertIdx = rowIndex + 1;
 for (let i = 1; i < selectedItems.length; i++) {
 const item = selectedItems[i];
 const newRow = {
 chequeObj: item,
 refundableChequeNum: item.chequeNumber,
 chequeDate: item.chequeDate,
 chequeAmount: item.amount || item.chequeAmount,
 currency: item.currency || "ریال",
 opTitle: item.opTitle,
 op: { title: item.opTitle, id: item.opId },
 reasonTitle: item.reasonTitle,
 reason: { title: item.reasonTitle, id: item.reasonId }
 };
 if (insertIdx < newRefund1s.length && !newRefund1s[insertIdx].refundableChequeNum) {
 newRefund1s[insertIdx] = { ...newRefund1s[insertIdx], ...newRow };
 } else {
 newRefund1s.splice(insertIdx, 0, newRow);
 }
 insertIdx++;
 }
 return { ...prev, refund1s: newRefund1s };
 });
 }}
 trigger={(toggle: () => void) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center cursor-pointer"
 value={row.refundableChequeNum || ""}
 readOnly
 onClick={(e) => { e.stopPropagation(); toggle(); }}
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
 width: "200px",
 render: (row: any, rowIndex: number) => (
 <div className="w-full h-full min-h-[26px]">
 <MultiColumnDropdown
 id={`refund2-promissory-${rowIndex}`}
 displayKey="promissoryNoteNumber"
 label={null as any}
 enableMultiSelection={true}
 listApiUrl={`/api/rap/receipt-notifications/promissory-notes/paid-to-party${values.partyRef ? `?partyRef=${values.partyRef}` : ''}`}
 columns={[
 { key: "promissoryNoteNumber", label: "شماره سفته", width: 120 },
 { key: "dueDate", label: "تاریخ سفته", width: 100 },
 { key: "promissoryNoteValue", label: "ارزش سفته", width: 120 },
 { key: "opTitle", label: "عملیات حسابداری", width: 120 },
 { key: "reasonTitle", label: "بابت", width: 120 },
 { key: "paymentNotificationNumber", label: "شماره اعلامیه", width: 120 },
 { key: "paymentNotificationDate", label: "تاریخ اعلامیه", width: 120 },
 ]}
 value={row.promissoryObj || { promissoryNoteNumber: row.promissoryNoteNum }}
 onChange={(items: any) => {
 if (!items) return;
 const selectedItems = Array.isArray(items) ? items : [items];
 if (selectedItems.length === 0) return;
 
 setValues((prev: any) => {
 const newRefund2s = [...(prev.refund2s || [])];
 const firstItem = selectedItems[0];
 newRefund2s[rowIndex] = {
 ...newRefund2s[rowIndex],
 promissoryObj: firstItem,
 promissoryNoteNum: firstItem.promissoryNoteNumber,
 dueDate: firstItem.dueDate,
 currency: firstItem.currency || "ریال",
 amount: firstItem.amount,
 opTitle: firstItem.opTitle,
 op: { title: firstItem.opTitle, id: firstItem.opId },
 reasonTitle: firstItem.reasonTitle,
 reason: { title: firstItem.reasonTitle, id: firstItem.reasonId }
 };

 let insertIdx = rowIndex + 1;
 for (let i = 1; i < selectedItems.length; i++) {
 const item = selectedItems[i];
 const newRow = {
 promissoryObj: item,
 promissoryNoteNum: item.promissoryNoteNumber,
 dueDate: item.dueDate,
 currency: item.currency || "ریال",
 amount: item.amount,
 opTitle: item.opTitle,
 op: { title: item.opTitle, id: item.opId },
 reasonTitle: item.reasonTitle,
 reason: { title: item.reasonTitle, id: item.reasonId }
 };
 if (insertIdx < newRefund2s.length && !newRefund2s[insertIdx].promissoryNoteNum) {
 newRefund2s[insertIdx] = { ...newRefund2s[insertIdx], ...newRow };
 } else {
 newRefund2s.splice(insertIdx, 0, newRow);
 }
 insertIdx++;
 }
 return { ...prev, refund2s: newRefund2s };
 });
 }}
 trigger={(toggle: () => void, isOpen: boolean) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs focus-within:ring-1 focus-within:ring-indigo-500">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 block cursor-pointer text-center "
 value={row.promissoryNoteNum || ""}
 readOnly
 onClick={(e) => { e.stopPropagation(); toggle(); }}
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
 key: "op",
 header: "عملیات حسابداری",
 type: "custom" as const,
 width: "150px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.opTitle || row.op?.title || ""}
 readOnly
 />
 </div>
 ),
 },
 {
 key: "reason",
 header: "بابت",
 type: "custom" as const,
 width: "150px",
 render: (row: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 pl-7 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center "
 value={row.reasonTitle || row.reason?.Title || row.reason?.title || ""}
 readOnly
 />
 </div>
 ),
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
 render: (row: any, rowIndex: number, onChange: any) => renderOpDropDown(row, rowIndex, onChange, "guarantee", "8", "1"),
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
 onChange={(e) => {
  const newVal = e.target.value;
  onChange?.(newVal);
  setValues((prev) => {
   const updatedGuarantees = [...(prev.guarantees || [])];
   if (updatedGuarantees[rowIndex]) {
    updatedGuarantees[rowIndex] = {
     ...updatedGuarantees[rowIndex],
     guaranteeType: newVal,
     op: null,
    };
   }
   return { ...prev, guarantees: updatedGuarantees };
  });
 }}
 >
 <option value="" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">انتخاب</option>
 <option value="1" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">چک</option>
 <option value="2" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">سفته</option>
 <option value="3" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800">ضمانت نامه بانکی</option>
 </select>
 </div>
 ),
 },
 ...(firstGuaranteeType === "1" ||
 firstGuaranteeType === "3"
 ? [
 {
 key: "bank",
 header: "نام بانک",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => renderBankDropDown(row, rowIndex, onChange, "guarantee"),
 },
 {
 key: "accountNumber",
 header: "شماره حساب",
 type: "custom" as const,
 width: "150px",
 render: (row: any, rowIndex: number, onChange: any) => (
 <div className="flex items-center relative w-full h-full min-h-[26px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden text-xs">
 <input
 className="flex-1 bg-transparent border-none px-2 outline-none w-full h-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-center"
 value={row.accountNumber || ""}
 onChange={(e) => onChange?.(e.target.value)}
 />
 </div>
 ),
 }
 ]
 : []),
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
 (values.baseType === "بدون مبنا" || values.baseType === 1 || values.baseType === '1' || values.baseNumber) &&
 (isDocumentNoAuto || values.number) &&
 values.date &&
 values.partyRef &&
 values.receiptType &&
 values.status &&
 values.description
 );

 

 const filterCols = (cols: any[]) => cols.filter((col: any) => !((col.key === 'base' || col.key === 'baseDocument') && values.baseType === 'بدون مبنا'));

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
 onChange={(value) =>
 setValues((prev) => ({ ...prev, cheques: value }))
 }
 
 onActiveRowChange={(_, __, rowData) => setActiveRowData(rowData)}
 hideHeader={true}
 
 footerActions={<button type="button" onClick={() => setIsAccModalOpen(true)} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center" title="اطلاعات حسابداری"><BookOpen className="w-4 h-4" /></button>}
 />
 </div>
 ),
 },
 {
 id: "withdrawal",
 label: "اعلامیه واریز",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "deposits",
 label: "اعلامیه واریز",
 columns: filterCols(withdrawalColumns),
 },
 ]}
 value={values.deposits || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, deposits: value }))
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
 label: "برگشت واگذار به غیر",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "transfers",
 label: "برگشت واگذار به غیر",
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
 label: "استرداد چک پرداختنی",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "returnedPaidCheques",
 label: "استرداد چک پرداختنی",
 columns: filterCols(returnedPaidChequesColumns),
 },
 ]}
 value={values.returnedPaidCheques || []}
 onChange={(value) =>
 setValues((prev) => ({ ...prev, returnedPaidCheques: value }))
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
 label: "استرداد سفته پرداختنی",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "refund2",
 label: "استرداد سفته پرداختنی",
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
 label: "استرداد تضمین پرداختی",
 content: (
 <div className="flex flex-col h-full pb-[5px] relative">
 
 <TabCellRow isReadonly={isReadonly || !isHeaderComplete}
 className="flex-1 h-full min-h-0"
 tabs={[
 {
 id: "refund3",
 label: "استرداد تضمین پرداختی",
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
    cash: "receiptTabCash",
    cheque: "receiptTabCheque",
    withdrawal: "receiptTabWithdrawal",
    transfer: "receiptTabTransfer",
    refund1: "receiptTabRefund1",
    promissoryNote: "receiptTabPromissoryNote",
    refund2: "receiptTabRefund2",
    guarantee: "receiptTabGuarantee",
    refund3: "receiptTabRefund3",
  };

  const filteredBottomTabs = React.useMemo(() => {
    if (!isSettingsLoaded) {
      return [];
    }
    return bottomTabs.filter((tab) => {
      const key = tabKeyMap[tab.id];
      return !key || activeTabs[key] !== false;
    });
  }, [bottomTabs, activeTabs, isSettingsLoaded]);

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
 addSum(values.transferCheques);
 addSum(values.refund1s);
 addSum(values.refund2s);
 addSum(values.refund3s);
 return sum;
 }, [values.cashes, values.cheques, values.promissoryNotes, values.transferCheques, values.refund1s, values.refund2s, values.refund3s]);

 const footer = (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 text-[11px] font-medium items-end h-auto">
 {/* Right Column */}
 <div className="flex flex-col gap-1.5">
 <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
 <span className="text-gray-600 dark:text-gray-400">
 عنوان عملیات حسابداری :
 </span>
 <span className="font-bold">{activeRowData?.op?.title || "-"}</span>
 </div>
 <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
 <span className="text-gray-600 dark:text-gray-400">
 عنوان بابت :
 </span>
 <span className="font-bold">{activeRowData?.reason?.Title || activeRowData?.reason?.title || "-"}</span>
 </div>
 </div>

 {/* Middle Column */}
 <div className="flex flex-col gap-1.5">
 <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
 <span className="text-gray-600 dark:text-gray-400">
 شماره سند حسابداری :
 </span>
 <span className="font-bold">{associatedVoucher?.voucherNumber || "-"}</span>
 </div>
 <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
 <span className="text-gray-600 dark:text-gray-400">
 تاریخ سند حسابداری :
 </span>
 <span className="font-bold">{associatedVoucher?.voucherDate ? moment(associatedVoucher.voucherDate).format("jYYYY/jMM/jDD") : "-"}</span>
 </div>
 </div>

 {/* Left Column */}
 <div className="flex flex-col gap-1.5 h-full justify-end w-2/3 mr-auto">
 <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-sm">
 <span className="text-gray-800 dark:text-gray-200 font-bold">
 جمع کل :
 </span>
 <span className="font-bold">{totalAmount > 0 ? totalAmount.toLocaleString('en-US') : "-"}</span>
 </div>
 </div>
 </div>
 );

  const defaultBottomTabId = React.useMemo(() => {
    const activeKeys = filteredBottomTabs.map(t => t.id);
    if (activeKeys.includes("cash") && values.cashes && values.cashes.length > 0) return "cash";
    if (activeKeys.includes("cheque") && values.cheques && values.cheques.length > 0) return "cheque";
    if (activeKeys.includes("withdrawal") && values.deposits && values.deposits.length > 0) return "withdrawal";
    if (activeKeys.includes("transfer") && values.transfers && values.transfers.length > 0) return "transfer";
    if (activeKeys.includes("refund1") && values.returnedPaidCheques && values.returnedPaidCheques.length > 0) return "refund1";
    if (activeKeys.includes("promissoryNote") && values.promissoryNotes && values.promissoryNotes.length > 0) return "promissoryNote";
    if (activeKeys.includes("refund2") && values.refund2s && values.refund2s.length > 0) return "refund2";
    if (activeKeys.includes("guarantee") && values.guarantees && values.guarantees.length > 0) return "guarantee";
    if (activeKeys.includes("refund3") && values.refund3s && values.refund3s.length > 0) return "refund3";
    return activeKeys[0] || "cash";
  }, [filteredBottomTabs, values.cashes, values.cheques, values.deposits, values.transfers, values.returnedPaidCheques, values.promissoryNotes, values.refund2s, values.guarantees, values.refund3s]);



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
              این رسید دریافت دارای سند حسابداری (به شماره {associatedVoucher.voucherNumber || associatedVoucher.referenceNumber}) می‌باشد و غیرقابل ویرایش است. برای ویرایش، ابتدا سند حسابداری را حذف نمایید.
            </div>
          ) : null
        }
        title={isUpdate ? "ویرایش رسید دریافت" : "رسید دریافت جدید"}
        icon={<CreditCard className="w-5 h-5" />}
        fields={fields}
        values={values}
        errors={errors}
        showListButton={true}
        listApiUrl="/api/rap/receipt-notifications"
        listColumns={listColumns} /* 
          { key: "receiptNotificationId", label: "کد", width: 80 },
          { key: "documentNumber", label: "شماره", width: 120 },
          { key: "receiptType", label: "نوع دریافت", width: 150 },
        */ 
        listDisplayKey="documentNumber"
        onListSelect={(item: any) => {
          const itemId = item.receiptNotificationId || item.id;
          if (activeId !== itemId) {
            if (!activeId) {
               setActiveId(itemId);
               return;
            }
            if (addTab) {
              addTab(
                `ویرایش رسید (${item.documentNumber || ''})`,
                'rap',
                <List className="w-4 h-4" />,
                "ReceiptNotificationForm",
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
    setValues((prev) => ({ ...prev, date: moment().locale('en').format("jYYYY/jMM/jDD") }));
    setActiveId(undefined);
    setRefreshNumberingTrigger(prev => prev + 1);
  }}
 onSaveClose={async () => {
 await handleSave();
 removeTab(activeTabId || `ReceiptNotificationForm-${activeId || 'new'}`);
 }}
 onDelete={activeId ? async () => {
 try {
 const res = await apiFetch(`/api/rap/receipt-notifications/${activeId}`, { method: "DELETE" });
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
    setValues((prev) => ({ ...prev, date: moment().locale('en').format("jYYYY/jMM/jDD") }));
    setActiveId(undefined);
    setRefreshNumberingTrigger(prev => prev + 1);
  }}
 bottomTabs={filteredBottomTabs}
 tabResetTrigger={activeId}
 defaultBottomTabId={defaultBottomTabId}
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
        targetForm="Rap.ReceiptNotification"
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
            showToast("در حال تولید خروجی قالب ReceiptNotificationA4...", "info");
            addTab(
              `چاپ پیش‌نمایش`,
              `general_group`,
              undefined,
              'ReportViewer',
              { reportId: 'ReceiptNotificationA4', recordId: activeId?.toString(), isFileReport: true }
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
 
      <DocumentAccountingInfoModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} documentType="ReceiptNotification" documentRef={activeId ? Number(activeId) : null} party={values.party} activeRowData={activeRowData || (values.cashes && values.cashes.length > 0 ? values.cashes[0] : null)} />
</>
 );
}
