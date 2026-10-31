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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageCheckService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let UsageCheckService = class UsageCheckService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async isRecordUsed(tableName, id) {
        const dbType = this.dataSource.options.type;
        const idParam = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
        if (tableName === 'PaymentNotification' || tableName === 'PaymentNotifications') {
            try {
                const rpnCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceiptReturnedPaymentPromissoryNote" rpn
          JOIN "Rap"."PaymentPromissoryNote" ppn ON rpn."PaymentPromissoryNoteRef" = ppn."PaymentPromissoryNoteID"
          WHERE ppn."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (rpnCheck && rpnCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'ReceiptReturnedPaymentPromissoryNote', usedInEntity: 'ReceiptNotification' };
                }
                const rpcCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceiptReturnedPaidCheque" rpc
          JOIN "Rap"."PaymentCheque" pc ON rpc."PaymentChequeRef" = pc."PaymentChequeID"
          WHERE pc."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (rpcCheck && rpcCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'ReceiptReturnedPaidCheque', usedInEntity: 'ReceiptNotification' };
                }
                const rpaCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceiptReturnedPaymentAssignment" rpa
          JOIN "Rap"."PaymentAssignment" pa ON rpa."PaymentAssignmentRef" = pa."PaymentAssignmentID"
          WHERE pa."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (rpaCheck && rpaCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'ReceiptReturnedPaymentAssignment', usedInEntity: 'ReceiptNotification' };
                }
                const pdciPNCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaidDocumentClearingItem" pdci
          JOIN "Rap"."PaymentPromissoryNote" ppn ON pdci."DocumentId" = ppn."PaymentPromissoryNoteID"
          WHERE pdci."DocumentType" = 'promissory_note' AND ppn."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (pdciPNCheck && pdciPNCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'PaidDocumentClearingItem', usedInEntity: 'PaidDocumentClearing' };
                }
                const pdciChCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaidDocumentClearingItem" pdci
          JOIN "Rap"."PaymentCheque" pc ON pdci."DocumentId" = pc."PaymentChequeID"
          WHERE pdci."DocumentType" = 'cheque' AND pc."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (pdciChCheck && pdciChCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'PaidDocumentClearingItem', usedInEntity: 'PaidDocumentClearing' };
                }
            }
            catch (err) {
                console.error('Error during custom usage check for PaymentNotification:', err);
            }
        }
        if (tableName === 'ReceiptNotification' || tableName === 'ReceiptNotifications') {
            try {
                const prrcCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaymentReturnedReceivedCheque" prrc
          JOIN "Rap"."ReceiptCheque" rc ON prrc."ReceiptChequeRef" = rc."ReceiptChequeID"
          WHERE rc."ReceiptNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (prrcCheck && prrcCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'PaymentReturnedReceivedCheque', usedInEntity: 'PaymentNotification' };
                }
                const prrpCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaymentReturnedReceivedPromissoryNote" prrp
          JOIN "Rap"."ReceiptPromissoryNote" rpn ON prrp."ReceiptPromissoryNoteRef" = rpn."ReceiptPromissoryNoteID"
          WHERE rpn."ReceiptNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (prrpCheck && prrpCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'PaymentReturnedReceivedPromissoryNote', usedInEntity: 'PaymentNotification' };
                }
                const rcoiCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceivedChequeOperationItem" rcoi
          JOIN "Rap"."ReceiptCheque" rc ON rcoi."ReceiptChequeRef" = rc."ReceiptChequeID"
          WHERE rc."ReceiptNotificationRef" = $1 LIMIT 1
        `, [idParam]);
                if (rcoiCheck && rcoiCheck.length > 0) {
                    return { isUsed: true, usedInTable: 'ReceivedChequeOperationItem', usedInEntity: 'ReceivedChequeOperation' };
                }
            }
            catch (err) {
                console.error('Error during custom usage check for ReceiptNotification:', err);
            }
        }
        if (tableName === 'StocktakingCount' || tableName === 'StocktakingCounts' || tableName === 'StocktakingCountDetails') {
            try {
                const countRecord = await this.dataSource.query(`
          SELECT "StocktakingNumber", "StocktakingCountID" FROM "Inv"."StocktakingCounts" WHERE "StocktakingCountID" = $1 LIMIT 1
        `, [idParam]);
                if (countRecord && countRecord.length > 0) {
                    const countId = countRecord[0].StocktakingCountID;
                    const countNum = countRecord[0].StocktakingNumber;
                    const voucherCheck = await this.dataSource.query(`
            SELECT 1 FROM "Inv"."WarehouseVouchers" 
            WHERE ("Description" LIKE '%انبارگردانی%' AND ("Description" LIKE $1 OR "Description" LIKE $2))
               OR "BaseType" = 5
            LIMIT 1
          `, [`%${countId}%`, `%${countNum}%`]);
                    if (voucherCheck && voucherCheck.length > 0) {
                        return { isUsed: true, usedInTable: 'WarehouseVouchers', usedInEntity: 'WarehouseReceipt' };
                    }
                }
            }
            catch (err) {
                console.error('Error during usage check for StocktakingCount:', err);
            }
        }
        let resolvedTableName = tableName;
        let resolvedSchemaName = null;
        let resolvedIdColumn = 'id';
        const metadata = this.dataSource.entityMetadatas.find(e => e.name === tableName || e.tableName === tableName);
        if (metadata) {
            resolvedTableName = metadata.tableName;
            if (metadata.schema) {
                resolvedSchemaName = metadata.schema;
            }
            if (metadata.primaryColumns && metadata.primaryColumns.length > 0 && metadata.primaryColumns[0]) {
                resolvedIdColumn = metadata.primaryColumns[0].databaseName || 'id';
            }
        }
        if (dbType === 'postgres') {
            const queryParams = [resolvedTableName];
            let query = `
        SELECT 
            tc.table_schema as "schema", 
            tc.table_name as "table", 
            kcu.column_name as "column"
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name 
            AND tc.table_schema = kcu.table_schema
        -- Task 136: بدون شرط «ccu.table_schema = tc.table_schema» — کلیدهای خارجی بین‌اسکیمایی
        -- (مثل Inv.WarehouseVouchers → Sle.SalesInvoices) هم باید شناسایی شوند؛
        -- اسکیمای جدول ارجاع‌شده در ccu ذخیره می‌شود و پایین با $2 فیلتر می‌شود
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
            AND tc.table_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = $1
            AND rc.delete_rule != 'CASCADE'
      `;
            if (resolvedSchemaName) {
                query += ` AND ccu.table_schema = $2`;
                queryParams.push(resolvedSchemaName);
            }
            const fks = await this.dataSource.query(query, queryParams);
            if (!fks || fks.length === 0)
                return { isUsed: false };
            const idParam = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
            for (const fk of fks) {
                const schema = fk.schema;
                const table = fk.table;
                const column = fk.column;
                try {
                    const result = await this.dataSource.query(`SELECT 1 FROM "${schema}"."${table}" WHERE "${column}" = $1 LIMIT 1`, [idParam]);
                    if (result && result.length > 0) {
                        const fkMetadata = this.dataSource.entityMetadatas.find(e => e.tableName === table);
                        return { isUsed: true, usedInTable: table, usedInEntity: fkMetadata ? fkMetadata.name : undefined };
                    }
                }
                catch (e) {
                    console.error(`Error checking usage on table ${schema}.${table}:`, e);
                }
            }
            return { isUsed: false };
        }
        return { isUsed: false };
    }
};
exports.UsageCheckService = UsageCheckService;
exports.UsageCheckService = UsageCheckService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], UsageCheckService);
//# sourceMappingURL=usage-check.service.js.map