"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentAccountingInfoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_accounting_info_entity_1 = require("../../domain/entities/document-accounting-info.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let DocumentAccountingInfoService = class DocumentAccountingInfoService {
    constructor(repository, requestContextService, idGenerationService, dataSource) {
        this.repository = repository;
        this.requestContextService = requestContextService;
        this.idGenerationService = idGenerationService;
        this.dataSource = dataSource;
    }
    async getAccountInfoForDocument(documentType, documentRef) {
        const items = [];
        try {
            if (documentType === 'ReceivedChequeOperation') {
                const opRows = await this.dataSource.query(`
          SELECT 
            o."OperationType",
            o."BankAccountRef",
            ba."AccountRef" as "BankHeaderAccountRef",
            COALESCE(bda."DetailedAccountID", bda2."DetailedAccountID") as "BankHeaderDetailedAccountID",
            
            o."RealizerRef",
            o."RealizerRef" as "RealizerDetailedAccountID",
            
            i."ReceivedChequeOperationItemID" as "RowRef",
            i."ReceiptChequeRef",
            i."CashRef" as "ItemCashRef",
            icda."DetailedAccountID" as "ItemCashDetailedAccountID",
            i."ChequeStatus",
            
            rc."AccountingSettingRef" as "ChequeAccountingSettingRef",
            cs."AccountRef" as "ChequeSettingAccountRef",
            cs_assign."AccountRef" as "AssignToBankSettingAccountRef",
            cs_protest."AccountRef" as "ProtestSettingAccountRef",
            cs_cashing."AccountRef" as "CashingSettingAccountRef",
            rc_cash."DetailedAccountID" as "ChequeDetailedAccountID",
            COALESCE(rn_p."DetailedAccountID", rn_p2."DetailedAccountID", rc_cash."DetailedAccountID") as "ReceiptPartyDetailedAccountID",
            COALESCE(prev_bda."DetailedAccountID", prev_bda2."DetailedAccountID") as "PrevBankDetailedAccountID",
            rc."Amount" as "ChequeAmount"

          FROM "Rap"."ReceivedChequeOperation" o
          LEFT JOIN "Rap"."BankAccounts" ba ON o."BankAccountRef" = ba."BankAccountID"
          LEFT JOIN "Acc"."DetailedAccounts" bda ON bda."Code" = CAST(ba."DetailedCode" AS VARCHAR)
          LEFT JOIN "Acc"."DetailedAccounts" bda2 ON bda2."DetailedAccountID" = ba."DetailedCode"
          
          LEFT JOIN "Rap"."ReceivedChequeOperationItem" i ON i."OperationRef" = o."ReceivedChequeOperationID"
          
          LEFT JOIN LATERAL (
            SELECT ba_prev."DetailedCode"
            FROM "Rap"."ReceivedChequeOperationItem" i_prev
            JOIN "Rap"."ReceivedChequeOperation" o_prev ON i_prev."OperationRef" = o_prev."ReceivedChequeOperationID"
            LEFT JOIN "Rap"."BankAccounts" ba_prev ON o_prev."BankAccountRef" = ba_prev."BankAccountID"
            WHERE i_prev."ReceiptChequeRef" = i."ReceiptChequeRef" AND o_prev."OperationType" = 1
            ORDER BY o_prev."ReceivedChequeOperationID" DESC
            LIMIT 1
          ) prev_assign ON true
          LEFT JOIN "Acc"."DetailedAccounts" prev_bda ON prev_bda."Code" = CAST(prev_assign."DetailedCode" AS VARCHAR)
          LEFT JOIN "Acc"."DetailedAccounts" prev_bda2 ON prev_bda2."DetailedAccountID" = prev_assign."DetailedCode"
          
          LEFT JOIN "Rap"."Cashes" icash ON i."CashRef" = icash."CashID"
          LEFT JOIN "Acc"."DetailedAccounts" icda ON icash."DetailedAccountID" = icda."DetailedAccountID"
          
          LEFT JOIN "Rap"."ReceiptCheque" rc ON i."ReceiptChequeRef" = rc."ReceiptChequeID"
          LEFT JOIN "Rap"."ReceiptNotifications" rn ON rc."ReceiptNotificationRef" = rn."ReceiptNotificationID"
          LEFT JOIN "Gnr"."Parties" rn_p ON rn."PartyRef" = rn_p."PartyID"
          LEFT JOIN "Acc"."DetailedAccounts" rn_p2 ON rn_p2."DetailedAccountID" = rn."PartyRef"
          LEFT JOIN "Rap"."Cashes" rc_cash ON rc."CashRef" = rc_cash."CashID"
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" cs ON rc."AccountingSettingRef" = cs."RecieptAndPaymentAccountingSettingID"
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" cs_assign ON cs_assign."RecieptAndPaymentAccountingSettingID" = (
              SELECT "RecieptAndPaymentAccountingSettingID" FROM "Rap"."RecieptAndPaymentAccountingSetting"
              WHERE "usedEntryType" = 1 AND "operationType" = 6 AND "CompanyRef" = o."CompanyRef" AND "termType" IN (cs."termType", 4)
              ORDER BY CASE WHEN "termType" = cs."termType" THEN 1 ELSE 2 END LIMIT 1
          )
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" cs_protest ON cs_protest."RecieptAndPaymentAccountingSettingID" = (
              SELECT "RecieptAndPaymentAccountingSettingID" FROM "Rap"."RecieptAndPaymentAccountingSetting"
              WHERE "usedEntryType" = 1 AND "operationType" = 8 AND "CompanyRef" = o."CompanyRef" AND "termType" IN (cs."termType", 4)
              ORDER BY CASE WHEN "termType" = cs."termType" THEN 1 ELSE 2 END LIMIT 1
          )
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" cs_cashing ON cs_cashing."RecieptAndPaymentAccountingSettingID" = (
              SELECT "RecieptAndPaymentAccountingSettingID" FROM "Rap"."RecieptAndPaymentAccountingSetting"
              WHERE "usedEntryType" = 1 AND "operationType" = 11 AND "CompanyRef" = o."CompanyRef" AND "termType" IN (cs."termType", 4)
              ORDER BY CASE WHEN "termType" = cs."termType" THEN 1 ELSE 2 END LIMIT 1
          )

          WHERE o."ReceivedChequeOperationID" = $1
        `, [documentRef]);
                const extract = (row, col) => row ? (row[col] || row[col.toLowerCase()] || null) : null;
                const getRelatedDetailedAccounts = async (accountId) => {
                    if (!accountId)
                        return [];
                    try {
                        const related = await this.dataSource.query(`
              SELECT r."DetailedLevel" as "detailedLevel", r."DetailedTypesID" as "detailedTypeId", t."Title" as "title"
              FROM "Acc"."AccountsRelatedDeatailedAccounts" r
              LEFT JOIN "Acc"."DetailedTypes" t ON r."DetailedTypesID" = t."DetailedTypesID"
              WHERE r."AccountID" = $1
            `, [accountId]);
                        return related.map((r) => ({
                            detailedLevel: Number(r.detailedLevel !== undefined ? r.detailedLevel : r.DetailedLevel),
                            detailedType: {
                                detailedTypesId: Number(r.detailedTypeId !== undefined ? r.detailedTypeId : r.DetailedTypesID),
                                title: r.title !== undefined ? r.title : r.Title
                            }
                        }));
                    }
                    catch (err) {
                        return [];
                    }
                };
                const fetchAccountWithHierarchy = async (accountId) => {
                    if (!accountId)
                        return null;
                    const accRows = await this.dataSource.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title, "ParentID" as "parentId" FROM "Acc"."Accounts" WHERE "AccountID" = $1`, [accountId]);
                    if (accRows.length === 0)
                        return null;
                    const acc = {
                        id: Number(extract(accRows[0], 'id')),
                        code: extract(accRows[0], 'code'),
                        title: extract(accRows[0], 'title'),
                        parentId: extract(accRows[0], 'parentId') ? Number(extract(accRows[0], 'parentId')) : null,
                        parent: null
                    };
                    return acc;
                };
                const resolveAccounts = async (opAccountId, opDetailedAccountId, forAccountId, rowRef, rowType, defaultData, overridePartyDetailedAccountId, overrideOpPartyDetailedAccountId, bankDetailedAccountId, amount, overrideForPartyDetailedAccountId, isReverse) => {
                    let opAccountInfo = null;
                    let forAccountInfo = null;
                    if (opAccountId) {
                        const fullAcc = await fetchAccountWithHierarchy(opAccountId);
                        if (fullAcc) {
                            opAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(opAccountId)
                            };
                        }
                    }
                    if (forAccountId) {
                        const fullAcc = await fetchAccountWithHierarchy(forAccountId);
                        if (fullAcc) {
                            forAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(forAccountId)
                            };
                        }
                    }
                    const effectivePartyDetailedAccountId = overridePartyDetailedAccountId;
                    if (!forAccountInfo && effectivePartyDetailedAccountId) {
                        try {
                            const related = await this.dataSource.query(`
                SELECT rel."AccountID"
                FROM "Acc"."DetailedAccounts" d
                JOIN "Acc"."AccountsRelatedDeatailedAccounts" rel ON d."DetailedTypesID" = rel."DetailedTypesID"
                WHERE d."DetailedAccountID" = $1
                LIMIT 1
              `, [effectivePartyDetailedAccountId]);
                            if (related.length > 0) {
                                const accountId = extract(related[0], 'AccountID');
                                if (accountId) {
                                    const fullAcc = await fetchAccountWithHierarchy(accountId);
                                    if (fullAcc) {
                                        forAccountInfo = {
                                            ...fullAcc,
                                            relatedDetailedAccounts: await getRelatedDetailedAccounts(accountId)
                                        };
                                    }
                                }
                            }
                        }
                        catch (err) { }
                    }
                    items.push({
                        rowType,
                        rowRef,
                        opAccountInfo,
                        forAccountInfo,
                        suggestedOpDetailedAccountId: opDetailedAccountId,
                        suggestedPartyDetailedAccountId: effectivePartyDetailedAccountId,
                        suggestedOpPartyDetailedAccountId: overrideOpPartyDetailedAccountId !== undefined ? overrideOpPartyDetailedAccountId : effectivePartyDetailedAccountId,
                        suggestedForPartyDetailedAccountId: overrideForPartyDetailedAccountId !== undefined ? overrideForPartyDetailedAccountId : effectivePartyDetailedAccountId,
                        suggestedBankDetailedAccountId: bankDetailedAccountId,
                        amount: Number(amount || 0),
                        defaultData,
                        isReverse: !!isReverse
                    });
                };
                for (const row of opRows) {
                    const operationType = extract(row, 'OperationType');
                    const rowRef = extract(row, 'RowRef');
                    const receiptChequeRef = extract(row, 'ReceiptChequeRef');
                    const receiptPartyDetailedAccountId = extract(row, 'ReceiptPartyDetailedAccountID');
                    console.log('Service - rowRef:', rowRef, 'receiptPartyDetailedAccountId:', receiptPartyDetailedAccountId);
                    let opAccountId = null;
                    let opDetailedAccountId = null;
                    let forAccountId = extract(row, 'ChequeSettingAccountRef');
                    let forDetailedAccountId = extract(row, 'ChequeDetailedAccountID') || extract(row, 'ItemCashDetailedAccountID');
                    if (operationType == 1) {
                        opAccountId = extract(row, 'AssignToBankSettingAccountRef') || extract(row, 'BankHeaderAccountRef') || extract(row, 'ChequeSettingAccountRef');
                        opDetailedAccountId = extract(row, 'PrevBankDetailedAccountID') || extract(row, 'BankHeaderDetailedAccountID');
                        forAccountId = extract(row, 'ChequeSettingAccountRef');
                    }
                    else if (operationType == 3) {
                        opAccountId = extract(row, 'BankHeaderAccountRef');
                        opDetailedAccountId = extract(row, 'PrevBankDetailedAccountID') || extract(row, 'BankHeaderDetailedAccountID');
                    }
                    else if (operationType == 2) {
                        const chequeStatus = extract(row, 'ChequeStatus');
                        if (chequeStatus == 1) {
                            opAccountId = extract(row, 'AssignToBankSettingAccountRef') || extract(row, 'ChequeSettingAccountRef');
                            opDetailedAccountId = extract(row, 'PrevBankDetailedAccountID') || extract(row, 'BankHeaderDetailedAccountID');
                            forAccountId = extract(row, 'BankHeaderAccountRef');
                            forDetailedAccountId = extract(row, 'BankHeaderDetailedAccountID');
                        }
                        else if (chequeStatus == 2) {
                            opAccountId = extract(row, 'AssignToBankSettingAccountRef') || extract(row, 'ChequeSettingAccountRef');
                            opDetailedAccountId = extract(row, 'PrevBankDetailedAccountID') || extract(row, 'BankHeaderDetailedAccountID');
                            forAccountId = extract(row, 'ProtestSettingAccountRef') || extract(row, 'ChequeSettingAccountRef');
                            forDetailedAccountId = extract(row, 'RealizerDetailedAccountID');
                        }
                        else {
                            opAccountId = extract(row, 'ChequeSettingAccountRef');
                            opDetailedAccountId = extract(row, 'RealizerDetailedAccountID');
                        }
                    }
                    else if (operationType == 4) {
                        opAccountId = extract(row, 'CashingSettingAccountRef') || extract(row, 'ChequeSettingAccountRef');
                        opDetailedAccountId = extract(row, 'RealizerDetailedAccountID');
                    }
                    if (!opAccountId) {
                        const defaultAcc = await this.dataSource.query(`SELECT "AccountID" FROM "Acc"."Accounts" LIMIT 1`);
                        if (defaultAcc.length > 0)
                            opAccountId = extract(defaultAcc[0], 'AccountID');
                    }
                    if (!forAccountId) {
                        const defaultAcc = await this.dataSource.query(`SELECT "AccountID" FROM "Acc"."Accounts" LIMIT 1`);
                        if (defaultAcc.length > 0)
                            forAccountId = extract(defaultAcc[0], 'AccountID');
                    }
                    let defaultData = null;
                    if (receiptChequeRef) {
                        const savedAcc = await this.dataSource.query(`
                    SELECT * FROM "Rap"."DocumentAccountingInfo"
                    WHERE "DocumentType" = 'ReceiptNotification' AND "RowType" = 'چک' AND "RowRef" = $1
                `, [receiptChequeRef]);
                        if (savedAcc.length > 0) {
                            defaultData = {
                                forDetail1Ref: extract(savedAcc[0], 'OpDetail1Ref'),
                                forDetail2Ref: extract(savedAcc[0], 'OpDetail2Ref'),
                                forDetail3Ref: extract(savedAcc[0], 'OpDetail3Ref'),
                                forDetail4Ref: extract(savedAcc[0], 'OpDetail4Ref'),
                                forDetail5Ref: extract(savedAcc[0], 'OpDetail5Ref'),
                                forDetail6Ref: extract(savedAcc[0], 'OpDetail6Ref')
                            };
                        }
                    }
                    const overrideOpParty = (operationType == 1 || operationType == 4 || (operationType == 2 && !extract(row, 'ChequeStatus'))) ? opDetailedAccountId : receiptPartyDetailedAccountId;
                    await resolveAccounts(opAccountId, opDetailedAccountId, forAccountId, rowRef, 'چک دریافتنی', defaultData, forDetailedAccountId, overrideOpParty, extract(row, 'BankHeaderDetailedAccountID'), extract(row, 'ChequeAmount'), receiptPartyDetailedAccountId, (operationType == 2 && extract(row, 'ChequeStatus') == 1));
                }
            }
            if (documentType === 'PaidDocumentClearing') {
                const pdcRows = await this.dataSource.query(`
          SELECT 
            i."PaidDocumentClearingItemID" as "RowRef",
            i."DocumentType",
            pdc."BankAccountRef",
            ba."AccountRef" as "BankHeaderAccountRef",
            COALESCE(bda."DetailedAccountID", bda2."DetailedAccountID") as "BankHeaderDetailedAccountID",
            pc."AccountingSettingRef" as "ChequeAccountingSettingRef",
            cs."AccountRef" as "ChequeSettingAccountRef",
            pc_ba_da."DetailedAccountID" as "ChequeBankDetailedAccountID",
            pn_p."DetailedAccountID" as "PaymentPartyDetailedAccountID",
            ppn."AccountingSettingRef" as "PromissoryNoteAccountingSettingRef",
            pns."AccountRef" as "PromissoryNoteSettingAccountRef"
          FROM "Rap"."PaidDocumentClearing" pdc
          JOIN "Rap"."PaidDocumentClearingItem" i ON i."PaidDocumentClearingRef" = pdc."PaidDocumentClearingID"
          LEFT JOIN "Rap"."BankAccounts" ba ON pdc."BankAccountRef" = ba."BankAccountID"
          LEFT JOIN "Acc"."DetailedAccounts" bda ON bda."Code" = CAST(ba."DetailedCode" AS VARCHAR)
          LEFT JOIN "Acc"."DetailedAccounts" bda2 ON bda2."DetailedAccountID" = ba."DetailedCode"
          LEFT JOIN "Rap"."PaymentCheque" pc ON i."DocumentType" = 'cheque' AND i."DocumentId" = pc."PaymentChequeID"
          LEFT JOIN "Rap"."BankAccounts" pc_ba ON pc."BankAccountRef" = pc_ba."BankAccountID"
          LEFT JOIN "Acc"."DetailedAccounts" pc_ba_da ON pc_ba_da."Code" = CAST(pc_ba."DetailedCode" AS VARCHAR)
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" cs ON pc."AccountingSettingRef" = cs."RecieptAndPaymentAccountingSettingID"
          LEFT JOIN "Rap"."PaymentNotifications" pn ON pc."PaymentNotificationRef" = pn."PaymentNotificationID"
          LEFT JOIN "Gnr"."Parties" party ON pn."PartyRef" = party."PartyID"
          LEFT JOIN "Acc"."DetailedAccounts" pn_p ON party."DetailedAccountID" = pn_p."DetailedAccountID"
          LEFT JOIN "Rap"."PaymentPromissoryNote" ppn ON i."DocumentType" = 'promissory_note' AND i."DocumentId" = ppn."PaymentPromissoryNoteID"
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" pns ON ppn."AccountingSettingRef" = pns."RecieptAndPaymentAccountingSettingID"
          WHERE pdc."PaidDocumentClearingID" = $1
        `, [documentRef]);
                const extract = (row, col) => row ? (row[col] || row[col.toLowerCase()] || null) : null;
                const getRelatedDetailedAccounts = async (accountId) => {
                    if (!accountId)
                        return [];
                    try {
                        const related = await this.dataSource.query(`
              SELECT r."DetailedLevel" as "detailedLevel", r."DetailedTypesID" as "detailedTypeId", t."Title" as "title"
              FROM "Acc"."AccountsRelatedDeatailedAccounts" r
              LEFT JOIN "Acc"."DetailedTypes" t ON r."DetailedTypesID" = t."DetailedTypesID"
              WHERE r."AccountID" = $1
            `, [accountId]);
                        return related.map((r) => ({
                            detailedLevel: Number(r.detailedLevel !== undefined ? r.detailedLevel : r.DetailedLevel),
                            detailedType: {
                                detailedTypesId: Number(r.detailedTypeId !== undefined ? r.detailedTypeId : r.DetailedTypesID),
                                title: r.title !== undefined ? r.title : r.Title
                            }
                        }));
                    }
                    catch (err) {
                        return [];
                    }
                };
                const fetchAccountWithHierarchy = async (accountId) => {
                    if (!accountId)
                        return null;
                    const accRows = await this.dataSource.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title, "ParentID" as "parentId" FROM "Acc"."Accounts" WHERE "AccountID" = $1`, [accountId]);
                    if (accRows.length === 0)
                        return null;
                    const acc = {
                        id: Number(extract(accRows[0], 'id')),
                        code: extract(accRows[0], 'code'),
                        title: extract(accRows[0], 'title'),
                        parentId: extract(accRows[0], 'parentId') ? Number(extract(accRows[0], 'parentId')) : null,
                        parent: null
                    };
                    return acc;
                };
                const resolveAccounts = async (opAccountId, opDetailedAccountId, forAccountId, rowRef, rowType, defaultData, overridePartyDetailedAccountId, overrideOpPartyDetailedAccountId, bankDetailedAccountId, amount, overrideForPartyDetailedAccountId, isReverse) => {
                    let opAccountInfo = null;
                    let forAccountInfo = null;
                    if (opAccountId) {
                        const fullAcc = await fetchAccountWithHierarchy(opAccountId);
                        if (fullAcc) {
                            opAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(opAccountId)
                            };
                        }
                    }
                    if (forAccountId) {
                        const fullAcc = await fetchAccountWithHierarchy(forAccountId);
                        if (fullAcc) {
                            forAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(forAccountId)
                            };
                        }
                    }
                    const effectivePartyDetailedAccountId = overridePartyDetailedAccountId;
                    if (!forAccountInfo && effectivePartyDetailedAccountId) {
                        try {
                            const related = await this.dataSource.query(`
                SELECT rel."AccountID"
                FROM "Acc"."DetailedAccounts" d
                JOIN "Acc"."AccountsRelatedDeatailedAccounts" rel ON d."DetailedTypesID" = rel."DetailedTypesID"
                WHERE d."DetailedAccountID" = $1
                LIMIT 1
              `, [effectivePartyDetailedAccountId]);
                            if (related.length > 0) {
                                const accountId = extract(related[0], 'AccountID');
                                if (accountId) {
                                    const fullAcc = await fetchAccountWithHierarchy(accountId);
                                    if (fullAcc) {
                                        forAccountInfo = {
                                            ...fullAcc,
                                            relatedDetailedAccounts: await getRelatedDetailedAccounts(accountId)
                                        };
                                    }
                                }
                            }
                        }
                        catch (err) { }
                    }
                    items.push({
                        rowType,
                        rowRef,
                        opAccountInfo,
                        forAccountInfo,
                        suggestedOpDetailedAccountId: opDetailedAccountId,
                        suggestedPartyDetailedAccountId: effectivePartyDetailedAccountId,
                        suggestedOpPartyDetailedAccountId: overrideOpPartyDetailedAccountId !== undefined ? overrideOpPartyDetailedAccountId : effectivePartyDetailedAccountId,
                        suggestedForPartyDetailedAccountId: overrideForPartyDetailedAccountId !== undefined ? overrideForPartyDetailedAccountId : effectivePartyDetailedAccountId,
                        suggestedBankDetailedAccountId: bankDetailedAccountId,
                        amount: Number(amount || 0),
                        defaultData,
                        isReverse: !!isReverse
                    });
                };
                for (const row of pdcRows) {
                    const docType = extract(row, 'DocumentType');
                    const rowRef = extract(row, 'RowRef');
                    const opAccountId = extract(row, 'BankHeaderAccountRef');
                    const opDetailedAccountId = extract(row, 'BankHeaderDetailedAccountID');
                    let forAccountId = null;
                    let forDetailedAccountId = null;
                    const paymentPartyDetailedAccountId = extract(row, 'PaymentPartyDetailedAccountID');
                    if (docType === 'cheque') {
                        forAccountId = extract(row, 'ChequeSettingAccountRef');
                        forDetailedAccountId = extract(row, 'ChequeBankDetailedAccountID');
                    }
                    else if (docType === 'promissory_note') {
                        forAccountId = extract(row, 'PromissoryNoteSettingAccountRef');
                        forDetailedAccountId = null;
                    }
                    let finalOpAccountId = opAccountId;
                    if (!finalOpAccountId) {
                        const defaultAcc = await this.dataSource.query(`SELECT "AccountID" FROM "Acc"."Accounts" LIMIT 1`);
                        if (defaultAcc.length > 0)
                            finalOpAccountId = extract(defaultAcc[0], 'AccountID');
                    }
                    let finalForAccountId = forAccountId;
                    if (!finalForAccountId) {
                        const defaultAcc = await this.dataSource.query(`SELECT "AccountID" FROM "Acc"."Accounts" LIMIT 1`);
                        if (defaultAcc.length > 0)
                            finalForAccountId = extract(defaultAcc[0], 'AccountID');
                    }
                    await resolveAccounts(finalOpAccountId, opDetailedAccountId, finalForAccountId, rowRef, docType === 'cheque' ? 'چک' : 'سفته', null, paymentPartyDetailedAccountId, null, extract(row, 'BankHeaderDetailedAccountID'));
                }
            }
            if (documentType === 'PettyCashSummary') {
                const pcRows = await this.dataSource.query(`
          SELECT 
            i."pettyCashSummaryItemId" as "RowRef",
            pc."AccountRef" as "OpAccountRef",
            p."DetailedAccountID" as "PartyDetailedAccountID",
            r."AccountRef" as "ForAccountRef",
            i."Amount" as "ItemAmount"
          FROM "Rap"."PettyCashSummaries" x
          JOIN "Rap"."PettyCashSummaryItems" i ON i."PettyCashSummaryRef" = x."pettyCashSummaryId"
          LEFT JOIN "Rap"."PettyCashes" pc ON x."PettyCashRef" = pc."PettyCashID"
          LEFT JOIN "Gnr"."Parties" p ON pc."PartyRef" = p."PartyID"
          LEFT JOIN "Rap"."Reasons" r ON i."ReasonRef" = r."RapReasonID"
          WHERE x."pettyCashSummaryId" = $1
        `, [documentRef]);
                const extract = (row, col) => row ? (row[col] || row[col.toLowerCase()] || null) : null;
                const getRelatedDetailedAccounts = async (accountId) => {
                    if (!accountId)
                        return [];
                    try {
                        const related = await this.dataSource.query(`
              SELECT r."DetailedLevel" as "detailedLevel", r."DetailedTypesID" as "detailedTypeId", t."Title" as "title"
              FROM "Acc"."AccountsRelatedDeatailedAccounts" r
              LEFT JOIN "Acc"."DetailedTypes" t ON r."DetailedTypesID" = t."DetailedTypesID"
              WHERE r."AccountID" = $1
            `, [accountId]);
                        return related.map((r) => ({
                            detailedLevel: Number(r.detailedLevel !== undefined ? r.detailedLevel : r.DetailedLevel),
                            detailedType: {
                                detailedTypesId: Number(r.detailedTypeId !== undefined ? r.detailedTypeId : r.DetailedTypesID),
                                title: r.title !== undefined ? r.title : r.Title
                            }
                        }));
                    }
                    catch (err) {
                        return [];
                    }
                };
                const fetchAccountWithHierarchy = async (accountId) => {
                    if (!accountId)
                        return null;
                    const accRows = await this.dataSource.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title, "ParentID" as "parentId" FROM "Acc"."Accounts" WHERE "AccountID" = $1`, [accountId]);
                    if (accRows.length === 0)
                        return null;
                    const acc = {
                        id: Number(extract(accRows[0], 'id')),
                        code: extract(accRows[0], 'code'),
                        title: extract(accRows[0], 'title'),
                        parentId: extract(accRows[0], 'parentId') ? Number(extract(accRows[0], 'parentId')) : null,
                        parent: null
                    };
                    return acc;
                };
                const resolveAccounts = async (opAccountId, opDetailedAccountId, forAccountId, rowRef, rowType, amount) => {
                    let opAccountInfo = null;
                    let forAccountInfo = null;
                    if (opAccountId) {
                        const fullAcc = await fetchAccountWithHierarchy(opAccountId);
                        if (fullAcc) {
                            opAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(opAccountId)
                            };
                        }
                    }
                    if (forAccountId) {
                        const fullAcc = await fetchAccountWithHierarchy(forAccountId);
                        if (fullAcc) {
                            forAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(forAccountId)
                            };
                        }
                    }
                    items.push({
                        rowType,
                        rowRef,
                        opAccountInfo,
                        forAccountInfo,
                        suggestedOpDetailedAccountId: opDetailedAccountId,
                        suggestedPartyDetailedAccountId: null,
                        suggestedOpPartyDetailedAccountId: opDetailedAccountId,
                        suggestedForPartyDetailedAccountId: null,
                        amount: Number(amount || 0),
                        defaultData: null,
                        isReverse: false
                    });
                };
                for (const row of pcRows) {
                    const rowRef = extract(row, 'RowRef');
                    const opAccountId = extract(row, 'OpAccountRef');
                    const opDetailedAccountId = extract(row, 'PartyDetailedAccountID');
                    const forAccountId = extract(row, 'ForAccountRef');
                    const amount = extract(row, 'ItemAmount');
                    let finalOpAccountId = opAccountId;
                    if (!finalOpAccountId) {
                        const defaultAcc = await this.dataSource.query(`SELECT "AccountID" FROM "Acc"."Accounts" LIMIT 1`);
                        if (defaultAcc.length > 0)
                            finalOpAccountId = extract(defaultAcc[0], 'AccountID');
                    }
                    let finalForAccountId = forAccountId;
                    if (!finalForAccountId) {
                        const defaultAcc = await this.dataSource.query(`SELECT "AccountID" FROM "Acc"."Accounts" LIMIT 1`);
                        if (defaultAcc.length > 0)
                            finalForAccountId = extract(defaultAcc[0], 'AccountID');
                    }
                    await resolveAccounts(finalOpAccountId, opDetailedAccountId, finalForAccountId, rowRef, 'خلاصه تنخواه', amount);
                }
            }
            if (documentType === 'ReceiptNotification' || documentType === 'PaymentNotification') {
                const isReceipt = documentType === 'ReceiptNotification';
                const refCol = isReceipt ? '"ReceiptNotificationRef"' : '"PaymentNotificationRef"';
                const extract = (row, col) => row ? (row[col] || row[col.toLowerCase()] || null) : null;
                let headerPartyDetailedAccountId = null;
                try {
                    const docIdCol = isReceipt ? 'ReceiptNotificationID' : 'PaymentNotificationID';
                    const headerRows = await this.dataSource.query(`
            SELECT p."DetailedAccountID"
            FROM "Rap"."${isReceipt ? 'ReceiptNotifications' : 'PaymentNotifications'}" x
            LEFT JOIN "Gnr"."Parties" p ON x."PartyRef" = p."PartyID"
            WHERE x."${docIdCol}" = $1
          `, [documentRef]);
                    if (headerRows.length > 0) {
                        headerPartyDetailedAccountId = extract(headerRows[0], 'DetailedAccountID');
                    }
                }
                catch (err) {
                    console.error('Error fetching headerPartyDetailedAccountId', err);
                }
                const getRelatedDetailedAccounts = async (accountId) => {
                    if (!accountId)
                        return [];
                    try {
                        const related = await this.dataSource.query(`
              SELECT r."DetailedLevel" as "detailedLevel", r."DetailedTypesID" as "detailedTypeId", t."Title" as "title"
              FROM "Acc"."AccountsRelatedDeatailedAccounts" r
              LEFT JOIN "Acc"."DetailedTypes" t ON r."DetailedTypesID" = t."DetailedTypesID"
              WHERE r."AccountID" = $1
            `, [accountId]);
                        return related.map((r) => ({
                            detailedLevel: Number(r.detailedLevel !== undefined ? r.detailedLevel : r.DetailedLevel),
                            detailedType: {
                                detailedTypesId: Number(r.detailedTypeId !== undefined ? r.detailedTypeId : r.DetailedTypesID),
                                title: r.title !== undefined ? r.title : r.Title
                            }
                        }));
                    }
                    catch (err) {
                        return [];
                    }
                };
                const fetchAccountWithHierarchy = async (accountId) => {
                    if (!accountId)
                        return null;
                    const accRows = await this.dataSource.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title, "ParentID" as "parentId" FROM "Acc"."Accounts" WHERE "AccountID" = $1`, [accountId]);
                    if (accRows.length === 0)
                        return null;
                    const acc = {
                        id: Number(extract(accRows[0], 'id')),
                        code: extract(accRows[0], 'code'),
                        title: extract(accRows[0], 'title'),
                        parentId: extract(accRows[0], 'parentId') ? Number(extract(accRows[0], 'parentId')) : null,
                        parent: null
                    };
                    if (acc.parentId) {
                        const parentRows = await this.dataSource.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title, "ParentID" as "parentId" FROM "Acc"."Accounts" WHERE "AccountID" = $1`, [acc.parentId]);
                        if (parentRows.length > 0) {
                            acc.parent = {
                                id: Number(extract(parentRows[0], 'id')),
                                code: extract(parentRows[0], 'code'),
                                title: extract(parentRows[0], 'title'),
                                parentId: extract(parentRows[0], 'parentId') ? Number(extract(parentRows[0], 'parentId')) : null,
                                parent: null
                            };
                            if (acc.parent.parentId) {
                                const gpRows = await this.dataSource.query(`SELECT "AccountID" as id, "Code" as code, "Title" as title, "ParentID" as "parentId" FROM "Acc"."Accounts" WHERE "AccountID" = $1`, [acc.parent.parentId]);
                                if (gpRows.length > 0) {
                                    acc.parent.parent = {
                                        id: Number(extract(gpRows[0], 'id')),
                                        code: extract(gpRows[0], 'code'),
                                        title: extract(gpRows[0], 'title'),
                                        parentId: extract(gpRows[0], 'parentId') ? Number(extract(gpRows[0], 'parentId')) : null
                                    };
                                }
                            }
                        }
                    }
                    return acc;
                };
                const resolveAccounts = async (opAccountId, opDetailedAccountId, forAccountId, rowRef, rowType, defaultData, overridePartyDetailedAccountId, overrideOpPartyDetailedAccountId) => {
                    if (!opAccountId && opDetailedAccountId) {
                        try {
                            const related = await this.dataSource.query(`
                SELECT rel."AccountID" 
                FROM "Acc"."DetailedAccounts" d
                JOIN "Acc"."AccountsRelatedDeatailedAccounts" rel ON d."DetailedTypesID" = rel."DetailedTypesID"
                WHERE d."DetailedAccountID" = $1
                LIMIT 1
              `, [opDetailedAccountId]);
                            if (related.length > 0) {
                                opAccountId = extract(related[0], 'AccountID');
                            }
                        }
                        catch (err) { }
                    }
                    let opAccountInfo = null;
                    let forAccountInfo = null;
                    if (opAccountId) {
                        const fullAcc = await fetchAccountWithHierarchy(opAccountId);
                        if (fullAcc) {
                            opAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(opAccountId)
                            };
                        }
                    }
                    if (!forAccountId) {
                        const idCol = isReceipt ? 'ReceiptNotificationID' : 'PaymentNotificationID';
                        const mainDoc = await this.dataSource.query(`SELECT "ReasonRef" FROM "Rap"."${isReceipt ? 'ReceiptNotifications' : 'PaymentNotifications'}" WHERE "${idCol}" = $1`, [documentRef]);
                        if (mainDoc.length > 0) {
                            const reasonRef = extract(mainDoc[0], 'ReasonRef');
                            if (reasonRef) {
                                const forAcc = await this.dataSource.query(`
                    SELECT r."AccountRef" as "AccountID"
                    FROM "Rap"."Reasons" r
                    WHERE r."RapReasonID" = $1
                  `, [reasonRef]);
                                if (forAcc.length > 0) {
                                    const accountId = extract(forAcc[0], 'AccountID');
                                    if (accountId) {
                                        const fullAcc = await fetchAccountWithHierarchy(accountId);
                                        if (fullAcc) {
                                            forAccountInfo = {
                                                ...fullAcc,
                                                relatedDetailedAccounts: await getRelatedDetailedAccounts(accountId)
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        const fullAcc = await fetchAccountWithHierarchy(forAccountId);
                        if (fullAcc) {
                            forAccountInfo = {
                                ...fullAcc,
                                relatedDetailedAccounts: await getRelatedDetailedAccounts(forAccountId)
                            };
                        }
                    }
                    const effectivePartyDetailedAccountId = overridePartyDetailedAccountId || headerPartyDetailedAccountId;
                    if (!forAccountInfo && effectivePartyDetailedAccountId) {
                        try {
                            const related = await this.dataSource.query(`
                SELECT rel."AccountID"
                FROM "Acc"."DetailedAccounts" d
                JOIN "Acc"."AccountsRelatedDeatailedAccounts" rel ON d."DetailedTypesID" = rel."DetailedTypesID"
                WHERE d."DetailedAccountID" = $1
                LIMIT 1
              `, [effectivePartyDetailedAccountId]);
                            if (related.length > 0) {
                                const accountId = extract(related[0], 'AccountID');
                                if (accountId) {
                                    const fullAcc = await fetchAccountWithHierarchy(accountId);
                                    if (fullAcc) {
                                        forAccountInfo = {
                                            ...fullAcc,
                                            relatedDetailedAccounts: await getRelatedDetailedAccounts(accountId)
                                        };
                                    }
                                }
                            }
                        }
                        catch (err) { }
                    }
                    items.push({
                        rowType,
                        rowRef,
                        opAccountInfo,
                        forAccountInfo,
                        suggestedOpDetailedAccountId: opDetailedAccountId,
                        suggestedPartyDetailedAccountId: effectivePartyDetailedAccountId,
                        suggestedOpPartyDetailedAccountId: overrideOpPartyDetailedAccountId !== undefined ? overrideOpPartyDetailedAccountId : effectivePartyDetailedAccountId,
                        defaultData
                    });
                };
                const cashRows = await this.dataSource.query(`
          SELECT c."DetailedAccountID", x."ReasonRef", s."AccountRef" as "SettingAccountRef", r."AccountRef" as "ReasonAccountRef", x."${isReceipt ? 'ReceiptCashID' : 'PaymentCashID'}" as "RowRef"
          FROM "Rap"."${isReceipt ? 'ReceiptCash' : 'PaymentCash'}" x
          LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
          LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
          WHERE x.${refCol} = $1
        `, [documentRef]);
                for (const row of cashRows) {
                    let forAccountId = extract(row, 'ReasonAccountRef');
                    const reasonRef = extract(row, 'ReasonRef');
                    if (!forAccountId && reasonRef) {
                        const rs = await this.dataSource.query(`SELECT "AccountRef" FROM "Rap"."Reasons" WHERE "RapReasonID" = $1`, [reasonRef]);
                        if (rs.length > 0)
                            forAccountId = extract(rs[0], 'AccountRef');
                    }
                    await resolveAccounts(extract(row, 'SettingAccountRef'), extract(row, 'DetailedAccountID'), forAccountId, extract(row, 'RowRef'), 'نقد');
                }
                let chequeRows = [];
                if (isReceipt) {
                    chequeRows = await this.dataSource.query(`
            SELECT c."DetailedAccountID" as "CashDetailedAccountID", s."detailedType" as "DetailedType", x."ReasonRef", s."AccountRef" as "SettingAccountRef", r."AccountRef" as "ReasonAccountRef", x."ReceiptChequeID" as "RowRef"
            FROM "Rap"."ReceiptCheque" x
            LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
            LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
            LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
            WHERE x."ReceiptNotificationRef" = $1
          `, [documentRef]);
                }
                else {
                    chequeRows = await this.dataSource.query(`
            SELECT da."DetailedAccountID" as "CashDetailedAccountID", s."detailedType" as "DetailedType", x."ReasonRef", s."AccountRef" as "SettingAccountRef", r."AccountRef" as "ReasonAccountRef", x."PaymentChequeID" as "RowRef"
            FROM "Rap"."PaymentCheque" x
            LEFT JOIN "Rap"."BankAccounts" b ON x."BankAccountRef" = b."BankAccountID"
            LEFT JOIN "Acc"."DetailedAccounts" da ON da."Code" = CAST(b."DetailedCode" AS VARCHAR)
            LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
            LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
            WHERE x."PaymentNotificationRef" = $1
          `, [documentRef]);
                }
                for (const row of chequeRows) {
                    let forAccountId = extract(row, 'ReasonAccountRef');
                    const reasonRef = extract(row, 'ReasonRef');
                    if (!forAccountId && reasonRef) {
                        const rs = await this.dataSource.query(`SELECT "AccountRef" FROM "Rap"."Reasons" WHERE "RapReasonID" = $1`, [reasonRef]);
                        if (rs.length > 0)
                            forAccountId = extract(rs[0], 'AccountRef');
                    }
                    let opDetailedAccountId = extract(row, 'CashDetailedAccountID');
                    await resolveAccounts(extract(row, 'SettingAccountRef'), opDetailedAccountId, forAccountId, extract(row, 'RowRef'), 'چک');
                }
                const bankRows = await this.dataSource.query(`
          SELECT b."AccountRef" as "BankAccountRef", da."DetailedAccountID" as "DetailedAccountID", s."AccountRef" as "SettingAccountRef", x."ReasonRef", r."AccountRef" as "ReasonAccountRef", x."${isReceipt ? 'ReceiptDepositID' : 'PaymentWithdrawalID'}" as "RowRef"
          FROM "Rap"."${isReceipt ? 'ReceiptDeposit' : 'PaymentWithdrawal'}" x
          LEFT JOIN "Rap"."BankAccounts" b ON x."BankAccountRef" = b."BankAccountID"
          LEFT JOIN "Acc"."DetailedAccounts" da ON da."Code" = CAST(b."DetailedCode" AS VARCHAR)
          LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
          LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
          WHERE x.${refCol} = $1
        `, [documentRef]);
                for (const row of bankRows) {
                    await resolveAccounts(extract(row, 'SettingAccountRef') || extract(row, 'BankAccountRef'), extract(row, 'DetailedAccountID'), extract(row, 'ReasonAccountRef'), extract(row, 'RowRef'), isReceipt ? 'واریز به حساب' : 'برداشت از حساب');
                }
                let promissoryRows = [];
                if (isReceipt) {
                    promissoryRows = await this.dataSource.query(`
            SELECT c."DetailedAccountID" as "CashDetailedAccountID", s."detailedType" as "DetailedType", x."ReasonRef", s."AccountRef" as "SettingAccountRef", r."AccountRef" as "ReasonAccountRef", x."ReceiptPromissoryNoteID" as "RowRef"
            FROM "Rap"."ReceiptPromissoryNote" x
            LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
            LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
            LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
            WHERE x."ReceiptNotificationRef" = $1
          `, [documentRef]);
                }
                else {
                    promissoryRows = await this.dataSource.query(`
            SELECT s."detailedType" as "DetailedType", x."ReasonRef", s."AccountRef" as "SettingAccountRef", r."AccountRef" as "ReasonAccountRef", x."PaymentPromissoryNoteID" as "RowRef", c."DetailedAccountID" as "CashDetailedAccountID"
            FROM "Rap"."PaymentPromissoryNote" x
            LEFT JOIN "Rap"."PromissoryNoteItems" pni ON x."PromissoryNoteItemRef" = pni."PromissoryNoteItemID"
            LEFT JOIN "Rap"."PromissoryNotes" pn ON pni."PromissoryNoteRef" = pn."PromissoryNoteID"
            LEFT JOIN "Rap"."Cashes" c ON pn."CashRef" = c."CashID"
            LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
            LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
            WHERE x."PaymentNotificationRef" = $1
          `, [documentRef]);
                }
                for (const row of promissoryRows) {
                    let forAccountId = extract(row, 'ReasonAccountRef');
                    const reasonRef = extract(row, 'ReasonRef');
                    if (!forAccountId && reasonRef) {
                        const rs = await this.dataSource.query(`SELECT "AccountRef" FROM "Rap"."Reasons" WHERE "RapReasonID" = $1`, [reasonRef]);
                        if (rs.length > 0)
                            forAccountId = extract(rs[0], 'AccountRef');
                    }
                    let opDetailedAccountId = extract(row, 'CashDetailedAccountID') || null;
                    await resolveAccounts(extract(row, 'SettingAccountRef'), opDetailedAccountId, forAccountId, extract(row, 'RowRef'), 'سفته');
                }
                if (!isReceipt) {
                    const assignmentRows = await this.dataSource.query(`
              SELECT x."ReceiptChequeRef", x."ReasonRef", s."AccountRef" as "SettingAccountRef", r."AccountRef" as "ReasonAccountRef", x."PaymentAssignmentID" as "RowRef",
                     c."DetailedAccountID" as "OrigCashDetailedAccountID",
                     p."DetailedAccountID" as "OrigPartyDetailedAccountID"
              FROM "Rap"."PaymentAssignment" x
              LEFT JOIN "Rap"."ReceiptCheque" rc ON x."ReceiptChequeRef" = rc."ReceiptChequeID"
              LEFT JOIN "Rap"."ReceiptNotifications" rn ON rc."ReceiptNotificationRef" = rn."ReceiptNotificationID"
              LEFT JOIN "Gnr"."Parties" p ON rn."PartyRef" = p."PartyID"
              LEFT JOIN "Rap"."Cashes" c ON rc."CashRef" = c."CashID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              WHERE x.${refCol} = $1
            `, [documentRef]);
                    for (const row of assignmentRows) {
                        let defaultData = null;
                        const receiptChequeRef = extract(row, 'ReceiptChequeRef');
                        if (receiptChequeRef) {
                            const savedAcc = await this.dataSource.query(`
                        SELECT * FROM "Rap"."DocumentAccountingInfo"
                        WHERE "DocumentType" = 'ReceiptNotification' AND "RowType" = 'چک' AND "RowRef" = $1
                    `, [receiptChequeRef]);
                            if (savedAcc.length > 0) {
                                defaultData = {
                                    opDetail1Ref: extract(savedAcc[0], 'OpDetail1Ref'),
                                    opDetail2Ref: extract(savedAcc[0], 'OpDetail2Ref'),
                                    opDetail3Ref: extract(savedAcc[0], 'OpDetail3Ref'),
                                    opDetail4Ref: extract(savedAcc[0], 'OpDetail4Ref'),
                                    opDetail5Ref: extract(savedAcc[0], 'OpDetail5Ref'),
                                    opDetail6Ref: extract(savedAcc[0], 'OpDetail6Ref'),
                                    forDetail1Ref: extract(savedAcc[0], 'ForDetail1Ref'),
                                    forDetail2Ref: extract(savedAcc[0], 'ForDetail2Ref'),
                                    forDetail3Ref: extract(savedAcc[0], 'ForDetail3Ref'),
                                    forDetail4Ref: extract(savedAcc[0], 'ForDetail4Ref'),
                                    forDetail5Ref: extract(savedAcc[0], 'ForDetail5Ref'),
                                    forDetail6Ref: extract(savedAcc[0], 'ForDetail6Ref')
                                };
                            }
                        }
                        const origCashDetailedAccountId = extract(row, 'OrigCashDetailedAccountID');
                        const origPartyDetailedAccountId = extract(row, 'OrigPartyDetailedAccountID');
                        await resolveAccounts(extract(row, 'SettingAccountRef'), origCashDetailedAccountId, extract(row, 'ReasonAccountRef'), extract(row, 'RowRef'), 'واگذار به غیر', defaultData, null, origPartyDetailedAccountId);
                    }
                }
                if (isReceipt) {
                    const returnedAssignmentRows = await this.dataSource.query(`
              SELECT 
                x."ReceiptReturnedPaymentAssignmentID" as "RowRef",
                x."ReasonRef" as "XReasonRef",
                x."AccountingSettingRef" as "XAccountingSettingRef",
                x."CashRef" as "XCashRef",
                s."AccountRef" as "XSettingAccountRef",
                r."AccountRef" as "XReasonAccountRef",
                c."DetailedAccountID" as "XCashDetailedAccountID",
                pa."ReasonRef" as "OrigReasonRef",
                origSetting."AccountRef" as "OrigSettingAccountRef",
                origReason."AccountRef" as "OrigReasonAccountRef",
                p."DetailedAccountID" as "OrigPartyDetailedAccountID"
              FROM "Rap"."ReceiptReturnedPaymentAssignment" x
              LEFT JOIN "Rap"."PaymentAssignment" pa ON x."PaymentAssignmentRef" = pa."PaymentAssignmentID"
              LEFT JOIN "Rap"."PaymentNotifications" pn ON pa."PaymentNotificationRef" = pn."PaymentNotificationID"
              LEFT JOIN "Gnr"."Parties" p ON pn."PartyRef" = p."PartyID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" origSetting ON pa."AccountingSettingRef" = origSetting."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" origReason ON pa."ReasonRef" = origReason."RapReasonID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
              WHERE x.${refCol} = $1
            `, [documentRef]);
                    for (const row of returnedAssignmentRows) {
                        const opAccountId = extract(row, 'XSettingAccountRef') || extract(row, 'OrigSettingAccountRef');
                        const origPartyDetailedAccountId = extract(row, 'OrigPartyDetailedAccountID');
                        const opDetailedAccountId = extract(row, 'XCashDetailedAccountID') || origPartyDetailedAccountId || headerPartyDetailedAccountId;
                        const forAccountId = extract(row, 'XReasonAccountRef') || extract(row, 'OrigReasonAccountRef');
                        await resolveAccounts(opAccountId, opDetailedAccountId, forAccountId, extract(row, 'RowRef'), 'برگشت واگذار به غیر', null, origPartyDetailedAccountId);
                    }
                }
                if (isReceipt) {
                    const returnedChequeRows = await this.dataSource.query(`
              SELECT 
                x."ReceiptReturnedPaidChequeID" as "RowRef",
                x."ReasonRef" as "XReasonRef",
                x."AccountingSettingRef" as "XAccountingSettingRef",
                x."CashRef" as "XCashRef",
                s."AccountRef" as "XSettingAccountRef",
                r."AccountRef" as "XReasonAccountRef",
                c."DetailedAccountID" as "XCashDetailedAccountID",
                pc."ReasonRef" as "OrigReasonRef",
                origSetting."AccountRef" as "OrigSettingAccountRef",
                origReason."AccountRef" as "OrigReasonAccountRef",
                da."DetailedAccountID" as "OrigBankDetailedAccountID",
                p."DetailedAccountID" as "OrigPartyDetailedAccountID"
              FROM "Rap"."ReceiptReturnedPaidCheque" x
              LEFT JOIN "Rap"."PaymentCheque" pc ON x."PaymentChequeRef" = pc."PaymentChequeID"
              LEFT JOIN "Rap"."PaymentNotifications" pn ON pc."PaymentNotificationRef" = pn."PaymentNotificationID"
              LEFT JOIN "Gnr"."Parties" p ON pn."PartyRef" = p."PartyID"
              LEFT JOIN "Rap"."BankAccounts" b ON pc."BankAccountRef" = b."BankAccountID"
              LEFT JOIN "Acc"."DetailedAccounts" da ON da."Code" = CAST(b."DetailedCode" AS VARCHAR)
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" origSetting ON pc."AccountingSettingRef" = origSetting."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" origReason ON pc."ReasonRef" = origReason."RapReasonID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
              WHERE x."ReceiptNotificationRef" = $1
            `, [documentRef]);
                    for (const row of returnedChequeRows) {
                        const opAccountId = extract(row, 'XSettingAccountRef') || extract(row, 'OrigSettingAccountRef');
                        const origBankDetailedAccountId = extract(row, 'OrigBankDetailedAccountID');
                        const origPartyDetailedAccountId = extract(row, 'OrigPartyDetailedAccountID');
                        const opDetailedAccountId = extract(row, 'XCashDetailedAccountID') || origBankDetailedAccountId || headerPartyDetailedAccountId;
                        const forAccountId = extract(row, 'XReasonAccountRef') || extract(row, 'OrigReasonAccountRef');
                        await resolveAccounts(opAccountId, opDetailedAccountId, forAccountId, extract(row, 'RowRef'), 'استرداد چک پرداختنی', null, origPartyDetailedAccountId);
                    }
                }
                if (isReceipt) {
                    const returnedPromissoryRows = await this.dataSource.query(`
              SELECT 
                x."ReceiptReturnedPaymentPromissoryNoteID" as "RowRef",
                x."ReasonRef" as "XReasonRef",
                x."AccountingSettingRef" as "XAccountingSettingRef",
                s."AccountRef" as "XSettingAccountRef",
                r."AccountRef" as "XReasonAccountRef",
                ppn."ReasonRef" as "OrigReasonRef",
                origSetting."AccountRef" as "OrigSettingAccountRef",
                origReason."AccountRef" as "OrigReasonAccountRef",
                c."DetailedAccountID" as "XCashDetailedAccountID",
                p."DetailedAccountID" as "OrigPartyDetailedAccountID"
              FROM "Rap"."ReceiptReturnedPaymentPromissoryNote" x
              LEFT JOIN "Rap"."PaymentPromissoryNote" ppn ON x."PaymentPromissoryNoteRef" = ppn."PaymentPromissoryNoteID"
              LEFT JOIN "Rap"."PaymentNotifications" pno ON ppn."PaymentNotificationRef" = pno."PaymentNotificationID"
              LEFT JOIN "Gnr"."Parties" p ON pno."PartyRef" = p."PartyID"
              LEFT JOIN "Rap"."PromissoryNoteItems" pni ON ppn."PromissoryNoteItemRef" = pni."PromissoryNoteItemID"
              LEFT JOIN "Rap"."PromissoryNotes" pn ON pni."PromissoryNoteRef" = pn."PromissoryNoteID"
              LEFT JOIN "Rap"."Cashes" c ON pn."CashRef" = c."CashID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" origSetting ON ppn."AccountingSettingRef" = origSetting."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" origReason ON ppn."ReasonRef" = origReason."RapReasonID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              WHERE x."ReceiptNotificationRef" = $1
            `, [documentRef]);
                    for (const row of returnedPromissoryRows) {
                        const opAccountId = extract(row, 'XSettingAccountRef') || extract(row, 'OrigSettingAccountRef');
                        const origPartyDetailedAccountId = extract(row, 'OrigPartyDetailedAccountID');
                        const opDetailedAccountId = extract(row, 'XCashDetailedAccountID') || headerPartyDetailedAccountId;
                        const forAccountId = extract(row, 'XReasonAccountRef') || extract(row, 'OrigReasonAccountRef');
                        await resolveAccounts(opAccountId, opDetailedAccountId, forAccountId, extract(row, 'RowRef'), 'استرداد سفته پرداختنی', null, origPartyDetailedAccountId);
                    }
                }
                if (!isReceipt) {
                    const returnedChequeRows = await this.dataSource.query(`
              SELECT 
                x."PaymentReturnedReceivedChequeID" as "RowRef",
                x."ReasonRef" as "XReasonRef",
                x."AccountingSettingRef" as "XAccountingSettingRef",
                x."CashRef" as "XCashRef",
                s."AccountRef" as "XSettingAccountRef",
                r."AccountRef" as "XReasonAccountRef",
                c."DetailedAccountID" as "XCashDetailedAccountID",
                rc."ReasonRef" as "OrigReasonRef",
                origSetting."AccountRef" as "OrigSettingAccountRef",
                origReason."AccountRef" as "OrigReasonAccountRef",
                origCash."DetailedAccountID" as "OrigCashDetailedAccountID",
                p."DetailedAccountID" as "OrigPartyDetailedAccountID"
              FROM "Rap"."PaymentReturnedReceivedCheque" x
              LEFT JOIN "Rap"."ReceiptCheque" rc ON x."ReceiptChequeRef" = rc."ReceiptChequeID"
              LEFT JOIN "Rap"."ReceiptNotifications" rn ON rc."ReceiptNotificationRef" = rn."ReceiptNotificationID"
              LEFT JOIN "Gnr"."Parties" p ON rn."PartyRef" = p."PartyID"
              LEFT JOIN "Rap"."Cashes" origCash ON rc."CashRef" = origCash."CashID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" origSetting ON rc."AccountingSettingRef" = origSetting."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" origReason ON rc."ReasonRef" = origReason."RapReasonID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
              WHERE x."PaymentNotificationRef" = $1
            `, [documentRef]);
                    for (const row of returnedChequeRows) {
                        const opAccountId = extract(row, 'XSettingAccountRef') || extract(row, 'OrigSettingAccountRef');
                        const origCashDetailedAccountId = extract(row, 'OrigCashDetailedAccountID');
                        const origPartyDetailedAccountId = extract(row, 'OrigPartyDetailedAccountID');
                        const opDetailedAccountId = extract(row, 'XCashDetailedAccountID') || origCashDetailedAccountId || headerPartyDetailedAccountId;
                        const forAccountId = extract(row, 'XReasonAccountRef') || extract(row, 'OrigReasonAccountRef');
                        await resolveAccounts(opAccountId, opDetailedAccountId, forAccountId, extract(row, 'RowRef'), 'استرداد چک دریافتی', null, origPartyDetailedAccountId);
                    }
                }
                if (!isReceipt) {
                    const returnedPromissoryRows = await this.dataSource.query(`
              SELECT 
                x."PaymentReturnedReceivedPromissoryNoteID" as "RowRef",
                x."ReasonRef" as "XReasonRef",
                x."AccountingSettingRef" as "XAccountingSettingRef",
                s."AccountRef" as "XSettingAccountRef",
                r."AccountRef" as "XReasonAccountRef",
                rpn."ReasonRef" as "OrigReasonRef",
                origSetting."AccountRef" as "OrigSettingAccountRef",
                origReason."AccountRef" as "OrigReasonAccountRef",
                c."DetailedAccountID" as "XCashDetailedAccountID",
                p."DetailedAccountID" as "OrigPartyDetailedAccountID"
              FROM "Rap"."PaymentReturnedReceivedPromissoryNote" x
              LEFT JOIN "Rap"."ReceiptPromissoryNote" rpn ON x."ReceiptPromissoryNoteRef" = rpn."ReceiptPromissoryNoteID"
              LEFT JOIN "Rap"."ReceiptNotifications" rn ON rpn."ReceiptNotificationRef" = rn."ReceiptNotificationID"
              LEFT JOIN "Gnr"."Parties" p ON rn."PartyRef" = p."PartyID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" origSetting ON rpn."AccountingSettingRef" = origSetting."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" origReason ON rpn."ReasonRef" = origReason."RapReasonID"
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              LEFT JOIN "Rap"."Cashes" c ON rpn."CashRef" = c."CashID"
              WHERE x."PaymentNotificationRef" = $1
            `, [documentRef]);
                    for (const row of returnedPromissoryRows) {
                        const opAccountId = extract(row, 'XSettingAccountRef') || extract(row, 'OrigSettingAccountRef');
                        const origPartyDetailedAccountId = extract(row, 'OrigPartyDetailedAccountID');
                        const opDetailedAccountId = extract(row, 'XCashDetailedAccountID') || headerPartyDetailedAccountId;
                        const forAccountId = extract(row, 'XReasonAccountRef') || extract(row, 'OrigReasonAccountRef');
                        await resolveAccounts(opAccountId, opDetailedAccountId, forAccountId, extract(row, 'RowRef'), 'استرداد سفته دریافتی', null, origPartyDetailedAccountId);
                    }
                }
                if (isReceipt) {
                    const guaranteeRows = await this.dataSource.query(`
              SELECT 
                x."ReceiptGuaranteeID" as "RowRef",
                x."ReasonRef",
                x."AccountingSettingRef",
                x."CashRef",
                s."AccountRef" as "SettingAccountRef",
                s."detailedType" as "DetailedType",
                r."AccountRef" as "ReasonAccountRef",
                c."DetailedAccountID" as "CashDetailedAccountID"
              FROM "Rap"."ReceiptGuarantee" x
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
              WHERE x."ReceiptNotificationRef" = $1
            `, [documentRef]);
                    for (const row of guaranteeRows) {
                        let opDetailedAccountId = extract(row, 'CashDetailedAccountID');
                        await resolveAccounts(extract(row, 'SettingAccountRef'), opDetailedAccountId, extract(row, 'ReasonAccountRef'), extract(row, 'RowRef'), 'تضمین');
                    }
                }
                else {
                    const guaranteeRows = await this.dataSource.query(`
              SELECT 
                x."PaymentGuaranteeID" as "RowRef",
                x."ReasonRef",
                x."AccountingSettingRef",
                x."CashRef",
                s."AccountRef" as "SettingAccountRef",
                s."detailedType" as "DetailedType",
                r."AccountRef" as "ReasonAccountRef",
                c."DetailedAccountID" as "CashDetailedAccountID"
              FROM "Rap"."PaymentGuarantee" x
              LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" s ON x."AccountingSettingRef" = s."RecieptAndPaymentAccountingSettingID"
              LEFT JOIN "Rap"."Reasons" r ON x."ReasonRef" = r."RapReasonID"
              LEFT JOIN "Rap"."Cashes" c ON x."CashRef" = c."CashID"
              WHERE x."PaymentNotificationRef" = $1
            `, [documentRef]);
                    for (const row of guaranteeRows) {
                        let opDetailedAccountId = extract(row, 'CashDetailedAccountID');
                        await resolveAccounts(extract(row, 'SettingAccountRef'), opDetailedAccountId, extract(row, 'ReasonAccountRef'), extract(row, 'RowRef'), 'تضمین');
                    }
                }
            }
        }
        catch (err) {
            console.error('Error in getAccountInfoForDocument', err);
        }
        return items;
    }
    async getAllByDocument(documentType, documentRef) {
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        return await this.repository.find({
            where: {
                documentType,
                documentRef,
                businessStructureRef: businessStructureId,
                companyRef: companyId
            }
        });
    }
    async getByDocumentWithAccounts(documentType, documentRef) {
        const savedList = await this.getAllByDocument(documentType, documentRef);
        const accounts = await this.getAccountInfoForDocument(documentType, documentRef);
        const result = accounts.map(acc => {
            const saved = savedList.find(s => s.rowType === acc.rowType && Number(s.rowRef) === Number(acc.rowRef));
            return {
                ...acc,
                data: saved || acc.defaultData || {}
            };
        });
        if (result.length === 0 && savedList.length > 0) {
            return { items: [{
                        rowType: 'سند پایه',
                        rowRef: 0,
                        data: savedList[0],
                        opAccountInfo: null,
                        forAccountInfo: null
                    }] };
        }
        return { items: result };
    }
    async saveDefaults(documentType, documentRef) {
        const savedList = await this.getAllByDocument(documentType, documentRef);
        if (savedList && savedList.length > 0) {
            return;
        }
        const result = await this.getByDocumentWithAccounts(documentType, documentRef);
        if (!result || !result.items || result.items.length === 0)
            return;
        const detailedAccounts = await this.dataSource.query(`
      SELECT d.*, dt."DetailedTypesID" as "detailedTypesId"
      FROM "Acc"."DetailedAccounts" d
      LEFT JOIN "Acc"."DetailedTypes" dt ON d."DetailedTypesID" = dt."DetailedTypesID"
    `);
        const payload = [];
        for (const item of result.items) {
            const nextData = { ...item.defaultData };
            const partyAccountId = item.suggestedPartyDetailedAccountId;
            const opPartyAccountId = item.suggestedOpPartyDetailedAccountId !== undefined ? item.suggestedOpPartyDetailedAccountId : item.suggestedPartyDetailedAccountId;
            const forPartyAccountId = item.suggestedForPartyDetailedAccountId !== undefined ? item.suggestedForPartyDetailedAccountId : item.suggestedPartyDetailedAccountId;
            const opAccountId = item.suggestedOpDetailedAccountId;
            const pAccount = detailedAccounts.find((a) => Number(a.DetailedAccountID) === Number(partyAccountId));
            const pTypesId = pAccount?.detailedTypesId;
            const opPartyAccount = detailedAccounts.find((a) => Number(a.DetailedAccountID) === Number(opPartyAccountId));
            const opPartyTypesId = opPartyAccount?.detailedTypesId;
            const forPartyAccount = detailedAccounts.find((a) => Number(a.DetailedAccountID) === Number(forPartyAccountId));
            const forPartyTypesId = forPartyAccount?.detailedTypesId;
            const oAccount = detailedAccounts.find((a) => Number(a.DetailedAccountID) === Number(opAccountId));
            const oTypesId = oAccount?.detailedTypesId;
            let matchedForLevel = null;
            if (pTypesId && item.forAccountInfo?.relatedDetailedAccounts) {
                const rel = item.forAccountInfo.relatedDetailedAccounts.find((r) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(pTypesId));
                if (rel)
                    matchedForLevel = Number(rel.detailedLevel);
            }
            let matchedOpCashLevel = null;
            if (oTypesId && item.opAccountInfo?.relatedDetailedAccounts) {
                const rel = item.opAccountInfo.relatedDetailedAccounts.find((r) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(oTypesId));
                if (rel)
                    matchedOpCashLevel = Number(rel.detailedLevel);
            }
            let matchedOpPartyLevel = null;
            if (opPartyTypesId && item.opAccountInfo?.relatedDetailedAccounts) {
                const rel = item.opAccountInfo.relatedDetailedAccounts.find((r) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(opPartyTypesId));
                if (rel)
                    matchedOpPartyLevel = Number(rel.detailedLevel);
            }
            let matchedForPartyLevel = null;
            if (forPartyTypesId && item.forAccountInfo?.relatedDetailedAccounts) {
                const rel = item.forAccountInfo.relatedDetailedAccounts.find((r) => Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID || r.detailedTypesId || r.DetailedTypesID) === Number(forPartyTypesId));
                if (rel)
                    matchedForPartyLevel = Number(rel.detailedLevel);
            }
            if (matchedForLevel && partyAccountId) {
                const key = `forDetail${matchedForLevel}Ref`;
                if (!nextData[key])
                    nextData[key] = partyAccountId;
            }
            if (matchedOpCashLevel && opAccountId) {
                const key = `opDetail${matchedOpCashLevel}Ref`;
                if (!nextData[key])
                    nextData[key] = opAccountId;
            }
            if (matchedOpPartyLevel && opPartyAccountId) {
                const key = `opDetail${matchedOpPartyLevel}Ref`;
                if (!nextData[key])
                    nextData[key] = opPartyAccountId;
            }
            if (matchedForPartyLevel && forPartyAccountId) {
                const key = `forDetail${matchedForPartyLevel}Ref`;
                if (!nextData[key])
                    nextData[key] = forPartyAccountId;
            }
            let matchedBankLevel = null;
            if (item.forAccountInfo?.relatedDetailedAccounts) {
                const rel = item.forAccountInfo.relatedDetailedAccounts.find((r) => r.detailedType?.title === 'حساب بانکی' || r.detailedType?.title?.includes('حساب بانکی') || Number(r.detailedType?.code) === 1 || Number(r.detailedType?.detailedTypesId || r.detailedType?.DetailedTypesID) === 1);
                if (rel)
                    matchedBankLevel = Number(rel.detailedLevel);
            }
            if (matchedBankLevel && item.suggestedBankDetailedAccountId) {
                const key = `forDetail${matchedBankLevel}Ref`;
                if (!nextData[key])
                    nextData[key] = item.suggestedBankDetailedAccountId;
            }
            payload.push({
                rowType: item.rowType,
                rowRef: item.rowRef,
                ...nextData
            });
        }
        await this.save(documentType, documentRef, payload);
    }
    async save(documentType, documentRef, payload) {
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const items = Array.isArray(payload) ? payload : [payload];
        const savedRecords = [];
        for (const item of items) {
            const rowType = item.rowType || 'سند پایه';
            const rowRef = Number(item.rowRef) || 0;
            const mappedData = {};
            const sourceData = item.data || item;
            const dataKeys = Object.keys(sourceData);
            for (const key of dataKeys) {
                if (key && key !== 'rowType' && key !== 'rowRef' && key !== 'documentType' && key !== 'documentRef') {
                    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
                    mappedData[camelKey] = sourceData[key];
                }
            }
            let existing = await this.repository.findOne({
                where: {
                    documentType, documentRef, rowType, rowRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId
                }
            });
            if (!existing) {
                existing = this.repository.create({
                    documentAccountingInfoId: await this.idGenerationService.generateNextId('DocumentAccountingInfo'),
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                    documentType,
                    documentRef,
                    rowType,
                    rowRef,
                    ...mappedData
                });
                savedRecords.push(await this.repository.save(existing));
            }
            else {
                Object.assign(existing, mappedData);
                savedRecords.push(await this.repository.save(existing));
            }
        }
        return savedRecords;
    }
};
exports.DocumentAccountingInfoService = DocumentAccountingInfoService;
exports.DocumentAccountingInfoService = DocumentAccountingInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_accounting_info_entity_1.DocumentAccountingInfo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService,
        typeorm_2.DataSource])
], DocumentAccountingInfoService);
//# sourceMappingURL=document-accounting-info.service.js.map