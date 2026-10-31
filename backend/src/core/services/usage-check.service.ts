import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UsageCheckService {
  constructor(private dataSource: DataSource) {}

  async isRecordUsed(tableName: string, id: string | number): Promise<{ isUsed: boolean; usedInEntity?: string; usedInTable?: string }> {
    const dbType = this.dataSource.options.type;

    const idParam = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;

    // Custom deep usage checks for PaymentNotification and ReceiptNotification
    if (tableName === 'PaymentNotification' || tableName === 'PaymentNotifications') {
      try {
        // 1. Check ReceiptReturnedPaymentPromissoryNote
        const rpnCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceiptReturnedPaymentPromissoryNote" rpn
          JOIN "Rap"."PaymentPromissoryNote" ppn ON rpn."PaymentPromissoryNoteRef" = ppn."PaymentPromissoryNoteID"
          WHERE ppn."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (rpnCheck && rpnCheck.length > 0) {
          return { isUsed: true, usedInTable: 'ReceiptReturnedPaymentPromissoryNote', usedInEntity: 'ReceiptNotification' };
        }

        // 2. Check ReceiptReturnedPaidCheque
        const rpcCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceiptReturnedPaidCheque" rpc
          JOIN "Rap"."PaymentCheque" pc ON rpc."PaymentChequeRef" = pc."PaymentChequeID"
          WHERE pc."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (rpcCheck && rpcCheck.length > 0) {
          return { isUsed: true, usedInTable: 'ReceiptReturnedPaidCheque', usedInEntity: 'ReceiptNotification' };
        }

        // 3. Check ReceiptReturnedPaymentAssignment
        const rpaCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceiptReturnedPaymentAssignment" rpa
          JOIN "Rap"."PaymentAssignment" pa ON rpa."PaymentAssignmentRef" = pa."PaymentAssignmentID"
          WHERE pa."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (rpaCheck && rpaCheck.length > 0) {
          return { isUsed: true, usedInTable: 'ReceiptReturnedPaymentAssignment', usedInEntity: 'ReceiptNotification' };
        }

        // 4. Check PaidDocumentClearingItem for Promissory Note
        const pdciPNCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaidDocumentClearingItem" pdci
          JOIN "Rap"."PaymentPromissoryNote" ppn ON pdci."DocumentId" = ppn."PaymentPromissoryNoteID"
          WHERE pdci."DocumentType" = 'promissory_note' AND ppn."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (pdciPNCheck && pdciPNCheck.length > 0) {
          return { isUsed: true, usedInTable: 'PaidDocumentClearingItem', usedInEntity: 'PaidDocumentClearing' };
        }

        // 5. Check PaidDocumentClearingItem for Cheque
        const pdciChCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaidDocumentClearingItem" pdci
          JOIN "Rap"."PaymentCheque" pc ON pdci."DocumentId" = pc."PaymentChequeID"
          WHERE pdci."DocumentType" = 'cheque' AND pc."PaymentNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (pdciChCheck && pdciChCheck.length > 0) {
          return { isUsed: true, usedInTable: 'PaidDocumentClearingItem', usedInEntity: 'PaidDocumentClearing' };
        }
      } catch (err) {
        console.error('Error during custom usage check for PaymentNotification:', err);
      }
    }

    if (tableName === 'ReceiptNotification' || tableName === 'ReceiptNotifications') {
      try {
        // 1. Check PaymentReturnedReceivedCheque
        const prrcCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaymentReturnedReceivedCheque" prrc
          JOIN "Rap"."ReceiptCheque" rc ON prrc."ReceiptChequeRef" = rc."ReceiptChequeID"
          WHERE rc."ReceiptNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (prrcCheck && prrcCheck.length > 0) {
          return { isUsed: true, usedInTable: 'PaymentReturnedReceivedCheque', usedInEntity: 'PaymentNotification' };
        }

        // 2. Check PaymentReturnedReceivedPromissoryNote
        const prrpCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."PaymentReturnedReceivedPromissoryNote" prrp
          JOIN "Rap"."ReceiptPromissoryNote" rpn ON prrp."ReceiptPromissoryNoteRef" = rpn."ReceiptPromissoryNoteID"
          WHERE rpn."ReceiptNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (prrpCheck && prrpCheck.length > 0) {
          return { isUsed: true, usedInTable: 'PaymentReturnedReceivedPromissoryNote', usedInEntity: 'PaymentNotification' };
        }

        // 3. Check ReceivedChequeOperationItem
        const rcoiCheck = await this.dataSource.query(`
          SELECT 1 FROM "Rap"."ReceivedChequeOperationItem" rcoi
          JOIN "Rap"."ReceiptCheque" rc ON rcoi."ReceiptChequeRef" = rc."ReceiptChequeID"
          WHERE rc."ReceiptNotificationRef" = $1 LIMIT 1
        `, [idParam]);
        if (rcoiCheck && rcoiCheck.length > 0) {
          return { isUsed: true, usedInTable: 'ReceivedChequeOperationItem', usedInEntity: 'ReceivedChequeOperation' };
        }
      } catch (err) {
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
      } catch (err) {
        console.error('Error during usage check for StocktakingCount:', err);
      }
    }

    let resolvedTableName = tableName;
    let resolvedSchemaName = null;
    let resolvedIdColumn = 'id'; // default fallback
    
    // Try to resolve exact table name and schema and primary key column from TypeORM metadata
    const metadata = this.dataSource.entityMetadatas.find(e => e.name === tableName || e.tableName === tableName);
    if (metadata) {
      resolvedTableName = metadata.tableName;
      if (metadata.schema) {
        resolvedSchemaName = metadata.schema;
      }
      // Get the primary column name to check, though 'id' might be used, in this project it's often TableNameID
      if (metadata.primaryColumns && metadata.primaryColumns.length > 0 && metadata.primaryColumns[0]) {
        resolvedIdColumn = metadata.primaryColumns[0].databaseName || 'id';
      }
    }

    if (dbType === 'postgres') {
      const queryParams: any[] = [resolvedTableName];
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

      if (!fks || fks.length === 0) return { isUsed: false };

      // Ensure id is treated correctly for querying
      const idParam = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;

      for (const fk of fks) {
        const schema = fk.schema;
        const table = fk.table;
        const column = fk.column;

        try {
          // In Postgres, schema and table might be case-sensitive depending on how they were created
          // Using quotes prevents postgres from lowercasing them, which is exactly what typeorm does
          const result = await this.dataSource.query(
            `SELECT 1 FROM "${schema}"."${table}" WHERE "${column}" = $1 LIMIT 1`,
            [idParam]
          );
          
          if (result && result.length > 0) {
            // Find Entity Name if possible
            const fkMetadata = this.dataSource.entityMetadatas.find(e => e.tableName === table);
            return { isUsed: true, usedInTable: table, usedInEntity: fkMetadata ? fkMetadata.name : undefined };
          }
        } catch (e) {
          console.error(`Error checking usage on table ${schema}.${table}:`, e);
        }
      }
      return { isUsed: false };
    }
    return { isUsed: false };
  }
}

