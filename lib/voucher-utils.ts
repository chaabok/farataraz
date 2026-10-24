import { apiFetch } from "@/lib/utils";
import moment from "moment-jalaali";
import { toEnglishDigits } from "@/lib/utils";

export async function generateVoucherInitialDataFromAccountingInfo(
  documentType: string,
  documentRef: number,
  values: any,
  isReceipt: boolean,
  descriptionPrefix: string
) {
  const description = values.description 
      ? `${descriptionPrefix} ${values.number} - ${values.description}`
      : `${descriptionPrefix} ${values.number}`;

  let targetVoucherType = null;
  try {
    const res = await apiFetch(`/api/accounting/voucher-types?search=هزینه های عمومی`);
    if (res.ok) {
      const types = await res.json();
      const arr = Array.isArray(types) ? types : (types.items || types.data || []);
      if (arr.length > 0) {
        targetVoucherType = arr[0];
      }
    }
  } catch(e) {}

  let accountingInfoItems: any[] = [];
  try {
    const accInfoRes = await apiFetch(`/api/rap/document-accounting-info?documentType=${documentType}&documentRef=${documentRef}`);
    if (accInfoRes.ok) {
      const accInfoData = await accInfoRes.json();
      accountingInfoItems = accInfoData.items || [];
    }
  } catch(err) {
    console.error("Error fetching accounting info:", err);
  }

  let detailedAccounts: any[] = [];
  try {
    const daRes = await apiFetch('/api/accounting/detailed-accounts');
    if (daRes.ok) {
      const daData = await daRes.json();
      let arr: any[] = [];
      if (Array.isArray(daData)) arr = daData;
      else if (daData && Array.isArray(daData.data)) arr = daData.data;
      else if (daData && daData.data && Array.isArray(daData.data.data)) arr = daData.data.data;
      else if (daData && Array.isArray(daData.items)) arr = daData.items;
      detailedAccounts = arr;
    }
  } catch(err) {}

  const getDetailObj = (detailId: number) => {
    if (!detailId) return null;
    return (detailedAccounts || []).find((a: any) => Number(a.detailedAccountId || a.id || a.DetailedAccountID) === Number(detailId)) || null;
  };

  const getDetails = (prefix: 'op' | 'for', accInfo: any) => {
    const accInfoData = accInfo?.data;
    const details: any = {};
    const detailsObjects: any = {};
    if (accInfoData) {
      const PascalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      for (let i = 1; i <= 6; i++) {
        const refId = accInfoData[`${prefix}Detail${i}Ref`] || accInfoData[`${PascalPrefix}Detail${i}Ref`] || accInfoData[`${prefix}Detail${i}ref`];
        const obj = getDetailObj(refId);
        details[`detail${i}`] = obj ? obj.code : '';
        detailsObjects[`detail${i}`] = obj || null;
      }
    } else {
      for (let i = 1; i <= 6; i++) {
        details[`detail${i}`] = '';
        detailsObjects[`detail${i}`] = null;
      }
    }

    const partyAccountId = accInfo?.suggestedPartyDetailedAccountId;
    const opPartyAccountId = accInfo?.suggestedOpPartyDetailedAccountId !== undefined ? accInfo?.suggestedOpPartyDetailedAccountId : partyAccountId;
    const forPartyAccountId = accInfo?.suggestedForPartyDetailedAccountId !== undefined ? accInfo?.suggestedForPartyDetailedAccountId : partyAccountId;
    const opAccountId = accInfo?.suggestedOpDetailedAccountId;

    const pAccount = getDetailObj(partyAccountId);
    const pTypesId = pAccount?.detailedTypesId || pAccount?.DetailedTypesID || pAccount?.detailedType?.detailedTypesId || pAccount?.detailedType?.DetailedTypesID || null;

    const opPartyAccount = getDetailObj(opPartyAccountId);
    const opPartyTypesId = opPartyAccount?.detailedTypesId || opPartyAccount?.DetailedTypesID || opPartyAccount?.detailedType?.detailedTypesId || opPartyAccount?.detailedType?.DetailedTypesID || null;

    const forPartyAccount = getDetailObj(forPartyAccountId);
    const forPartyTypesId = forPartyAccount?.detailedTypesId || forPartyAccount?.DetailedTypesID || forPartyAccount?.detailedType?.detailedTypesId || forPartyAccount?.detailedType?.DetailedTypesID || null;

    const oAccount = getDetailObj(opAccountId);
    const oTypesId = oAccount?.detailedTypesId || oAccount?.DetailedTypesID || oAccount?.detailedType?.detailedTypesId || oAccount?.detailedType?.DetailedTypesID || null;

    if (prefix === 'for') {
      let matchedForLevel = null;
      if (pTypesId && accInfo?.forAccountInfo?.relatedDetailedAccounts) {
        const rel = accInfo.forAccountInfo.relatedDetailedAccounts.find(
          (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(pTypesId)
        );
        if (rel) matchedForLevel = Number(rel.detailedLevel);
      }
      if (!matchedForLevel && partyAccountId) {
        matchedForLevel = 1;
      }
      
      if (matchedForLevel && !detailsObjects[`detail${matchedForLevel}`]) {
        if (pAccount) {
          details[`detail${matchedForLevel}`] = pAccount.code;
          detailsObjects[`detail${matchedForLevel}`] = pAccount;
        }
      }

      let matchedForPartyLevel = null;
      if (forPartyTypesId && accInfo?.forAccountInfo?.relatedDetailedAccounts) {
        const rel = accInfo.forAccountInfo.relatedDetailedAccounts.find(
          (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(forPartyTypesId)
        );
        if (rel) matchedForPartyLevel = Number(rel.detailedLevel);
      }
      if (matchedForPartyLevel && !detailsObjects[`detail${matchedForPartyLevel}`]) {
        if (forPartyAccount) {
          details[`detail${matchedForPartyLevel}`] = forPartyAccount.code;
          detailsObjects[`detail${matchedForPartyLevel}`] = forPartyAccount;
        }
      }
      
      let matchedBankLevel = null;
      if (accInfo?.forAccountInfo?.relatedDetailedAccounts) {
        const rel = accInfo.forAccountInfo.relatedDetailedAccounts.find(
          (r: any) => r.detailedType?.title === 'حساب بانکی' || r.detailedType?.title?.includes('حساب بانکی') || Number(r.detailedType?.code) === 1 || Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID) === 1
        );
        if (rel) matchedBankLevel = Number(rel.detailedLevel);
      }
      const bankAccountId = accInfo?.suggestedBankDetailedAccountId;
      const bankAccount = getDetailObj(bankAccountId);
      if (matchedBankLevel && bankAccount && !detailsObjects[`detail${matchedBankLevel}`]) {
        details[`detail${matchedBankLevel}`] = bankAccount.code;
        detailsObjects[`detail${matchedBankLevel}`] = bankAccount;
      }
    }

    if (prefix === 'op') {
      let matchedOpCashLevel = null;
      if (oTypesId && accInfo?.opAccountInfo?.relatedDetailedAccounts) {
        const rel = accInfo.opAccountInfo.relatedDetailedAccounts.find(
          (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(oTypesId)
        );
        if (rel) matchedOpCashLevel = Number(rel.detailedLevel);
      }
      if (!matchedOpCashLevel && opAccountId) {
        matchedOpCashLevel = 1;
      }
      
      if (matchedOpCashLevel && !detailsObjects[`detail${matchedOpCashLevel}`]) {
        if (oAccount) {
          details[`detail${matchedOpCashLevel}`] = oAccount.code;
          detailsObjects[`detail${matchedOpCashLevel}`] = oAccount;
        }
      }

      let matchedOpPartyLevel = null;
      if (opPartyTypesId && accInfo?.opAccountInfo?.relatedDetailedAccounts) {
        const rel = accInfo.opAccountInfo.relatedDetailedAccounts.find(
          (r: any) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(opPartyTypesId)
        );
        if (rel) matchedOpPartyLevel = Number(rel.detailedLevel);
      }

      if (matchedOpPartyLevel && !detailsObjects[`detail${matchedOpPartyLevel}`]) {
        if (opPartyAccount) {
          details[`detail${matchedOpPartyLevel}`] = opPartyAccount.code;
          detailsObjects[`detail${matchedOpPartyLevel}`] = opPartyAccount;
        }
      }
    }

    return { details, detailsObjects };
  };

  const debtorItems: any[] = [];
  const creditorItems: any[] = [];

  const chequeRowType = documentType === 'ReceivedChequeOperation' ? 'چک دریافتنی' : 'چک';
  const allInputSources = [
    { list: values.cashes || [], type: 'cash', rowType: 'نقد' },
    { list: values.cheques || [], type: 'cheque', rowType: chequeRowType },
    { list: values.deposits || [], type: 'deposit', rowType: 'واریز به حساب' },
    { list: values.withdrawals || [], type: 'withdrawal', rowType: 'برداشت از حساب' },
    { list: values.returnedPaidCheques || [], type: 'returnedPaidCheque', rowType: 'استرداد چک پرداختنی' },
    { list: values.transfers || [], type: 'transfer', rowType: isReceipt ? 'برگشت واگذار به غیر' : 'حواله' },
    { list: values.promissoryNotes || [], type: 'promissoryNote', rowType: 'سفته' },
    { list: values.refund1s || [], type: 'refund1', rowType: isReceipt ? 'استرداد' : 'استرداد چک دریافتی' },
    { list: values.refund2s || [], type: 'refund2', rowType: isReceipt ? 'استرداد سفته پرداختنی' : 'استرداد سفته دریافتی' },
    { list: values.refund3s || [], type: 'refund3', rowType: 'استرداد' },
    { list: values.guarantees || [], type: 'guarantee', rowType: 'تضمین' },
    { list: values.items || [], type: 'item', rowType: documentType === 'PaidDocumentClearing' ? 'dynamic' : (documentType === 'PettyCashSummary' ? 'خلاصه تنخواه' : 'ردیف') }, // Catch-all for forms that just use 'items'
  ];

  for (const source of allInputSources) {
    for (const item of source.list) {
      let amt = 0;
      if (['cash', 'cheque', 'deposit', 'withdrawal', 'promissoryNote', 'refund1', 'refund2', 'refund3', 'item', 'guarantee'].includes(source.type)) {
        amt = parseFloat(String(item.amount || item.document?.amount || item.number?.amount || '0').replace(/[^0-9.-]/g, '')) || 0;
      } else if (source.type === 'returnedPaidCheque') {
        amt = parseFloat(String(item.chequeObj?.amount || item.amount || '0').replace(/[^0-9.-]/g, '')) || 0;
      } else if (source.type === 'transfer') {
        amt = parseFloat(String(item.transferChequeAmount || item.amount || '0').replace(/[^0-9.-]/g, '')) || 0;
      }

      if (amt > 0) {
        const itemDesc = item.description || item.desc || description;
        
        const itemId = item.id || item.receiptCashId || item.receiptChequeId || item.receiptDepositId || item.receiptPromissoryNoteId || item.paymentCashId || item.paymentChequeId || item.paymentWithdrawalId || item.paymentAssignmentId || item.paymentPromissoryNoteId || item.pettyCashSummaryItemId || item.paidDocumentClearingItemId || item.receivedChequeOperationItemId || item.receiptReturnedPaidChequeId || item.receiptReturnedPaymentAssignmentId || item.receiptReturnedPaymentPromissoryNoteId || item.paymentReturnedReceivedChequeId || item.paymentReturnedReceivedPromissoryNoteId || item.receiptGuaranteeId || item.paymentGuaranteeId;
        
        let effectiveRowType = source.rowType;
        if (effectiveRowType === 'dynamic' && documentType === 'PaidDocumentClearing') {
          const dt = item.documentType || item.document_type;
          effectiveRowType = dt === 'promissory_note' ? 'سفته' : 'چک';
        }

        let accInfo = accountingInfoItems.find(a => a.rowType === effectiveRowType && String(a.rowRef) === String(itemId));

        // Fallback to UI bound data if db mapping fails (e.g. not fully saved or temp id)
        if (!accInfo && (item.op || item.reason)) {
          accInfo = {
             opAccountInfo: item.op?.account ? {
               id: item.op.account.id || item.op.account.accountId || item.op.accountRef,
               code: item.op.account.code || '',
               title: item.op.account.title || item.op.title || item.op.name,
             } : (item.op?.recieptAndPaymentAccountingSettingId ? { id: item.op.accountRef || item.op.id, code: item.op.code || '', title: item.op.title } : null),
             forAccountInfo: item.reason?.account ? {
               id: item.reason.account.id || item.reason.account.accountId || item.reason.accountRef,
               code: item.reason.account.code || '',
               title: item.reason.account.title || item.reason.title || item.reason.name,
             } : (item.reason?.RapReasonID || item.reason?.id ? { id: item.reason.accountRef || item.reason.id, code: item.reason.code || '', title: item.reason.title } : null),
             isReverse: false,
             data: {}
          };
        }

        const opDetails = getDetails('op', accInfo);
        const forDetails = getDetails('for', accInfo);

        const opAccount = accInfo?.opAccountInfo || null;
        const reasonAccount = accInfo?.forAccountInfo || null;
        const isRev = accInfo?.isReverse;
        const effectiveIsReceipt = isRev ? !isReceipt : isReceipt;

        // User requested: "اطلاعات باکس عملیات حسابداری باید در سمت بستانکار ثبت شود و اطلاعات باکس بابت باید در سمت بدهکار ثبت شود"
        // This means Operation (opAccount) goes to Creditor, and Reason (reasonAccount) goes to Debtor.
        // For PaymentNotification, this is the correct accounting standard.
        // We will respect this logic explicitly as requested.
        const operationIsCreditor = !effectiveIsReceipt; // for Payment (isReceipt=false), Operation is Creditor

        if (!operationIsCreditor) {
          debtorItems.push({
            ledgerCode: opAccount,
            description: itemDesc,
            debit: amt,
            credit: '',
            details: opDetails.details,
            detailsObjects: opDetails.detailsObjects
          });
          creditorItems.push({
            ledgerCode: reasonAccount,
            description: itemDesc,
            debit: '',
            credit: amt,
            details: forDetails.details,
            detailsObjects: forDetails.detailsObjects
          });
        } else {
          debtorItems.push({
            ledgerCode: reasonAccount,
            description: itemDesc,
            debit: amt,
            credit: '',
            details: forDetails.details,
            detailsObjects: forDetails.detailsObjects
          });
          creditorItems.push({
            ledgerCode: opAccount,
            description: itemDesc,
            debit: '',
            credit: amt,
            details: opDetails.details,
            detailsObjects: opDetails.detailsObjects
          });
        }
      }
    }
  }

  // Handle single item case ('سند پایه' or missing detailed mapping)
  if (debtorItems.length === 0 && creditorItems.length === 0) {
     let fallbackAmt = 0;
     for (const source of allInputSources) {
       for (const item of source.list) {
         const amt = parseFloat(String(item.amount || item.chequeObj?.amount || item.transferChequeAmount || item.document?.amount || '0').replace(/[^0-9.-]/g, '')) || 0;
         fallbackAmt += amt;
       }
     }

     if (fallbackAmt > 0) {
        const baseAccInfo = accountingInfoItems.find(a => a.rowType === 'سند پایه') || accountingInfoItems[0];
        
        const opDetails = getDetails('op', baseAccInfo);
        const forDetails = getDetails('for', baseAccInfo);
        const opAccount = baseAccInfo?.opAccountInfo || null;
        const reasonAccount = baseAccInfo?.forAccountInfo || null;
        const isRev = baseAccInfo?.isReverse;
        const effectiveIsReceipt = isRev ? !isReceipt : isReceipt;

        if (effectiveIsReceipt) {
           debtorItems.push({ ledgerCode: opAccount, description, debit: fallbackAmt, credit: '', details: opDetails.details, detailsObjects: opDetails.detailsObjects });
           creditorItems.push({ ledgerCode: reasonAccount, description, debit: '', credit: fallbackAmt, details: forDetails.details, detailsObjects: forDetails.detailsObjects });
        } else {
           debtorItems.push({ ledgerCode: reasonAccount, description, debit: fallbackAmt, credit: '', details: forDetails.details, detailsObjects: forDetails.detailsObjects });
           creditorItems.push({ ledgerCode: opAccount, description, debit: '', credit: fallbackAmt, details: opDetails.details, detailsObjects: opDetails.detailsObjects });
        }
     }
  }

  const items: any[] = [];
  let rowCounter = 1;
  for (const d of debtorItems) {
    items.push({ id: rowCounter, row: rowCounter, ...d });
    rowCounter++;
  }
  for (const c of creditorItems) {
    items.push({ id: rowCounter, row: rowCounter, ...c });
    rowCounter++;
  }

  return {
    isNewFromOtherForm: true,
    documentType: documentType,
    documentRef: documentRef,
    sourceDocDate: values.date,
    voucherDate: values.date ? moment(toEnglishDigits(values.date), "jYYYY/jMM/jDD").locale("en").format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
    referenceNumber: values.number,
    description: description,
    voucherType: targetVoucherType || { title: 'هزینه های عمومی' },
    voucherNature: 'عادی',
    status: 'تایید شده',
    items: items
  };
}
