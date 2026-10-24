"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch, toEnglishDigits } from '@/lib/utils';
import { 
  TextInput, 
  DateInput, 
  Select, 
  NumberInput, 
  AmountInput,
  TextArea,
  CurrencyDropDown
} from '@/components/inputs';
import { StateListInput, DocumentState } from '@/components/inputs/StateListInput';
import { SaveButton } from '@/components/buttons/SaveButton';
import { DeleteButton } from '@/components/buttons/DeleteButton';
import { DeleteAndNewButton } from '@/components/buttons/DeleteAndNewButton';
import { NewButton } from '@/components/buttons/NewButton';
import { ListButton } from '@/components/buttons/ListButton';
import { SaveNewButton } from '@/components/buttons/SaveNewButton';
import { SaveCloseButton } from '@/components/buttons/SaveCloseButton';
import { HelpButton } from '@/components/buttons/HelpButton';
import { FullscreenButton } from '@/components/buttons/FullscreenButton';
import { CloseButton } from '@/components/buttons/CloseButton';
import { PdfExportButton } from '@/components/MainDataGridButtons/PdfExportButton';
import { WordExportButton } from '@/components/MainDataGridButtons/WordExportButton';
import { PrintDropdownButton } from '@/components/buttons/PrintDropdownButton';
import { RecordNavigator } from '@/components/forms/RecordNavigator';
import { ReportViewer } from '@/components/forms/common/ReportViewer';
import { useTabs } from '@/components/TabsProvider';
import { useLanguage, useAuth } from '@/components/Providers';
import { useToast } from '@/components/ToastProvider';
import { Printer, Trash, Plus, FileSpreadsheet, Paperclip, ChevronDown, Save, HelpCircle, FileText, Share2, MoreHorizontal, Lock, AlertTriangle } from 'lucide-react';
import { useFiscalYearCheck } from '@/hooks/useFiscalYearCheck';
import { SlAccountDropDown } from '@/components/ui/SlAccountDropDown';
import { FiscalYearWarningBanner } from '@/components/ui/FiscalYearWarningBanner';
import { VoucherTypesDropDown } from '@/components/ui/VoucherTypesDropDown';
import { MultiColumnDropdown } from '@/components/inputs/MultiColumnDropdown';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { clsx } from 'clsx';
import { useFormUpsert } from '@/hooks/useFormUpsert';
import { useFormUsageCheck } from '@/hooks/useFormUsageCheck';
import { useDraftStore } from '@/lib/stores/draftStore';
import { useVoucherStore } from '@/lib/stores/voucherStore';
import { useSearchParams } from 'next/navigation';
import moment from 'moment-jalaali';
import { eventBus, EVENTS } from '@/lib/events';

const formatNumberWithCommas = (value: string | number) => {
  if (value === undefined || value === null || value === '') return '';
  const clean = String(value).replace(/,/g, '');
  const parts = clean.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export default function Voucher({ initialData, id, isExistingItemsReadOnly }: { initialData?: any; id?: any; isExistingItemsReadOnly?: boolean }) {
  const { direction } = useLanguage();
  const { currentUser } = useAuth();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();
  const { activeId, isUpdate, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id || initialData?.voucherId);
  const { isUsed } = useFormUsageCheck("Voucher", activeId);
  const searchParams = useSearchParams();

  const draftId = activeId || id || initialData?.voucherId ? `voucher-${activeId || id || initialData?.voucherId}` : 'voucher-new';
  const { drafts, setDraft, clearDraft } = useDraftStore();
  const draft = drafts[draftId];

  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');

  const {
    fetchedData, setFetchedData,
    detailedLevelsCount, setDetailedLevelsCount,
    showTrackingColumnsInVoucher, setShowTrackingColumnsInVoucher,
    requireTrackingInfoIfEnabled, setRequireTrackingInfoIfEnabled,
    showCurrencyColumnsInVoucher, setShowCurrencyColumnsInVoucher,
    colWidths, setColWidths,
    header, setHeader,
    fiscalYearDetails, setFiscalYearDetails,
    voucherDateError, setVoucherDateError,
    voucherStatus, setVoucherStatus,
    isSaving, setIsSaving,
    isVoucherNoAuto, setIsVoucherNoAuto,
    isReferenceNoAuto, setIsReferenceNoAuto,
    isDeleteModalOpen, setIsDeleteModalOpen,
    deleteActionType, setDeleteActionType,
    hasSaved, setHasSaved,
    items, setItems,
    selectedRowIndex, setSelectedRowIndex,
    focusedCell, setFocusedCell,
    footer, setFooter
  } = useVoucherStore();
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(true);
  const isApproved = Number(voucherStatus) === DocumentState.Finalized || isFormDisabledDueToFiscalYear;
  const [refreshNumberingTrigger, setRefreshNumberingTrigger] = useState(0);
  const [sourceDocDate, setSourceDocDate] = useState<string | null>(null);

  useEffect(() => {
    if (draft?.items && !id && !initialData?.voucherId && !activeId) {
      setItems(draft.items);
    } else if (!items || items.length === 0) {
      setItems([
        { id: 1, row: 1, ledgerCode: null, details: {}, description: '', debit: '', credit: '', trackingNum: '', trackingDate: '', taxStatus: '', baseCurrency: null, currencyAmount: '', exchangeRate: '' },
        { id: 2, row: 2, ledgerCode: null, details: {}, description: '', debit: '', credit: '', trackingNum: '', trackingDate: '', taxStatus: '', baseCurrency: null, currencyAmount: '', exchangeRate: '' }
      ]);
    }
    
    // AI Data handling
    const aiDataEncoded = searchParams.get('ai_data');
    if (aiDataEncoded && !activeId && !id) {
       try {
          const aiData = JSON.parse(decodeURIComponent(aiDataEncoded));
          
          setVoucherStatus(aiData.voucherStatus ? String(aiData.voucherStatus) : '1');

          if (aiData.description) {
             setHeader((prev: any) => ({ ...prev, description: aiData.description, descriptionInTab: !!aiData.description }));
          }
          if (aiData.voucherType) {
             setHeader((prev: any) => ({ ...prev, voucherType: aiData.voucherType }));
          }

          // Use the provided date or fallback to today
          const dDate = aiData.voucherDate ? aiData.voucherDate : moment().locale('en').format('jYYYY/jMM/jDD');
          setHeader((prev: any) => ({ ...prev, voucherDate: dDate }));

          if (aiData.items && Array.isArray(aiData.items) && aiData.items.length > 0) {
             const newItems = aiData.items.map((it: any, index: number) => ({
                 id: index + 1,
                 row: index + 1,
                 ledgerCode: it.ledgerCode || null,
                 detailsObjects: it.detailsObjects || {},
                 details: it.details || {},
                 description: it.description || '',
                 debit: it.debit || it.debtor || '',
                 credit: it.credit || it.creditor || '',
                 trackingNum: '',
                 trackingDate: '',
                 taxStatus: '',
                 baseCurrency: null,
                 currencyAmount: '',
                 exchangeRate: ''
             }));
             // Ensure at least 2 rows
             while (newItems.length < 2) {
                 newItems.push({
                   id: newItems.length + 1,
                   row: newItems.length + 1,
                   ledgerCode: null,
                   detailsObjects: {},
                   details: {},
                   description: '',
                   debit: '',
                   credit: '',
                   trackingNum: '',
                   trackingDate: '',
                   taxStatus: '',
                   baseCurrency: null,
                   currencyAmount: '',
                   exchangeRate: ''
                 });
             }
             setItems(newItems);
          }
       } catch (e) {
          console.error("Failed to parse AI data", e);
       }
    }
  }, [id, initialData, activeId, searchParams]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedFiscalYear(localStorage.getItem('app-fiscal-year') || '');
    }
    const handleStorage = () => {
      setSelectedFiscalYear(localStorage.getItem('app-fiscal-year') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const voucherDropdownColumns = [
    { key: 'voucherNumber', label: 'شماره سند', width: 90, sortable: true },
    { key: 'voucherDate', label: 'تاریخ سند', width: 100, sortable: true },
    { key: 'description', label: 'شرح', width: 220, sortable: true },
    { key: 'totalDebit', label: 'جمع بدهکار', width: 110, sortable: true, renderItem: (item: any) => formatNumberWithCommas(item.totalDebit) },
    { key: 'totalCredit', label: 'جمع بستانکار', width: 110, sortable: true, renderItem: (item: any) => formatNumberWithCommas(item.totalCredit) },
    { key: 'status', label: 'وضعیت', width: 90, sortable: true }
  ];

  useEffect(() => {
    const finalId = activeId || id || initialData?.voucherId;
    if (finalId) {
      apiFetch(`/api/accounting/vouchers/${finalId}`)
        .then(res => res.json())
        .then(data => {
          setFetchedData(data?.data || data);
        })
        .catch(console.error);
    } else {
      setFetchedData(null);
      if (initialData && initialData.isNewFromOtherForm) {
        // Handled by initialization effect
      } else {
        setHeader({
          voucherNumber: '',
          voucherDate: moment().locale('en').format('jYYYY/jMM/jDD'),
          description: '',
          dailyNumber: '',
          voucherType: null,
          voucherNature: 'عادی',
          description2: '',
          subNumber: '',
          creatorName: '',
        });
        setItems([
          { id: 1, row: 1, ledgerCode: null, details: {}, description: '', debit: '', credit: '', trackingNum: '', trackingDate: '', taxStatus: '', baseCurrency: null, currencyAmount: '', exchangeRate: '' },
          { id: 2, row: 2, ledgerCode: null, details: {}, description: '', debit: '', credit: '', trackingNum: '', trackingDate: '', taxStatus: '', baseCurrency: null, currencyAmount: '', exchangeRate: '' }
        ]);
      }
    }
  }, [activeId, id, initialData?.voucherId, initialData, setFetchedData, setHeader, setItems]);



  useEffect(() => {
    if (selectedFiscalYear) {
      apiFetch(`/api/common/fiscalyear/${selectedFiscalYear}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch fiscal year details');
        })
        .then(data => {
          const detail = data?.data || data;
          if (detail && detail.startDate && detail.endDate) {
            setFiscalYearDetails({
              id: selectedFiscalYear,
              startDate: detail.startDate,
              endDate: detail.endDate,
              title: detail.title || ''
            });
          } else {
            setFiscalYearDetails(null);
          }
        })
        .catch(err => {
          console.error(err);
          setFiscalYearDetails(null);
        });
    } else {
      setFiscalYearDetails(null);
    }
  }, [selectedFiscalYear]);

  useEffect(() => {
    if (!header.voucherDate) {
      setVoucherDateError('ورود تاریخ سند الزامی است.');
      return;
    }

    if (header.voucherDate.length < 10) {
      setVoucherDateError('تاریخ وارد شده ناقص یا نامعتبر است.');
      return;
    }

    const voucherMoment = moment(toEnglishDigits(header.voucherDate || ''), 'jYYYY/jMM/jDD', true);
    if (!voucherMoment.isValid()) {
      setVoucherDateError('تاریخ وارد شده نامعتبر است.');
      return;
    }

    if (sourceDocDate) {
      const sourceMoment = moment(toEnglishDigits(sourceDocDate || ''), 'jYYYY/jMM/jDD', true);
      if (sourceMoment.isValid() && voucherMoment.isBefore(sourceMoment, 'day')) {
        setVoucherDateError(`تاریخ سند نمی‌تواند کوچکتر از تاریخ مدرک مبنا (${sourceDocDate}) باشد.`);
        return;
      }
    }

    if (fiscalYearDetails) {
      const startMoment = moment(fiscalYearDetails.startDate).startOf('day');
      const endMoment = moment(fiscalYearDetails.endDate).endOf('day');

      if (startMoment.isValid() && endMoment.isValid()) {
        const isBefore = voucherMoment.isBefore(startMoment, 'day');
        const isAfter = voucherMoment.isAfter(endMoment, 'day');

        if (isBefore || isAfter) {
          const startJalali = moment(fiscalYearDetails.startDate).format('jYYYY/jMM/jDD');
          const endJalali = moment(fiscalYearDetails.endDate).format('jYYYY/jMM/jDD');
          setVoucherDateError(`تاریخ سند خارج از محدوده سال مالی است (بازه مجاز: از ${startJalali} تا ${endJalali})`);
        } else {
          setVoucherDateError('');
        }
      } else {
        setVoucherDateError('');
      }
    } else {
      setVoucherDateError('');
    }
  }, [header.voucherDate, fiscalYearDetails, sourceDocDate]);



  useEffect(() => {
    if (isSaving || hasSaved) return;
    setDraft(draftId, { header, items });
  }, [header, items, draftId, isSaving, hasSaved, setDraft]);



  const handleResetForm = () => {
    setActiveId(null);
    setFetchedData(null);
    setSourceDocDate(null);
    const defaultDate = moment().locale('en').format('jYYYY/jMM/jDD');
    setHeader({
      voucherNumber: '',
      voucherDate: defaultDate,
      description: '',
      dailyNumber: '',
      voucherType: null,
      voucherNature: 'عادی',
      description2: '',
      subNumber: '',
      referenceNumber: '',
      creatorName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username || '',
    });
    setVoucherStatus('');
    setItems([
      { id: 1, row: 1, ledgerCode: null, details: {}, description: '', debit: '', credit: '', trackingNum: '', trackingDate: '', taxStatus: '', baseCurrency: null, currencyAmount: '', exchangeRate: '' },
      { id: 2, row: 2, ledgerCode: null, details: {}, description: '', debit: '', credit: '', trackingNum: '', trackingDate: '', taxStatus: '', baseCurrency: null, currencyAmount: '', exchangeRate: '' }
    ]);
    setRefreshNumberingTrigger((prev: any) => prev + 1);
  };

  const handleDeleteConfirm = async () => {
    const finalId = activeId || id || initialData?.voucherId;
    if (!finalId) return;
    try {
      setIsSaving(true);
      const url = `/api/accounting/vouchers/${finalId}`;
      const res = await apiFetch(url, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('سند با موفقیت حذف شد.', 'success');
        clearDraft(draftId);
        eventBus.emit(EVENTS.DATA_CHANGED);
        if (deleteActionType === 'delete_and_new') {
          handleResetForm();
        } else {
          // Delete and Close
          if (activeTabId) {
             removeTab(activeTabId);
          } else {
             handleResetForm(); // Fallback
          }
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.message || 'خطا در حذف سند', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsSaving(false);
      setIsDeleteModalOpen(false);
      setDeleteActionType(null);
    }
  };

  const getRelatedDetailedTypes = (ledgerCode: any, level: number): any[] => {
    if (!ledgerCode || !ledgerCode.relatedDetailedAccounts) return [];
    const rels = ledgerCode.relatedDetailedAccounts.filter((r: any) => Number(r.detailedLevel) === level);
    return rels.map((r: any) => r.detailedType).filter(Boolean);
  };

  const getRelatedDetailedType = (ledgerCode: any, level: number) => {
    const list = getRelatedDetailedTypes(ledgerCode, level);
    return list.length > 0 ? list[0] : null;
  };

  const refocusElement = (elem: HTMLElement | null) => {
    if (!elem) return;

    const container = document.getElementById('voucher-items-container');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();

      // Smoothly scroll the element into view centered horizontally and vertically
      const elemCenterX = elemRect.left + elemRect.width / 2;
      const elemCenterY = elemRect.top + elemRect.height / 2;
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const containerCenterY = containerRect.top + containerRect.height / 2;

      const horizontalDelta = elemCenterX - containerCenterX;
      const verticalDelta = elemCenterY - containerCenterY;

      container.scrollTo({
        left: container.scrollLeft + horizontalDelta,
        top: container.scrollTop + verticalDelta,
        behavior: 'smooth'
      });
    } else {
      elem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }

    // Focus the target element with preventScroll to avoid browser jump hijacking smooth scrolling
    setTimeout(() => {
      elem.focus({ preventScroll: true });
    }, 100);
  };

  const getColWidth = (key: string, defaultWidth: number) => colWidths[key] || defaultWidth;

  const renderResizer = (colKey: string, defaultWidth: number) => (
    <div
      onMouseDown={(e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = colWidths[colKey] || defaultWidth;

        const handleMouseMove = (mv: MouseEvent) => {
          const delta = direction === 'rtl' ? startX - mv.clientX : mv.clientX - startX;
          setColWidths((prev: any) => ({
            ...prev,
            [colKey]: Math.max(30, startWidth + delta)
          }));
        };
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = '';
        };
        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
      className={`absolute top-0 bottom-0 w-[5px] cursor-col-resize hover:bg-blue-300 z-20 ${direction === 'rtl' ? 'left-0' : 'right-0'}`}
    />
  );

  useEffect(() => {
    const fetchInitialContext = async () => {
      try {
        const typesRes = await apiFetch(`/api/accounting/voucher-types`);
        let generalType = null;
        if (typesRes.ok) {
          const typesData = await typesRes.json();
          let arr = typesData.data || typesData;
          if (!Array.isArray(arr)) arr = [];
          generalType = arr.find((t: any) => t.title === 'عمومی');
        }

        if (!(id || initialData?.voucherId)) {
          setHeader((prev: any) => ({ ...prev, voucherType: prev.voucherType || generalType || null }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitialContext();
  }, [id, initialData?.voucherId]);

  const currentData = fetchedData || initialData;

  useEffect(() => {
    if (currentData && (currentData.voucherId || currentData.isNewFromOtherForm)) {
      if (currentData.sourceDocDate) {
        if (currentData.isNewFromOtherForm || currentData.sourceDocDate.includes('/')) {
          setSourceDocDate(currentData.sourceDocDate);
        } else {
          setSourceDocDate(moment(currentData.sourceDocDate).locale('en').format('jYYYY/jMM/jDD'));
        }
      } else if (currentData.voucherDate) {
        const jalaliDate = moment(currentData.voucherDate).locale('en').format('jYYYY/jMM/jDD');
        setSourceDocDate(jalaliDate);
      }
      setHeader((prev: any) => ({
        ...prev,
        voucherNumber: currentData.voucherNumber || prev.voucherNumber,
        voucherDate: (currentData.voucherDate ? moment(currentData.voucherDate).locale('en').format('jYYYY/jMM/jDD') : null) || moment().locale('en').format('jYYYY/jMM/jDD'),
        description: currentData.description || prev.description,
        dailyNumber: currentData.dailyNumber || prev.dailyNumber,
        voucherType: currentData.voucherType || (currentData.voucherTypeId && currentData.voucherTypeTitle ? { voucherTypeId: currentData.voucherTypeId, title: currentData.voucherTypeTitle } : null) || prev.voucherType,
        voucherNature: currentData.voucherNature || 'عادی',
        description2: currentData.description2 || prev.description2,
        subNumber: currentData.subNumber || prev.subNumber,
        referenceNumber: currentData.referenceNumber || prev.referenceNumber,
        creatorName: currentData.creatorName || prev.creatorName,
      }));
      if (currentData.status !== undefined) {
        setVoucherStatus(currentData.status);
      }
      
      if (currentData.items && currentData.items.length > 0) {
        setItems(currentData.items.map((item: any, idx: number) => ({
          id: item.voucherItemId || Date.now() + idx,
          voucherItemId: item.voucherItemId,
          row: item.rowNumber || idx + 1,
          ledgerCode: item.account || item.ledgerCode,
          isSystemGenerated: isExistingItemsReadOnly ? true : (item.isSystemGenerated || false),
          detailsObjects: {
            detail1: item.detailedAccount1 || item.detailsObjects?.detail1 || null,
            detail2: item.detailedAccount2 || item.detailsObjects?.detail2 || null,
            detail3: item.detailedAccount3 || item.detailsObjects?.detail3 || null,
            detail4: item.detailedAccount4 || item.detailsObjects?.detail4 || null,
            detail5: item.detailedAccount5 || item.detailsObjects?.detail5 || null,
            detail6: item.detailedAccount6 || item.detailsObjects?.detail6 || null,
            detail7: item.detailedAccount7 || item.detailsObjects?.detail7 || null,
            detail8: item.detailedAccount8 || item.detailsObjects?.detail8 || null,
            detail9: item.detailedAccount9 || item.detailsObjects?.detail9 || null,
            detail10: item.detailedAccount10 || item.detailsObjects?.detail10 || null,
          },
          details: {
            'detail1': item.detailedAccount1?.title || item.details?.detail1 || item.details?.['detail-1'] || '',
            'detail2': item.detailedAccount2?.title || item.details?.detail2 || item.details?.['detail-2'] || '',
            'detail3': item.detailedAccount3?.title || item.details?.detail3 || item.details?.['detail-3'] || '',
            'detail4': item.detailedAccount4?.title || item.details?.detail4 || item.details?.['detail-4'] || '',
            'detail5': item.detailedAccount5?.title || item.details?.detail5 || item.details?.['detail-5'] || '',
            'detail6': item.detailedAccount6?.title || item.details?.detail6 || item.details?.['detail-6'] || '',
            'detail7': item.detailedAccount7?.title || item.details?.detail7 || item.details?.['detail-7'] || '',
            'detail8': item.detailedAccount8?.title || item.details?.detail8 || item.details?.['detail-8'] || '',
            'detail9': item.detailedAccount9?.title || item.details?.detail9 || item.details?.['detail-9'] || '',
            'detail10': item.detailedAccount10?.title || item.details?.detail10 || item.details?.['detail-10'] || '',
          },
          description: item.description || '',
          debit: item.debit || '',
          credit: item.credit || '',
          trackingNum: item.trackingNumber || '',
          trackingDate: item.trackingDate ? item.trackingDate.split('T')[0] : '',
          taxStatus: '',
          baseCurrency: item.currency,
          currencyAmount: item.currencyAmount || '',
          exchangeRate: item.exchangeRate || ''
        })));
      }
    }
  }, [currentData?.voucherId, currentData?.isNewFromOtherForm, initialData]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch(`/api/common/base-settings/tab/2`);
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
             if (result.data.detailedLevelsCount !== undefined) {
               setDetailedLevelsCount(parseInt(result.data.detailedLevelsCount, 10));
             } else {
               setDetailedLevelsCount(10);
             }
             if (result.data.showTrackingColumnsInVoucher !== undefined) {
               setShowTrackingColumnsInVoucher(result.data.showTrackingColumnsInVoucher === 'true');
             }
             if (result.data.requireTrackingInfoIfEnabled !== undefined) {
               setRequireTrackingInfoIfEnabled(result.data.requireTrackingInfoIfEnabled === 'true');
             }
             if (result.data.showCurrencyColumnsInVoucher !== undefined) {
               setShowCurrencyColumnsInVoucher(result.data.showCurrencyColumnsInVoucher === 'true');
             }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchNextNumbersAndConfigs = async () => {
      if (!header.voucherDate) return;
      try {
        const res = await apiFetch(`/api/accounting/vouchers/next-numbers?date=${header.voucherDate}`);
        if (res.ok) {
          const result = await res.json();
          setIsVoucherNoAuto(!!result.isVoucherNumberAuto);
          setIsReferenceNoAuto(!!result.isReferenceNumberAuto);

          const isUpdateMode = !!(activeId);
          if (!isUpdateMode) {
            setHeader((prev: any) => ({
              ...prev,
              voucherNumber: result.voucherNumber || '',
              referenceNumber: result.referenceNumber || '',
            }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch next sequence numbers:', e);
      }
    };
    fetchNextNumbersAndConfigs();
  }, [header.voucherDate, id, initialData?.voucherId, fetchedData?.voucherId, activeId, refreshNumberingTrigger]);

  const handleSaveAction = async (actionStatus?: number, postAction?: 'new' | 'close') => {
    const finalStatus = (actionStatus ?? Number(voucherStatus)) || DocumentState.InitialRegistration;

    // 1. Mandatory Header fields
    if (!header.voucherNumber || !header.voucherDate || !header.voucherType || !header.referenceNumber || !header.description) {
      showToast('لطفا تمامی فیلدهای اجباری هدر سند (ستاره‌دار) را وارد کنید.', 'error');
      return;
    }

    if (voucherDateError) {
      showToast(voucherDateError, 'error');
      return;
    }

    const filteredItems = items.filter(item => item.ledgerCode || item.description || item.debit || item.credit);
    if (filteredItems.length === 0 && finalStatus !== DocumentState.Note) {
      showToast('سند باید حداقل شامل یک ردیف باشد.', 'error');
      return;
    }

    // 2. Validate Items
    if (finalStatus !== DocumentState.Note) {
      for (const item of filteredItems) {
        if (!item.ledgerCode) {
          showToast(`لطفا کد حساب معین را برای ردیف ${item.row} انتخاب کنید.`, 'error');
          return;
        }

        for (let level = 1; level <= detailedLevelsCount; level++) {
           const rel = getRelatedDetailedType(item.ledgerCode, level);
           if (rel) {
             if (!item.detailsObjects || !item.detailsObjects[`detail${level}`]) {
               showToast(`ورود تفصیلی ${level} برای ردیف ${item.row} اجباری است.`, 'error');
               return;
             }
           }
        }

        if (!item.description || item.description.trim() === '') {
          showToast(`لطفا شرح را برای ردیف ${item.row} وارد کنید.`, 'error');
          return;
        }

        const d = Number(item.debit) || 0;
        const c = Number(item.credit) || 0;
        if (d === 0 && c === 0) {
          showToast(`مبلغ بدهکار یا بستانکار در ردیف ${item.row} باید وارد شود.`, 'error');
          return;
        }

        if (showCurrencyColumnsInVoucher) {
          if (!item.baseCurrency) {
            showToast(`لطفا ارز پایه را برای ردیف ${item.row} انتخاب کنید.`, 'error');
            return;
          }
        }

        // Check Tracking Info if required
        if (showTrackingColumnsInVoucher && requireTrackingInfoIfEnabled) {
          const ledger = item.ledgerCode;
          if (ledger.trackingFeature || ledger.trackingNumber || ledger.trackingDate) {
            if (!item.trackingNum || !item.trackingDate) {
               showToast(`ورود اطلاعات پیگیری (تاریخ و شماره پیگیری) برای ردیف ${item.row} با معین ${ledger.code} اجباری است.`, 'error');
               return;
            }
          }
        }
      }
    }

    // 3. Balance validation
    const totalDebitCalc = filteredItems.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalCreditCalc = filteredItems.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    
    if (finalStatus !== DocumentState.Note && totalDebitCalc !== totalCreditCalc) {
      showToast('سند حسابداری تراز نیست. جمع بدهکار و بستانکار باید برابر باشد.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        voucherNumber: Number(header.voucherNumber) || 0,
        voucherDate: header.voucherDate || moment().locale('en').format('jYYYY/jMM/jDD'),
        sourceDocDate: sourceDocDate ? moment(toEnglishDigits(sourceDocDate), 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD') : undefined,
        description: header.description,
        voucherTypeId: Number(header.voucherType?.voucherTypeId || header.voucherType?.id || 1),
        status: finalStatus,
        referenceNumber: header.referenceNumber || '',
        subNumber: header.subNumber || '',
        voucherNature: header.voucherNature || 'عادی',
        description2: header.description2 || '',
        dailyNumber: header.dailyNumber ? Number(header.dailyNumber) : undefined,
        items: filteredItems.map(item => ({
          voucherItemId: item.voucherItemId ? Number(item.voucherItemId) : undefined,
          rowNumber: Number(item.row),
          accountId: Number(item.ledgerCode?.accountId || item.ledgerCode?.id || 1),
          detailedAccountId1: (item.detailsObjects?.detail1?.id || item.detailsObjects?.detail1?.detailedAccountId) ? Number(item.detailsObjects?.detail1?.id || item.detailsObjects?.detail1?.detailedAccountId) : undefined,
          detailedAccountId2: (item.detailsObjects?.detail2?.id || item.detailsObjects?.detail2?.detailedAccountId) ? Number(item.detailsObjects?.detail2?.id || item.detailsObjects?.detail2?.detailedAccountId) : undefined,
          detailedAccountId3: (item.detailsObjects?.detail3?.id || item.detailsObjects?.detail3?.detailedAccountId) ? Number(item.detailsObjects?.detail3?.id || item.detailsObjects?.detail3?.detailedAccountId) : undefined,
          detailedAccountId4: (item.detailsObjects?.detail4?.id || item.detailsObjects?.detail4?.detailedAccountId) ? Number(item.detailsObjects?.detail4?.id || item.detailsObjects?.detail4?.detailedAccountId) : undefined,
          detailedAccountId5: (item.detailsObjects?.detail5?.id || item.detailsObjects?.detail5?.detailedAccountId) ? Number(item.detailsObjects?.detail5?.id || item.detailsObjects?.detail5?.detailedAccountId) : undefined,
          detailedAccountId6: (item.detailsObjects?.detail6?.id || item.detailsObjects?.detail6?.detailedAccountId) ? Number(item.detailsObjects?.detail6?.id || item.detailsObjects?.detail6?.detailedAccountId) : undefined,
          detailedAccountId7: (item.detailsObjects?.detail7?.id || item.detailsObjects?.detail7?.detailedAccountId) ? Number(item.detailsObjects?.detail7?.id || item.detailsObjects?.detail7?.detailedAccountId) : undefined,
          detailedAccountId8: (item.detailsObjects?.detail8?.id || item.detailsObjects?.detail8?.detailedAccountId) ? Number(item.detailsObjects?.detail8?.id || item.detailsObjects?.detail8?.detailedAccountId) : undefined,
          detailedAccountId9: (item.detailsObjects?.detail9?.id || item.detailsObjects?.detail9?.detailedAccountId) ? Number(item.detailsObjects?.detail9?.id || item.detailsObjects?.detail9?.detailedAccountId) : undefined,
          detailedAccountId10: (item.detailsObjects?.detail10?.id || item.detailsObjects?.detail10?.detailedAccountId) ? Number(item.detailsObjects?.detail10?.id || item.detailsObjects?.detail10?.detailedAccountId) : undefined,
          debit: Number(item.debit) || 0,
          credit: Number(item.credit) || 0,
          description: item.description,
          trackingNumber: item.trackingNum,
          trackingDate: item.trackingDate ? new Date(item.trackingDate) : undefined,
          currencyId: item.baseCurrency?.id ? Number(item.baseCurrency.id) : undefined,
          currencyAmount: item.currencyAmount ? Number(item.currencyAmount) : undefined,
          exchangeRate: item.exchangeRate ? Number(item.exchangeRate) : undefined,
          isSystemGenerated: item.isSystemGenerated || false,
        }))
      };

      const url = getUrl('/api/accounting/vouchers');
      const fetchMethod = isUpdate ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method: fetchMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const responseData = await res.json();
        const savedData = responseData?.data || responseData;
        setFetchedData(savedData);
        handleResponse(responseData, 'voucherId');
        setVoucherStatus(finalStatus);
        showToast('سند با موفقیت ذخیره شد.', 'success');
        setHasSaved(true);
        clearDraft(draftId);

        if (currentData?.isNewFromOtherForm && currentData?.documentType && currentData?.documentRef) {
          const docTypeToEndpoint: Record<string, string> = {
            'ReceiptNotification': 'receipt-notifications',
            'PaymentNotification': 'payment-notifications',
            'PettyCashSummary': 'petty-cash-summaries',
            'ReceivedChequeOperation': 'received-cheque-operations',
            'PaidDocumentClearing': 'paid-document-clearings'
          };
          
          const endpointSegment = docTypeToEndpoint[currentData.documentType];
          if (endpointSegment) {
            try {
              const isPettyCash = currentData.documentType === 'PettyCashSummary';
              await apiFetch(`/api/rap/${endpointSegment}/${currentData.documentRef}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  voucherHeaderRef: savedData.voucherId,
                  ...(isPettyCash ? { state: 8 } : { status: 8 })
                })
              });
              console.log(`Successfully updated parent ${currentData.documentType} with voucherId:`, savedData.voucherId);
              eventBus.emit(EVENTS.DATA_CHANGED);
            } catch (err) {
              console.error(`Failed to update parent ${currentData.documentType} with voucherHeaderRef:`, err);
            }
          }
        }
        
        eventBus.emit(EVENTS.DATA_CHANGED);
        
        if (postAction === 'new') {
          handleResetForm();
        } else if (postAction === 'close') {
          if (activeTabId) {
            removeTab(activeTabId);
          }
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.message || 'خطا در ذخیره سند', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (currentUser && !initialData?.creatorName && header.creatorName === '') {
      const newName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username || '';
      if (newName) {
        setHeader((prev: any) => ({
          ...prev,
          creatorName: newName
        }));
      }
    }
  }, [currentUser, initialData, header.creatorName]);

  const getRowFields = (item: any) => {
    const fields = ['ledgerCode'];
    for (let lvl = 1; lvl <= detailedLevelsCount; lvl++) {
      const rel = getRelatedDetailedType(item?.ledgerCode, lvl);
      if (rel) {
        fields.push(`detail-${lvl}`);
      }
    }
    fields.push('description', 'debit', 'credit', 'date', 'trackingNum', 'status', 'currencyAmount', 'exchangeRate');
    return fields;
  };

  const navigateToCell = (rowIndex: number, fieldName: string) => {
    if (rowIndex < 0 || rowIndex >= items.length) return;

    setSelectedRowIndex(rowIndex);
    setFocusedCell({ rowIndex, field: fieldName });

    setTimeout(() => {
      let focusId = `row-${rowIndex}-${fieldName}`;
      if (fieldName.startsWith('detail-')) {
        const level = fieldName.split('-')[1];
        focusId = `row-${rowIndex}-detail-${level}`;
      }
      if (fieldName === 'status') {
        focusId = `row-${rowIndex}-status`;
      }

      const elem = document.getElementById(focusId);
      if (elem) {
        refocusElement(elem);
      }
    }, 50);
  };

  const handleAddItem = () => {
    setItems((prev: any) => [
      ...prev,
      {
        id: Date.now(),
        row: prev.length + 1,
        ledgerCode: null,
        details: {},
        description: '',
        debit: '',
        credit: '',
        trackingNum: '',
        trackingDate: '',
        taxStatus: '',
        baseCurrency: null,
        currencyAmount: '',
        exchangeRate: ''
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: string, currentLevel?: number) => {
    const activeField = field === 'detail' && currentLevel !== undefined ? `detail-${currentLevel}` : field;

    // F3 Key - Swap debit and credit within current active row
    if (e.key === 'F3') {
      e.preventDefault();
      if (!items[index].isSystemGenerated) {
        const newItems = [...items];
        const current = newItems[index];
        const temp = current.debit;
        current.debit = current.credit;
        current.credit = temp;
        setItems(newItems);
      }
      return;
    }

    // F4 Key - Copy field value from above row
    if (e.key === 'F4') {
      e.preventDefault();
      if (index > 0 && !items[index].isSystemGenerated) {
        const newItems = [...items];
        const prevRow = newItems[index - 1];
        const currentRow = newItems[index];

        if (activeField === 'ledgerCode') {
          currentRow.ledgerCode = prevRow.ledgerCode ? { ...prevRow.ledgerCode } : null;
        } else if (activeField.startsWith('detail-')) {
          const lvl = activeField.split('-')[1];
          if (!currentRow.details) currentRow.details = {};
          if (!currentRow.detailsObjects) currentRow.detailsObjects = {};
          currentRow.details[`detail-${lvl}`] = prevRow.details?.[`detail-${lvl}`] ?? '';
          prevRow.detailsObjects?.[`detail-${lvl}`] ? (currentRow.detailsObjects[`detail-${lvl}`] = { ...prevRow.detailsObjects[`detail-${lvl}`] }) : (currentRow.detailsObjects[`detail-${lvl}`] = null);
        } else if (activeField === 'description') {
          currentRow.description = prevRow.description ?? '';
        } else if (activeField === 'debit') {
          currentRow.debit = prevRow.debit ?? '';
          currentRow.credit = '';
        } else if (activeField === 'credit') {
          currentRow.credit = prevRow.credit ?? '';
          currentRow.debit = '';
        } else if (activeField === 'date') {
          currentRow.trackingDate = prevRow.trackingDate ?? '';
        } else if (activeField === 'trackingNum') {
          currentRow.trackingNum = prevRow.trackingNum ?? '';
        } else if (activeField === 'status') {
          currentRow.baseCurrency = prevRow.baseCurrency ? { ...prevRow.baseCurrency } : null;
        } else if (activeField === 'currencyAmount') {
          currentRow.currencyAmount = prevRow.currencyAmount ?? '';
        } else if (activeField === 'exchangeRate') {
          currentRow.exchangeRate = prevRow.exchangeRate ?? '';
        }

        setItems(newItems);
      }
      return;
    }

    // F5 Key - Copy whole row above to current row
    if (e.key === 'F5') {
      e.preventDefault();
      if (index > 0 && !items[index].isSystemGenerated) {
        const newItems = [...items];
        const prev = newItems[index - 1];
        newItems[index] = {
          ...newItems[index],
          ledgerCode: prev.ledgerCode ? { ...prev.ledgerCode } : null,
          details: prev.details ? { ...prev.details } : {},
          detailsObjects: prev.detailsObjects ? { ...prev.detailsObjects } : {},
          description: prev.description ?? '',
          debit: prev.debit ?? '',
          credit: prev.credit ?? '',
          trackingDate: prev.trackingDate ?? '',
          trackingNum: prev.trackingNum ?? '',
          baseCurrency: prev.baseCurrency ? { ...prev.baseCurrency } : null,
          currencyAmount: prev.currencyAmount ?? '',
          exchangeRate: prev.exchangeRate ?? ''
        };
        setItems(newItems);
      }
      return;
    }

    // Standard arrow keys
    const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    let shouldMoveLeft = e.key === 'ArrowLeft';
    let shouldMoveRight = e.key === 'ArrowRight';

    if (isInput) {
      const input = e.target as any;
      const isText = input.type === 'text' || input.tagName === 'TEXTAREA';
      if (isText) {
        const cursorPosition = input.selectionStart ?? 0;
        const textLen = input.value?.length ?? 0;
        
        if (e.key === 'ArrowLeft') {
          shouldMoveLeft = (cursorPosition === textLen) || e.altKey || e.ctrlKey;
        }
        if (e.key === 'ArrowRight') {
          shouldMoveRight = (cursorPosition === 0) || e.altKey || e.ctrlKey;
        }
      }
    }

    if (shouldMoveLeft) {
      e.preventDefault();
      const fieldsList = getRowFields(items[index]);
      const curIdx = fieldsList.indexOf(activeField);
      if (curIdx !== -1 && curIdx < fieldsList.length - 1) {
        navigateToCell(index, fieldsList[curIdx + 1]);
      }
      return;
    }

    if (shouldMoveRight) {
      e.preventDefault();
      const fieldsList = getRowFields(items[index]);
      const curIdx = fieldsList.indexOf(activeField);
      if (curIdx > 0) {
        navigateToCell(index, fieldsList[curIdx - 1]);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        navigateToCell(index - 1, activeField);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < items.length - 1) {
        navigateToCell(index + 1, activeField);
      }
      return;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      const selected = items[index]?.ledgerCode;

      if (field === 'ledgerCode') {
        e.preventDefault();
        let focused = false;
        // Check which detailed levels are configured and active
        for (let level = 1; level <= detailedLevelsCount; level++) {
          const relDetailedType = getRelatedDetailedType(selected, level);
          if (relDetailedType) {
            const elementId = `row-${index}-detail-${level}`;
            const elem = document.getElementById(elementId);
            if (elem) {
              refocusElement(elem);
              focused = true;
              break; // jump to first active detailed column
            }
          }
        }
        if (!focused) {
          const descriptionElem = document.getElementById(`row-${index}-description`);
          if (descriptionElem) {
            refocusElement(descriptionElem);
          }
        }
      }

      else if (field === 'detail' && currentLevel !== undefined) {
        e.preventDefault();
        let focused = false;
        // Search subsequent active levels
        for (let level = currentLevel + 1; level <= detailedLevelsCount; level++) {
          const relDetailedType = getRelatedDetailedType(selected, level);
          if (relDetailedType) {
            const elementId = `row-${index}-detail-${level}`;
            const elem = document.getElementById(elementId);
            if (elem) {
              refocusElement(elem);
              focused = true;
              break;
            }
          }
        }
        if (!focused) {
          const descriptionElem = document.getElementById(`row-${index}-description`);
          if (descriptionElem) {
            refocusElement(descriptionElem);
          }
        }
      }

      else if (field === 'description') {
        e.preventDefault();
        const debitElem = document.getElementById(`row-${index}-debit`);
        if (debitElem) {
          refocusElement(debitElem);
        }
      }

      else if (field === 'debit') {
        e.preventDefault();
        const creditElem = document.getElementById(`row-${index}-credit`);
        if (creditElem) {
          refocusElement(creditElem);
        }
      }

      else if (field === 'credit') {
        e.preventDefault();
        const dateElem = document.getElementById(`row-${index}-date`);
        if (dateElem) {
          refocusElement(dateElem);
        }
      }

      else if (field === 'date') {
        e.preventDefault();
        const trackingNumElem = document.getElementById(`row-${index}-trackingNum`);
        if (trackingNumElem) {
          refocusElement(trackingNumElem);
        }
      }

      else if (field === 'trackingNum') {
        e.preventDefault();
        const statusElem = document.getElementById(`row-${index}-status`);
        if (statusElem) {
          refocusElement(statusElem);
        }
      }

      else if (field === 'status') {
        e.preventDefault();
        const currencyAmountElem = document.getElementById(`row-${index}-currencyAmount`);
        if (currencyAmountElem) {
          refocusElement(currencyAmountElem);
        }
      }

      else if (field === 'currencyAmount') {
        e.preventDefault();
        const exchangeRateElem = document.getElementById(`row-${index}-exchangeRate`);
        if (exchangeRateElem) {
          refocusElement(exchangeRateElem);
        }
      }

      else if (field === 'exchangeRate') {
        e.preventDefault();
        const nextLedgerId = `row-${index + 1}-ledgerCode`;
        const nextElem = document.getElementById(nextLedgerId);
        if (nextElem) {
          refocusElement(nextElem);
        } else {
          handleAddItem();
          setTimeout(() => {
            const addedElem = document.getElementById(`row-${index + 1}-ledgerCode`);
            if (addedElem) refocusElement(addedElem);
          }, 100);
        }
      }
    }
  };

  const handleDeleteItem = () => {
    if (selectedRowIndex !== null && items.length > 0) {
      if (items[selectedRowIndex]?.isSystemGenerated) {
        showToast('امکان حذف اقلام سیستمی وجود ندارد', 'error');
        return;
      }
      setItems((prev: any) => {
        const newItems = prev.filter((_: any, i: any) => i !== selectedRowIndex);
        return newItems.map((item: any, i: any) => ({ ...item, row: i + 1 }));
      });
      setSelectedRowIndex(null);
    }
  };

  const handleHeaderChange = (field: string, value: any) => {
    setHeader((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFooterChange = (field: string, value: any) => {
    setFooter((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleList = () => {
    window.location.href = '/forms/accounting/vouchers';
  };

  const totalDebit = items.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
  const totalCredit = items.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
  const balanceDebit = totalDebit > totalCredit ? totalDebit - totalCredit : 0;
  const balanceCredit = totalCredit > totalDebit ? totalCredit - totalDebit : 0;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.05)] overflow-hidden font-sans relative" dir="rtl">
      <LoadingOverlay visible={isSaving} message="در حال ذخیره سند..." />
      {/* Unified Header */}
      <div className="relative flex flex-col flex-shrink-0 w-full m-0 border-b border-x-0 border-b-gray-200 dark:border-b-gray-800 rounded-none z-30">
        <div className="w-full bg-gradient-to-r rtl:bg-gradient-to-l from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 px-4 py-2 flex items-center justify-between text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center opacity-90"><FileSpreadsheet className="w-5 h-5" /></div>
            <h3 className="text-[13px] font-medium">سند حسابداری</h3>
          </div>
          <div className="flex items-center gap-1">
            <HelpButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
            <FullscreenButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
            <CloseButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
          </div>
        </div>

        <div className="Actionbar w-full bg-gray-50/50 dark:bg-gray-800/20 px-4 py-2 flex flex-nowrap items-center justify-between gap-4 overflow-visible">
          <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
             <NewButton hideLabel onClick={handleResetForm} disabled={isUsed || false} />
             <ListButton 
               hideLabel 
               listApiUrl={selectedFiscalYear ? `/api/accounting/vouchers?fiscalYearId=${selectedFiscalYear}` : '/api/accounting/vouchers'}
               columns={voucherDropdownColumns}
               displayKey="voucherNumber"
               onSelect={(item: any) => {
                 const fid = item.voucherId || item.id;
                 if (fid) {
                   setActiveId(fid);
                 }
               }}
               onClick={handleList} 
             />
             <SaveButton hideLabel onClick={() => handleSaveAction(undefined)} disabled={isApproved} />
             <SaveNewButton hideLabel onClick={() => handleSaveAction(undefined, 'new')} disabled={isApproved} />
             <SaveCloseButton hideLabel onClick={() => handleSaveAction(undefined, 'close')} disabled={isApproved} />
             <DeleteButton 
               hideLabel 
               disabled={!isUpdate || isApproved} 
               onClick={() => {
                 setDeleteActionType('delete');
                 setIsDeleteModalOpen(true);
               }} 
             />
             <DeleteAndNewButton 
               hideLabel 
               disabled={!isUpdate || isApproved} 
               onClick={() => {
                 setDeleteActionType('delete_and_new');
                 setIsDeleteModalOpen(true);
               }} 
             />
             <div className="flex flex-nowrap items-center gap-1.5 shrink-0 border-r border-[#cbd5e1] dark:border-slate-700 pr-4">
               <PrintDropdownButton 
                 targetForm="Acc.Vouchers"
                 defaultAction={() => {
                   showToast("چاپ پیش‌فرض اجرا شد...", "info");
                 }}
                 onPrint={(reportId) => {
                    if (reportId) {
                       showToast(`در حال تولید خروجی قالب ${reportId}...`, "info");
                       addTab(
                         `چاپ پیش‌نمایش`,
                         `general_group`,
                         undefined,
                         'ReportViewer',
                         { reportId: reportId.toString(), recordId: activeId?.toString() }
                       );
                    } else {
                       showToast("چاپ پیش‌فرض اجرا شد...", "info");
                    }
                 }}
                 disabled={!activeId}
               />
               <PdfExportButton hideLabel />
               <WordExportButton hideLabel />
             </div>
          </div>

          {/* Record Navigator on the left side of the action bar */}
          <div className="flex flex-nowrap items-center gap-1 shrink-0">
            <RecordNavigator
              formName="سند حسابداری"
              title="سند حسابداری"
              listApiUrl={selectedFiscalYear ? `/api/accounting/vouchers?fiscalYearId=${selectedFiscalYear}` : '/api/accounting/vouchers'}
              currentRecordId={activeId}
              onSelect={(item: any) => {
                const fid = item.voucherId || item.id;
                if (fid) {
                  setActiveId(fid);
                }
              }}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>


      {isFormDisabledDueToFiscalYear && (
        <FiscalYearWarningBanner className="mx-4 mt-3" />
      )}

      {/* Header Info */}
      <div className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 shrink-0">
        <div className="p-3 px-4 pt-4">
          <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1.5fr] items-center gap-x-6 gap-y-3 relative">
            {/* Row 1 */}
            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">شماره سند: <span className="text-red-500">*</span></label>
            <NumberInput 
              value={header.voucherNumber} 
              onChange={(val) => handleHeaderChange('voucherNumber', val)}
              disabled={isVoucherNoAuto || isApproved}
            />

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">شماره عطف: <span className="text-red-500">*</span></label>
            <NumberInput 
              value={header.referenceNumber} 
              onChange={(val) => handleHeaderChange('referenceNumber', val)}
              disabled={isReferenceNoAuto || isApproved}
            />

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">شماره فرعی:</label>
            <input 
              className="w-full h-[25px] rounded-lg border border-slate-200 dark:border-slate-700 px-2 outline-none focus:border-indigo-500 bg-gray-50/50 dark:bg-slate-800/50 text-[11px] text-slate-800 dark:text-slate-100 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              value={header.subNumber ?? ""} 
              onChange={(e) => handleHeaderChange('subNumber', e.target.value)}
              disabled={isApproved}
            />

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">ایجاد کننده:</label>
            <div className="flex w-full gap-1">
              <input 
                className="w-full h-[25px] rounded-lg border border-slate-200 dark:border-slate-700 px-2 outline-none bg-gray-100 dark:bg-slate-800 text-[11px] text-gray-500 dark:text-gray-400 opacity-50 cursor-not-allowed"
                value={header.creatorName ?? ""} 
                disabled
              />
            </div>

            {/* Row 2 */}
            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">تاریخ سند: <span className="text-red-500">*</span></label>
            <div className="w-full">
              <DateInput 
                isHeader={true}
                value={header.voucherDate} 
                onChange={(val) => handleHeaderChange('voucherDate', val)}
                error={voucherDateError}
                disabled={isApproved}
              />
            </div>

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">نوع سند: <span className="text-red-500">*</span></label>
            <div className="w-full h-[25px]">
              <VoucherTypesDropDown 
                value={header.voucherType}
                onChange={(val) => handleHeaderChange('voucherType', val)}
                disabled={isApproved}
                excludeSystemTypes={true}
              />
            </div>

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">ماهیت سند: <span className="text-red-500">*</span></label>
            <select 
              className="w-full h-[25px] rounded-lg border border-slate-200 dark:border-slate-700 px-1 outline-none focus:border-indigo-500 bg-gray-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
              value={header.voucherNature}
              onChange={(e) => handleHeaderChange('voucherNature', e.target.value)}
              disabled={isApproved}
            >
              <option value="عادی">عادی</option>
              <option value="قانونی">قانونی</option>
            </select>

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">وضعیت: <span className="text-red-500">*</span></label>
            <StateListInput 
              value={voucherStatus ?? ""}
              onChange={(val) => setVoucherStatus(val ?? DocumentState.InitialRegistration)}
              allowedStates={
                isApproved
                  ? [DocumentState.Approved, DocumentState.Finalized]
                  : [DocumentState.InitialRegistration, DocumentState.Note]
              }
              disabled={isApproved}
            />

            {/* Row 3 */}
            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end items-center pt-0">شرح: <span className="text-red-500">*</span></label>
            <div className="col-span-3">
              <TextArea 
                value={header.description} 
                onChange={(val) => handleHeaderChange('description', val)}
                rows={1}
                className="h-[25px] min-h-[25px] py-0 px-2 rounded-lg border-slate-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-[11px]"
                disabled={isApproved}
              />
            </div>

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end items-center pt-0">شرح به زبان دوم:</label>
            <div className="col-span-3">
              <TextArea 
                value={header.description2} 
                onChange={(val) => handleHeaderChange('description2', val)}
                rows={1}
                className="h-[25px] min-h-[25px] py-0 px-2 rounded-lg border-slate-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-[11px]"
                disabled={isApproved}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-white border border-gray-200 mt-2 mx-1 flex flex-col overflow-hidden shadow-sm dark:bg-gray-900 border-t-0 shadow-none relative">
        <div id="voucher-items-container" className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-[11px] text-right border-collapse whitespace-nowrap table-fixed">
            <thead className="bg-[#e4ebf5] text-[#4b6584] dark:bg-slate-800 dark:text-slate-300 sticky top-0 z-10 border-b border-[#cbd5e1] dark:border-slate-700">
              <tr>
                <th style={{ width: getColWidth('row', 40) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                  ردیف
                  {renderResizer('row', 40)}
                </th>
                <th style={{ width: getColWidth('ledgerCode', 100) }} className="px-2 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                  کد حساب معین
                  {renderResizer('ledgerCode', 100)}
                </th>
                {Array.from({ length: detailedLevelsCount }).map((_: any, i: any) => (
                  <th key={i} style={{ width: getColWidth(`detail${i}`, 100) }} className="px-2 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                    تفصیلی {i + 1}
                    {renderResizer(`detail${i}`, 100)}
                  </th>
                ))}
                <th style={{ width: getColWidth('description', 300) }} className="px-2 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium relative overflow-hidden text-ellipsis whitespace-nowrap">
                  شرح
                  {renderResizer('description', 300)}
                </th>
                <th style={{ width: getColWidth('debit', 130) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center bg-[#d1e6d8] text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400 relative overflow-hidden text-ellipsis whitespace-nowrap">
                  بدهکار
                  {renderResizer('debit', 130)}
                </th>
                <th style={{ width: getColWidth('credit', 130) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center bg-[#d3def1] text-blue-900 dark:bg-blue-950/40 dark:text-blue-400 relative overflow-hidden text-ellipsis whitespace-nowrap">
                  بستانکار
                  {renderResizer('credit', 130)}
                </th>
                {showTrackingColumnsInVoucher && (
                  <>
                    <th style={{ width: getColWidth('date', 100) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                      تاریخ پیگیری
                      {renderResizer('date', 100)}
                    </th>
                    <th style={{ width: getColWidth('trackingNum', 110) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                      شماره پیگیری
                      {renderResizer('trackingNum', 110)}
                    </th>
                  </>
                )}
                {showCurrencyColumnsInVoucher && (
                  <>
                    <th style={{ width: getColWidth('status', 80) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                      ارز پایه
                      {renderResizer('status', 80)}
                    </th>
                    <th style={{ width: getColWidth('currencyAmount', 110) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                      ارزش ارزی
                      {renderResizer('currencyAmount', 110)}
                    </th>
                    <th style={{ width: getColWidth('exchangeRate', 110) }} className="px-1 py-1.5 border-l border-[#cbd5e1] dark:border-slate-700 font-medium text-center relative overflow-hidden text-ellipsis whitespace-nowrap">
                      نرخ ارز
                      {renderResizer('exchangeRate', 110)}
                    </th>
                  </>
                )}
                <th className="px-1 py-1.5 border-[#cbd5e1] dark:border-slate-700 font-medium relative w-auto"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={index} 
                  onClick={() => setSelectedRowIndex(index)}
                  className={clsx(
                    "border-b border-[#e2e8f0] dark:border-slate-700 hover:bg-[#f8fafc] dark:hover:bg-slate-800 cursor-pointer transition-all",
                    selectedRowIndex === index ? "bg-[#eff6ff] dark:bg-slate-800 border-r-4 border-r-blue-500 dark:border-r-blue-400" : ""
                  )}
                >
                  <td className="p-0 border-l border-[#e2e8f0] dark:border-slate-700 text-center text-gray-500">{item.row}</td>
                  <td 
                    onFocusCapture={() => {
                      setFocusedCell({ rowIndex: index, field: 'ledgerCode' });
                      setSelectedRowIndex(index);
                    }}
                    className={clsx(
                      "p-0 border-l border-[#e2e8f0] dark:border-slate-700 h-[24px] transition-all",
                      focusedCell?.rowIndex === index && focusedCell?.field === 'ledgerCode' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                    )}
                  >
                    <SlAccountDropDown 
                      enableMultiSelection={true}
                      disabled={item.isSystemGenerated || isApproved}
                      id={`row-${index}-ledgerCode`}
                      onKeyDown={(e) => handleKeyDown(e, index, 'ledgerCode')}
                      displayOnlyCode={true}
                      value={item.ledgerCode} 
                      onChange={(selected) => {
                         const newItems = [...items];
                         
                         if (Array.isArray(selected)) {
                           if (selected.length === 0) {
                              newItems[index].ledgerCode = null;
                              setItems(newItems);
                              return;
                           }
                           
                           newItems[index].ledgerCode = selected[0];
                           
                           let insertIdx = index + 1;
                           for (let i = 1; i < selected.length; i++) {
                             newItems.splice(insertIdx, 0, {
                               id: Date.now() + i,
                               row: insertIdx + 1,
                               ledgerCode: selected[i],
                               debit: '',
                               credit: '',
                               details: {},
                               detailsObjects: {},
                               description: newItems[index].description || '',
                               trackingNum: '',
                               trackingDate: '',
                               taxStatus: '',
                               baseCurrency: null,
                               currencyRate: 1,
                               currencyAmount: ''
                             });
                             insertIdx++;
                           }
                           
                           newItems.forEach((item, idx) => {
                             item.row = idx + 1;
                           });
                           
                           setItems(newItems);
                           return;
                         }

                         newItems[index].ledgerCode = selected;
                         setItems(newItems);
 
                         // Auto-focus / Jump logic as requested
                         if (selected) {
                           let attempts = 0;
                           const tryFocus = () => {
                             let focused = false;
                             let hasActiveDetailed = false;

                             // Check which detailed levels are configured and active
                             for (let level = 1; level <= detailedLevelsCount; level++) {
                               const relDetailedType = getRelatedDetailedType(selected, level);
                               if (relDetailedType) {
                                 hasActiveDetailed = true;
                                 const elementId = `row-${index}-detail-${level}`;
                                 const elem = document.getElementById(elementId);
                                 if (elem) {
                                   refocusElement(elem);
                                   focused = true;
                                   break; // jump to first active detailed column
                                 }
                               }
                             }
   
                             // If no active detailed columns found or they don't exist yet, jump to the description column
                             if (!focused) {
                               if (hasActiveDetailed && attempts < 10) {
                                 attempts++;
                                 setTimeout(tryFocus, 50);
                                 return;
                               }
                               const descriptionElem = document.getElementById(`row-${index}-description`);
                               if (descriptionElem) {
                                 refocusElement(descriptionElem);
                               }
                             }
                           };
                           setTimeout(tryFocus, 50);
                         }
                      }}
                    />
                  </td>
                  {Array.from({ length: detailedLevelsCount }).map((_, detailIndex) => {
                    const level = detailIndex + 1;
                    const relDetailedType = getRelatedDetailedType(item.ledgerCode, level);
                    const isLocked = !relDetailedType;
 
                    return (
                      <td 
                        key={detailIndex} 
                        onFocusCapture={() => {
                          setFocusedCell({ rowIndex: index, field: `detail-${level}` });
                          setSelectedRowIndex(index);
                        }}
                        className={clsx(
                          "p-0 border-l border-[#e2e8f0] dark:border-slate-700 h-[24px] min-w-[100px] text-center transition-all",
                          focusedCell?.rowIndex === index && focusedCell?.field === `detail-${level}` ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                        )}
                      >
                        {isLocked ? (
                          <div className="flex items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-800/20" title="غیر مرتبط با معین">
                            <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MultiColumnDropdown
                              disabled={item.isSystemGenerated || isApproved}
                              dropdownPlacement="auto"
                              displayKey="title"
                              renderSelection={(sel: any) => {
                                if (!sel) return "";
                                return `${sel.code || ''}`;
                              }}
                              value={item.detailsObjects?.[`detail${level}`] || null}
                              onChange={(selectedDetail: any) => {
                                const newItems = [...items];
                                
                                if (Array.isArray(selectedDetail)) {
                                   if (selectedDetail.length === 0) {
                                      if (!newItems[index].details) newItems[index].details = {};
                                      if (!newItems[index].detailsObjects) newItems[index].detailsObjects = {};
                                      newItems[index].details[`detail${level}`] = '';
                                      newItems[index].detailsObjects[`detail${level}`] = null;
                                   } else {
                                      if (!newItems[index].details) newItems[index].details = {};
                                      if (!newItems[index].detailsObjects) newItems[index].detailsObjects = {};
                                      
                                      newItems[index].details[`detail${level}`] = selectedDetail[0].code;
                                      newItems[index].detailsObjects[`detail${level}`] = selectedDetail[0];
                                      
                                      let insertIdx = index + 1;
                                      for (let i = 1; i < selectedDetail.length; i++) {
                                         const newItem = {
                                            id: Date.now() + i,
                                            row: insertIdx + 1,
                                            ledgerCode: newItems[index].ledgerCode,
                                            debit: '',
                                            credit: '',
                                            details: { ...newItems[index].details },
                                            detailsObjects: { ...newItems[index].detailsObjects },
                                            description: newItems[index].description || '',
                                            trackingNum: '',
                                            trackingDate: '',
                                            taxStatus: '',
                                            baseCurrency: null,
                                            currencyRate: 1,
                                            currencyAmount: ''
                                         };
                                         newItem.details[`detail${level}`] = selectedDetail[i].code;
                                         newItem.detailsObjects[`detail${level}`] = selectedDetail[i];
                                         
                                         newItems.splice(insertIdx, 0, newItem);
                                         insertIdx++;
                                      }
                                   }
                                   
                                   newItems.forEach((item, idx) => item.row = idx + 1);
                                   setItems(newItems);
                                   return;
                                }

                                if (!newItems[index].details) newItems[index].details = {};
                                if (!newItems[index].detailsObjects) newItems[index].detailsObjects = {};
                                
                                newItems[index].details[`detail${level}`] = selectedDetail ? selectedDetail.code : '';
                                newItems[index].detailsObjects[`detail${level}`] = selectedDetail || null;
                                setItems(newItems);
 
                                // Jump to subsequent active detailed level, or to description if none is active
                                const ledger = item.ledgerCode;
                                setTimeout(() => {
                                  let nextFocused = false;
                                  for (let nextLvl = level + 1; nextLvl <= detailedLevelsCount; nextLvl++) {
                                    const nextRelDetails = getRelatedDetailedType(ledger, nextLvl);
                                    if (nextRelDetails) {
                                      const elementId = `row-${index}-detail-${nextLvl}`;
                                      const ele = document.getElementById(elementId);
                                      if (ele) {
                                        refocusElement(ele);
                                        nextFocused = true;
                                        break;
                                      }
                                    }
                                  }
 
                                  if (!nextFocused) {
                                    const descriptionElem = document.getElementById(`row-${index}-description`);
                                    if (descriptionElem) {
                                      refocusElement(descriptionElem);
                                    }
                                  }
                                }, 100);
                              }}
                              listApiUrl={`/api/accounting/detailed-accounts?pageIndex=0&pageSize=1000&columnFilters=${encodeURIComponent(
                                JSON.stringify([{
                                  id: 'detailedTypesId',
                                  value: {
                                    op: 'in',
                                    value: getRelatedDetailedTypes(item.ledgerCode, level).map((dt: any) => dt.detailedTypesId)
                                  }
                                }])
                              )}`}
                              columns={[
                                { key: "code", label: "کد" },
                                { key: "title", label: "عنوان" },
                                { key: "title_en", label: "عنوان ۲" },
                                { key: "detailedType.title", label: "نوع تفصیلی" }
                              ]}
                              enableMultiSelection={true}
                              trigger={(toggle, isOpenState) => (
                                <button
                                  disabled={item.isSystemGenerated || isApproved}
                                  type="button"
                                  id={`row-${index}-detail-${level}`}
                                  onClick={toggle}
                                  onKeyDown={(e) => {
                                    if (e.altKey && e.key === 'ArrowDown') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!isOpenState) toggle();
                                    } else {
                                      handleKeyDown(e, index, 'detail', level);
                                    }
                                  }}
                                  className="w-full h-full flex items-center justify-between px-2 text-[11px] bg-transparent border-0 select-none outline-none focus:bg-slate-50 dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-gray-400 text-center"
                                >
                                  <span className="w-full text-center truncate">
                                    {item.detailsObjects?.[`detail${level}`]?.code || item.details?.[`detail${level}`] || ""}
                                  </span>
                                  <ChevronDown className="w-3 h-3 text-slate-400 opacity-60 flex-shrink-0" />
                                </button>
                              )}
                            />
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td 
                    onFocusCapture={() => {
                      setFocusedCell({ rowIndex: index, field: 'description' });
                      setSelectedRowIndex(index);
                    }}
                    className={clsx(
                      "p-0 border-l border-[#e2e8f0] dark:border-slate-700 transition-all",
                      focusedCell?.rowIndex === index && focusedCell?.field === 'description' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                    )}
                  >
                    <textarea 
                      disabled={item.isSystemGenerated || isApproved}
                      id={`row-${index}-description`}
                      className="w-full h-[24px] min-h-[24px] resize-none overflow-y-auto custom-scrollbar bg-transparent outline-none px-1 py-1 leading-tight whitespace-pre-wrap block" 
                      rows={1}
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].description = e.target.value;
                        setItems(newItems);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                    />
                  </td>
                  <td 
                    onFocusCapture={() => {
                      setFocusedCell({ rowIndex: index, field: 'debit' });
                      setSelectedRowIndex(index);
                    }}
                    className={clsx(
                      "p-0 border-l border-[#e2e8f0] dark:border-slate-700 transition-all",
                      focusedCell?.rowIndex === index && focusedCell?.field === 'debit' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                    )}
                  >
                    <input 
                      disabled={item.isSystemGenerated || isApproved}
                      id={`row-${index}-debit`}
                      type="text"
                      className="w-full h-[24px] bg-transparent outline-none px-1 text-left font-mono" 
                      dir="ltr"
                      value={formatNumberWithCommas(item.debit) || ''}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
                        const newItems = [...items];
                        newItems[index].debit = cleanVal;
                        if (cleanVal) {
                          newItems[index].credit = '';
                        }
                        setItems(newItems);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, index, 'debit')}
                    />
                  </td>
                  <td 
                    onFocusCapture={() => {
                      setFocusedCell({ rowIndex: index, field: 'credit' });
                      setSelectedRowIndex(index);
                    }}
                    className={clsx(
                      "p-0 border-l border-[#e2e8f0] dark:border-slate-700 transition-all",
                      focusedCell?.rowIndex === index && focusedCell?.field === 'credit' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                    )}
                  >
                    <input 
                      disabled={item.isSystemGenerated || isApproved}
                      id={`row-${index}-credit`}
                      type="text"
                      className="w-full h-[24px] bg-transparent outline-none px-1 text-left font-mono" 
                      dir="ltr"
                      value={formatNumberWithCommas(item.credit) || ''}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
                        const newItems = [...items];
                        newItems[index].credit = cleanVal;
                        if (cleanVal) {
                          newItems[index].debit = '';
                        }
                        setItems(newItems);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, index, 'credit')}
                    />
                  </td>
                  {showTrackingColumnsInVoucher && (
                    <>
                      <td 
                        onFocusCapture={() => {
                          setFocusedCell({ rowIndex: index, field: 'date' });
                          setSelectedRowIndex(index);
                        }}
                        className={clsx(
                          "p-0 border-l border-[#e2e8f0] dark:border-slate-700 min-w-[120px] transition-all",
                          focusedCell?.rowIndex === index && focusedCell?.field === 'date' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                        )}
                      >
                        <DateInput 
                          disabled={item.isSystemGenerated || isApproved}
                          id={`row-${index}-date`}
                          value={item.trackingDate || ''}
                          onChange={(val) => {
                            const newItems = [...items];
                            newItems[index].trackingDate = val;
                            setItems(newItems);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 'date')}
                        />
                      </td>
                      <td 
                        onFocusCapture={() => {
                          setFocusedCell({ rowIndex: index, field: 'trackingNum' });
                          setSelectedRowIndex(index);
                        }}
                        className={clsx(
                          "p-0 border-l border-[#e2e8f0] dark:border-slate-700 transition-all",
                          focusedCell?.rowIndex === index && focusedCell?.field === 'trackingNum' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                        )}
                      >
                        <input 
                          disabled={item.isSystemGenerated || isApproved}
                          id={`row-${index}-trackingNum`}
                          type="text"
                          className="w-full h-[24px] bg-transparent outline-none px-1 text-center" 
                          value={item.trackingNum || ''}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].trackingNum = e.target.value;
                            setItems(newItems);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 'trackingNum')}
                        />
                      </td>
                    </>
                  )}
                  {showCurrencyColumnsInVoucher && (
                    <>
                      <td 
                        onFocusCapture={() => {
                          setFocusedCell({ rowIndex: index, field: 'status' });
                          setSelectedRowIndex(index);
                        }}
                        className={clsx(
                          "p-0 border-l border-[#e2e8f0] dark:border-slate-700 h-[24px] transition-all",
                          focusedCell?.rowIndex === index && focusedCell?.field === 'status' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-[#eff6ff] dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                        )}
                      >
                        <CurrencyDropDown
                          disabled={item.isSystemGenerated || isApproved}
                          id={`row-${index}-status-dropdown`}
                          value={item.baseCurrency || null}
                          onChange={(selectedCurrency: any) => {
                            const newItems = [...items];
                            newItems[index].baseCurrency = selectedCurrency;
                            setItems(newItems);
                          }}
                          trigger={(toggle, isOpenState) => (
                            <button
                              disabled={item.isSystemGenerated || isApproved}
                              type="button"
                              id={`row-${index}-status`}
                              onClick={toggle}
                              onKeyDown={(e) => {
                                if (e.altKey && e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!isOpenState) toggle();
                                } else {
                                  handleKeyDown(e, index, 'status');
                                }
                              }}
                              className="w-full h-full flex items-center justify-between px-2 text-[11px] bg-transparent border-0 select-none outline-none focus:bg-slate-50 dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-gray-400 text-center"
                            >
                              <span className="w-full text-center truncate">
                                {item.baseCurrency ? item.baseCurrency.title : "انتخاب..."}
                              </span>
                              <ChevronDown className="w-3 h-3 text-slate-400 opacity-60 flex-shrink-0" />
                            </button>
                          )}
                        />
                      </td>
                      <td 
                        onFocusCapture={() => {
                          setFocusedCell({ rowIndex: index, field: 'currencyAmount' });
                          setSelectedRowIndex(index);
                        }}
                        className={clsx(
                          "p-0 border-l border-[#e2e8f0] dark:border-slate-700 transition-all",
                          focusedCell?.rowIndex === index && focusedCell?.field === 'currencyAmount' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                        )}
                      >
                        <input 
                          disabled={item.isSystemGenerated || isApproved}
                          id={`row-${index}-currencyAmount`}
                          type="text"
                          className="w-full h-[24px] bg-transparent outline-none px-1 text-center font-mono" 
                          dir="ltr"
                          value={formatNumberWithCommas(item.currencyAmount) || ''}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
                            const newItems = [...items];
                            newItems[index].currencyAmount = cleanVal;
                            setItems(newItems);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 'currencyAmount')}
                        />
                      </td>
                      <td 
                        onFocusCapture={() => {
                          setFocusedCell({ rowIndex: index, field: 'exchangeRate' });
                          setSelectedRowIndex(index);
                        }}
                        className={clsx(
                          "p-0 border-l border-[#e2e8f0] dark:border-slate-700 transition-all",
                          focusedCell?.rowIndex === index && focusedCell?.field === 'exchangeRate' ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/40 dark:bg-blue-950/40 z-10 relative shadow-[0_0_8px_rgba(59,130,246,0.25)]" : ""
                        )}
                      >
                        <input 
                          disabled={item.isSystemGenerated || isApproved}
                          id={`row-${index}-exchangeRate`}
                          type="text"
                          className="w-full h-[24px] bg-transparent outline-none px-1 text-center font-mono" 
                          dir="ltr"
                          value={formatNumberWithCommas(item.exchangeRate) || ''}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
                            const newItems = [...items];
                            newItems[index].exchangeRate = cleanVal;
                            setItems(newItems);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 'exchangeRate')}
                        />
                      </td>
                    </>
                  )}
                  <td className="p-0 border-[#e2e8f0] dark:border-slate-700 w-auto"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex bg-[#e8ecf1] border-t border-gray-300 dark:bg-slate-800 dark:border-slate-700 h-7 items-center px-1">
           <div className="flex items-center gap-1 opacity-70">
              <button 
                onClick={handleAddItem} 
                disabled={isApproved} 
                className="p-[2px] bg-white border border-gray-300 rounded text-amber-500 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button 
                onClick={handleDeleteItem} 
                disabled={isApproved} 
                className="p-[2px] bg-white border border-gray-300 rounded text-red-500 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-2 shrink-0">
        <div className="p-3 w-full flex items-start">
          {/* Right side fields */}
          <div className="w-2/3 pl-8 shrink-0 max-h-[100px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-2">
               {[...Array(Math.max(3, detailedLevelsCount))].map((_: any, i: any) => {
                 const leftLabel = i === 0 ? 'گروه حساب:' : i === 1 ? 'حساب کل:' : i === 2 ? 'حساب معین:' : '';
                 const rightLabel = i < detailedLevelsCount ? `عنوان تفصیلی ${i + 1}:` : '';
                 
                 const selectedItem = selectedRowIndex !== null ? items[selectedRowIndex] : null;
                 const ledger = selectedItem?.ledgerCode;
                 
                 let leftValue = '';
                 if (i === 2 && ledger) {
                     leftValue = ledger.title || '';
                 } else if (i === 1 && ledger?.parent) {
                     leftValue = ledger.parent.title || '';
                 } else if (i === 0 && ledger?.parent?.parent) {
                     leftValue = ledger.parent.parent.title || '';
                 }

                 let rightValue = '';
                 if (selectedItem) {
                   const selObj = selectedItem.detailsObjects?.[`detail${i + 1}`];
                   if (selObj) {
                     rightValue = selObj.title || '';
                   } else if (selectedItem.details?.[`detail${i + 1}`]) {
                     rightValue = selectedItem.details[`detail${i + 1}`];
                   }
                 }

                 return (
                   <React.Fragment key={i}>
                     {leftLabel ? (
                       <>
                         <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end mt-1">{leftLabel}</label>
                         <TextInput disabled value={leftValue} onChange={() => {}} />
                       </>
                     ) : (
                       <div className="col-span-2"></div>
                     )}
                     
                     {rightLabel ? (
                       <>
                         <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end mt-1">{rightLabel}</label>
                         <TextInput disabled value={rightValue} onChange={() => {}} />
                       </>
                     ) : (
                       <div className="col-span-2"></div>
                     )}
                   </React.Fragment>
                 );
               })}
            </div>
          </div>

          {/* Left side totals */}
          <div className="grid grid-cols-[auto_140px_140px] gap-x-2 gap-y-1 items-center mr-auto">
            <div></div>
            <div className="bg-[#eaf4ed] dark:bg-[#163022] text-[#4f7f63] dark:text-[#a0d2b5] text-[11px] text-center border border-[#b6d6c3] dark:border-[#204a33] py-1 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.3)]">بدهکار</div>
            <div className="bg-[#fceef5] dark:bg-[#341624] text-[#8e3966] dark:text-[#d396af] text-[11px] text-center border border-[#e8c0d5] dark:border-[#5a2c41] py-1 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.3)]">بستانکار</div>

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap text-left pl-2 mt-1">مجموع:</label>
            <AmountInput disabled value={totalDebit || ""} onChange={() => {}} />
            <AmountInput disabled value={totalCredit || ""} onChange={() => {}} />

            <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap text-left pl-2 mt-1">مانده:</label>
            <AmountInput disabled value={balanceDebit || ""} onChange={() => {}} />
            <AmountInput disabled value={balanceCredit || ""} onChange={() => {}} />
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title={deleteActionType === 'delete_and_new' ? 'حذف و جدید' : 'حذف سند'}
        message="آیا از حذف این سند حسابداری اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteActionType(null);
        }}
      />
    </div>
  );
}
