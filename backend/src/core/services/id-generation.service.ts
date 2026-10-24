import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDGeneration } from '../entities/id-generation.entity';

@Injectable()
export class IdGenerationService {
  constructor(
    @InjectRepository(IDGeneration)
    private readonly idGenRepo: Repository<IDGeneration>,
  ) {}

  private async getNextIdGenerationId(manager: any): Promise<number> {
    const row = await manager.query('SELECT MAX("IDGenerationID") as max FROM "Gnr"."IDGeneration"');
    const firstRow = row && row[0];
    const rawVal = firstRow ? (firstRow.max ?? firstRow.MAX ?? firstRow.Max) : 0;
    const max = rawVal ? parseInt(rawVal.toString(), 10) : 0;
    return max + 1;
  }

  private getTableInfoFromMetadata(tableName: string): { schema?: string; tableName: string; primaryKey: string } | null {
    try {
      const metadatas = this.idGenRepo.manager.connection.entityMetadatas;
      const lowerInput = tableName.toLowerCase();

      for (const meta of metadatas) {
        const metaName = (meta.name || '').toLowerCase();
        const metaTarget = (meta.targetName || '').toLowerCase();
        const metaTable = (meta.tableName || '').toLowerCase();

        if (
          lowerInput === metaName ||
          lowerInput === metaTarget ||
          lowerInput === metaTable ||
          lowerInput + 's' === metaTable ||
          lowerInput === metaTable + 's' ||
          lowerInput + 'es' === metaTable ||
          lowerInput === metaTable + 'es'
        ) {
          const pkCol = meta.primaryColumns[0]?.databasePath || meta.primaryColumns[0]?.propertyName || 'id';
          return {
            schema: meta.schema,
            tableName: meta.tableName,
            primaryKey: pkCol,
          };
        }
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  private async getMaxTableId(tableName: string, manager?: any): Promise<number> {
    let maxDbId = 0;
    try {
      let query = '';

      const info = this.getTableInfoFromMetadata(tableName);
      if (info) {
        const schemaPrefix = info.schema ? `"${info.schema}".` : '';
        query = `SELECT MAX("${info.primaryKey}") as max FROM ${schemaPrefix}"${info.tableName}"`;
      } else {
        if (tableName === 'Account') {
          query = 'SELECT MAX("AccountID") as max FROM "Acc"."Accounts"';
        } else if (tableName === 'DetailedType') {
          query = 'SELECT MAX("DetailedTypesID") as max FROM "Acc"."DetailedTypes"';
        } else if (tableName === 'DetailedAccount') {
          query = 'SELECT MAX("DetailedAccountID") as max FROM "Acc"."DetailedAccounts"';
        } else if (tableName === 'VoucherType') {
          query = 'SELECT MAX("VoucherTypeID") as max FROM "Acc"."VoucherType"';
        } else if (tableName === 'GeoLocation') {
          query = 'SELECT MAX("GeolocationID") as max FROM "Gnr"."GeoLocations"';
        } else if (tableName === 'Bank') {
          query = 'SELECT MAX("BankID") as max FROM "Rap"."Banks"';
        } else if (tableName === 'BankBranch') {
          query = 'SELECT MAX("BankBranchID") as max FROM "Rap"."BankBranchs"';
        } else if (tableName === 'BankAccount') {
          query = 'SELECT MAX("BankAccountID") as max FROM "Rap"."BankAccounts"';
        } else if (tableName === 'BankAccountType') {
          query = 'SELECT MAX("BankAccountTypeID") as max FROM "Rap"."BankAccountTypes"';
        } else if (tableName === 'BusinessStructure') {
          query = 'SELECT MAX("BusinessStructureID") as max FROM "Gnr"."BusinessStructure"';
        } else if (tableName === 'FiscalYear') {
          query = 'SELECT MAX("FiscalYearID") as max FROM "Gnr"."FiscalYear"';
        } else if (tableName === 'Currency') {
          query = 'SELECT MAX("CurrencyID") as max FROM "Gnr"."Currency"';
        } else if (tableName === 'Cash') {
          query = 'SELECT MAX("CashID") as max FROM "Rap"."Cashes"';
        } else if (tableName === 'Cashier') {
          query = 'SELECT MAX("CashierID") as max FROM "Rap"."Cashiers"';
        } else if (tableName === 'AccountsRelatedDetailedAccount') {
          query = 'SELECT MAX("AccountsRelatedDeatailedAccountsID") as max FROM "Acc"."AccountsRelatedDeatailedAccounts"';
        } else if (tableName === 'AccountsNatureAdjusting') {
          query = 'SELECT MAX("AccountsNatureAdjustingID") as max FROM "Acc"."AccountsNatureAdjusting"';
        } else if (tableName === 'AccountsVoucherDecriptions') {
          query = 'SELECT MAX("AccountsVoucherDecriptionID") as max FROM "Acc"."AccountsVoucherDecriptions"';
        } else if (tableName === 'Voucher') {
          query = 'SELECT MAX("VoucherID") as max FROM "Acc"."Voucher"';
        } else if (tableName === 'VoucherItem') {
          query = 'SELECT MAX("VoucherItemID") as max FROM "Acc"."VoucherItem"';
        } else if (tableName === 'Party') {
          query = 'SELECT MAX("PartyID") as max FROM "Gnr"."Parties"';
        } else if (tableName === 'PartyRelated') {
          query = 'SELECT MAX("PartyRelatedID") as max FROM "Gnr"."PartiesRelated"';
        } else if (tableName === 'CurrencyExchangeRate') {
          query = 'SELECT MAX("CurrencyExchangeRateID") as max FROM "Gnr"."CurrencyExchangeRate"';
        } else if (tableName === 'BaseSettings') {
          query = 'SELECT MAX("BaseSettingsID") as max FROM "Gnr"."BaseSettings"';
        } else if (tableName === 'ActivityLog') {
          query = 'SELECT MAX("id") as max FROM "Gnr"."ActivityLog"';
        } else if (tableName === 'RecieptAndPaymentAccountingSetting') {
          query = 'SELECT MAX("RecieptAndPaymentAccountingSettingID") as max FROM "Rap"."RecieptAndPaymentAccountingSetting"';
        } else if (tableName === 'PromissoryNote') {
          query = 'SELECT MAX("PromissoryNoteID") as max FROM "Rap"."PromissoryNotes"';
        } else if (tableName === 'PromissoryNoteItem') {
          query = 'SELECT MAX("PromissoryNoteItemID") as max FROM "Rap"."PromissoryNoteItems"';
        } else if (tableName === 'PaymentGateway') {
          query = 'SELECT MAX("PaymentGatewayID") as max FROM "Rap"."PaymentGateways"';
        } else if (tableName === 'PaymentGatewayContact') {
          query = 'SELECT MAX("PaymentGatewayContactID") as max FROM "Rap"."PaymentGatewayContacts"';
        } else if (tableName === 'ReportGroup') {
          query = 'SELECT MAX("reportGroupID") as max FROM "Rpt"."ReportGroup"';
        } else if (tableName === 'Report') {
          query = 'SELECT MAX("reportID") as max FROM "Rpt"."Report"';
        } else if (tableName === 'ReportField') {
          query = 'SELECT MAX("reportFieldID") as max FROM "Rpt"."ReportField"';
        } else if (tableName === 'ReportGrouping') {
          query = 'SELECT MAX("reportGroupingID") as max FROM "Rpt"."ReportGrouping"';
        } else if (tableName === 'ReportFilter') {
          query = 'SELECT MAX("reportFilterID") as max FROM "Rpt"."ReportFilter"';
        } else if (tableName === 'ReportSorting') {
          query = 'SELECT MAX("reportSortingID") as max FROM "Rpt"."ReportSorting"';
        } else if (tableName === 'ReportPermission') {
          query = 'SELECT MAX("reportPermissionID") as max FROM "Rpt"."ReportPermission"';
        } else if (tableName === 'ReportUserData') {
          query = 'SELECT MAX("reportUserDataID") as max FROM "Rpt"."ReportUserData"';
        } else if (tableName === 'ReportFormula') {
          query = 'SELECT MAX("reportFormulaID") as max FROM "Rpt"."ReportFormula"';
        } else if (tableName === 'ReportAggregate') {
          query = 'SELECT MAX("reportAggregateID") as max FROM "Rpt"."ReportAggregate"';
        } else if (tableName === 'ChequePrintTemplate') {
          query = 'SELECT MAX("ChequePrintTemplateID") as max FROM "Rap"."ChequePrintTemplates"';
        } else if (tableName === 'Chequebook') {
          query = 'SELECT MAX("ChequebookID") as max FROM "Rap"."Chequebooks"';
        } else if (tableName === 'ChequebookItems') {
          query = 'SELECT MAX("ChequebookItemID") as max FROM "Rap"."ChequebookItems"';
        } else if (tableName === 'RapReason') {
          query = 'SELECT MAX("RapReasonID") as max FROM "Rap"."Reasons"';
        } else if (tableName === 'PaymentNotification') {
          query = 'SELECT MAX("PaymentNotificationID") as max FROM "Rap"."PaymentNotifications"';
        } else if (tableName === 'PaymentCash') {
          query = 'SELECT MAX("PaymentCashID") as max FROM "Rap"."PaymentCash"';
        } else if (tableName === 'PaymentCheque') {
          query = 'SELECT MAX("PaymentChequeID") as max FROM "Rap"."PaymentCheque"';
        } else if (tableName === 'PaymentWithdrawal') {
          query = 'SELECT MAX("PaymentWithdrawalID") as max FROM "Rap"."PaymentWithdrawal"';
        } else if (tableName === 'LicenseActivation') {
          query = 'SELECT MAX("LicenseActivationID") as max FROM "Gnr"."LicenseActivations"';
        } else if (tableName === 'PettyCash') {
          query = 'SELECT MAX("PettyCashID") as max FROM "Rap"."PettyCashes"';
        } else if (tableName === 'PettyCashSummaries') {
          query = 'SELECT MAX("pettyCashSummaryId") as max FROM "Rap"."PettyCashSummaries"';
        } else if (tableName === 'PettyCashSummaryItems') {
          query = 'SELECT MAX("pettyCashSummaryItemId") as max FROM "Rap"."PettyCashSummaryItems"';
        } else if (tableName === 'ReceivedChequeOperation') {
          query = 'SELECT MAX("ReceivedChequeOperationID") as max FROM "Rap"."ReceivedChequeOperation"';
        } else if (tableName === 'ReceivedChequeOperationItem') {
          query = 'SELECT MAX("ReceivedChequeOperationItemID") as max FROM "Rap"."ReceivedChequeOperationItem"';
        } else if (tableName === 'ReconcileBankStatement') {
          query = 'SELECT MAX("ReconcileBankStatementID") as max FROM "Rap"."ReconcileBankStatement"';
        } else if (tableName === 'ReconcileBankStatementItem') {
          query = 'SELECT MAX("ReconcileBankStatementItemID") as max FROM "Rap"."ReconcileBankStatementItem"';
        } else if (tableName === 'BankReconciliation') {
          query = 'SELECT MAX("BankReconciliationID") as max FROM "Rap"."BankReconciliation"';
        } else if (tableName === 'BankReconciliationItem') {
          query = 'SELECT MAX("BankReconciliationItemID") as max FROM "Rap"."BankReconciliationItem"';
        } else if (tableName === 'Warehouses' || tableName === 'Warehouse') {
          query = 'SELECT MAX("WarehouseID") as max FROM "Inv"."Warehouses"';
        } else if (tableName === 'WarehouseProducts') {
          query = 'SELECT MAX("WarehouseProductID") as max FROM "Inv"."WarehouseProducts"';
        } else if (tableName === 'WarehouseUsers') {
          query = 'SELECT MAX("WarehouseUserID") as max FROM "Inv"."WarehouseUsers"';
        } else if (tableName === 'WarehouseAddresses') {
          query = 'SELECT MAX("WarehouseAddressID") as max FROM "Inv"."WarehouseAddresses"';
        } else if (tableName === 'WarehouseKeepers') {
          query = 'SELECT MAX("WarehouseKeeperID") as max FROM "Inv"."WarehouseKeepers"';
        } else if (tableName === 'MeasurementUnits') {
          query = 'SELECT MAX("MeasurementUnitID") as max FROM "Inv"."MeasurementUnits"';
        } else if (tableName === 'DynamicForm') {
          query = 'SELECT MAX("DynamicFormID") as max FROM "Dfb"."DynamicForm"';
        } else if (tableName === 'DynamicFormRecord') {
          query = 'SELECT MAX("DynamicFormRecordID") as max FROM "Dfb"."DynamicFormRecord"';
        } else if (tableName === 'ClosingTemporaryAccount') {
          query = 'SELECT MAX("ClosingTemporaryAccountID") as max FROM "Acc"."ClosingTemporaryAccount"';
        } else if (tableName === 'ClosingTemporaryAccountItem') {
          query = 'SELECT MAX("ClosingTemporaryAccountItemID") as max FROM "Acc"."ClosingTemporaryAccountItem"';
        } else if (tableName === 'ClosingTemporaryAccountSelected') {
          query = 'SELECT MAX("ClosingTemporaryAccountSelectedID") as max FROM "Acc"."ClosingTemporaryAccountSelected"';
        } else if (tableName === 'ItemRequest' || tableName === 'ItemRequests') {
          query = 'SELECT MAX("ItemRequestID") as max FROM "Inv"."ItemRequests"';
        } else if (tableName === 'ItemRequestDetail' || tableName === 'ItemRequestDetails') {
          query = 'SELECT MAX("ItemRequestDetailID") as max FROM "Inv"."ItemRequestDetails"';
        } else if (tableName === 'ServiceRequest' || tableName === 'ServiceRequests') {
          query = 'SELECT MAX("ServiceRequestID") as max FROM "Inv"."ServiceRequests"';
        } else if (tableName === 'ServiceRequestDetail' || tableName === 'ServiceRequestDetails') {
          query = 'SELECT MAX("ServiceRequestDetailID") as max FROM "Inv"."ServiceRequestDetails"';
        } else if (tableName === 'ItemSupplyRequest' || tableName === 'ItemSupplyRequests') {
          query = 'SELECT MAX("ItemSupplyRequestID") as max FROM "Inv"."ItemSupplyRequests"';
        } else if (tableName === 'ItemSupplyRequestDetail' || tableName === 'ItemSupplyRequestDetails') {
          query = 'SELECT MAX("ItemSupplyRequestDetailID") as max FROM "Inv"."ItemSupplyRequestDetails"';
        } else if (tableName === 'ServiceSupplyRequest' || tableName === 'ServiceSupplyRequests') {
          query = 'SELECT MAX("ServiceSupplyRequestID") as max FROM "Inv"."ServiceSupplyRequests"';
        } else if (tableName === 'ServiceSupplyRequestDetail' || tableName === 'ServiceSupplyRequestDetails') {
          query = 'SELECT MAX("ServiceSupplyRequestDetailID") as max FROM "Inv"."ServiceSupplyRequestDetails"';
        } else if (tableName === 'PurchaseSalesParameters' || tableName === 'PurchaseSalesParameter') {
          query = 'SELECT MAX("PurchaseSalesParameterID") as max FROM "Inv"."PurchaseSalesParameters"';
        } else if (tableName === 'StocktakingTags' || tableName === 'StocktakingTag') {
          query = 'SELECT MAX("StocktakingTagID") as max FROM "Inv"."StocktakingTags"';
        } else if (tableName === 'StocktakingTagDetails' || tableName === 'StocktakingTagDetail') {
          query = 'SELECT MAX("StocktakingTagDetailID") as max FROM "Inv"."StocktakingTagDetails"';
        } else if (tableName === 'StocktakingTagHeaders' || tableName === 'StocktakingTagHeader') {
          query = 'SELECT MAX("StocktakingTagHeaderID") as max FROM "Inv"."StocktakingTagHeaders"';
        } else if (tableName === 'StocktakingCounts' || tableName === 'StocktakingCount') {
          query = 'SELECT MAX("StocktakingCountID") as max FROM "Inv"."StocktakingCounts"';
        } else if (tableName === 'StocktakingCountDetails' || tableName === 'StocktakingCountDetail') {
          query = 'SELECT MAX("StocktakingCountDetailID") as max FROM "Inv"."StocktakingCountDetails"';
        } else if (tableName === 'StocktakingCountTrackingFactors' || tableName === 'StocktakingCountTrackingFactor') {
          query = 'SELECT MAX("StocktakingCountTrackingFactorID") as max FROM "Inv"."StocktakingCountTrackingFactors"';
        } else if (tableName === 'SalesTypes' || tableName === 'SalesType') {
          query = 'SELECT MAX("SalesTypeID") as max FROM "Sle"."SalesTypes"';
        } else if (tableName === 'DeliveryLocations' || tableName === 'DeliveryLocation') {
          query = 'SELECT MAX("DeliveryLocationID") as max FROM "Sle"."DeliveryLocations"';
        } else if (tableName === 'SalesCenters' || tableName === 'SalesCenter') {
          query = 'SELECT MAX("SalesCenterID") as max FROM "Sle"."SalesCenters"';
        } else if (tableName === 'Customers' || tableName === 'Customer') {
          query = 'SELECT MAX("CustomerID") as max FROM "Sle"."Customers"';
        }
      }

      if (query) {
        const queryTarget = manager || this.idGenRepo.manager;
        const rows = await queryTarget.query(query);
        const firstRow = rows && rows[0];
        if (firstRow) {
          const rawVal = firstRow.max ?? firstRow.MAX ?? firstRow.Max;
          if (rawVal !== null && rawVal !== undefined) {
            maxDbId = parseInt(rawVal.toString(), 10);
          }
        }
      }
    } catch (err) {
      console.warn(`IdGenerationService: Failed to fetch max ID for table ${tableName}:`, err);
    }
    return maxDbId;
  }

  async generateNextId(tableName: string): Promise<number> {
    return await this.idGenRepo.manager.transaction(async (manager) => {
      const info = this.getTableInfoFromMetadata(tableName);
      const possibleNames = Array.from(
        new Set([tableName, info?.tableName, info?.tableName ? info.tableName : null].filter(Boolean) as string[])
      );

      let idGen = await manager
        .createQueryBuilder(IDGeneration, 'idGen')
        .setLock('pessimistic_write')
        .where('idGen.tableName IN (:...names)', { names: possibleNames })
        .getOne();

      const maxDbId = await this.getMaxTableId(tableName, manager);

      if (!idGen) {
        const nextId = Math.max(1, maxDbId + 1);
        try {
          const nextIdGenRecordId = await this.getNextIdGenerationId(manager);
          const newEntry = manager.create(IDGeneration, {
            idGenerationId: nextIdGenRecordId,
            tableName: info?.tableName || tableName,
            lastId: nextId,
          });
          await manager.save(newEntry);
        } catch (err) {
          const existing = await manager
            .createQueryBuilder(IDGeneration, 'idGen')
            .where('idGen.tableName IN (:...names)', { names: possibleNames })
            .getOne();
          if (existing) {
            existing.lastId = Math.max(existing.lastId, nextId);
            await manager.save(existing);
            return existing.lastId;
          } else {
            const nextIdGenRecordId = await this.getNextIdGenerationId(manager);
            await manager.query(
              `INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [nextIdGenRecordId, info?.tableName || tableName, nextId]
            );
          }
        }
        return nextId;
      } else {
        const nextId = Math.max(idGen.lastId + 1, maxDbId + 1);
        idGen.lastId = nextId;
        if (info?.tableName) {
          idGen.tableName = info.tableName;
        }
        await manager.save(idGen);
        return nextId;
      }
    });
  }

  async generateNextIdBlock(tableName: string, count: number): Promise<number> {
    return await this.idGenRepo.manager.transaction(async (manager) => {
      const info = this.getTableInfoFromMetadata(tableName);
      const possibleNames = Array.from(
        new Set([tableName, info?.tableName, info?.tableName ? info.tableName : null].filter(Boolean) as string[])
      );

      let idGen = await manager
        .createQueryBuilder(IDGeneration, 'idGen')
        .setLock('pessimistic_write')
        .where('idGen.tableName IN (:...names)', { names: possibleNames })
        .getOne();

      const maxDbId = await this.getMaxTableId(tableName, manager);

      if (!idGen) {
        const startId = Math.max(1, maxDbId + 1);
        try {
          const nextIdGenRecordId = await this.getNextIdGenerationId(manager);
          const newEntry = manager.create(IDGeneration, {
            idGenerationId: nextIdGenRecordId,
            tableName: info?.tableName || tableName,
            lastId: startId + count - 1,
          });
          await manager.save(newEntry);
        } catch (err) {
          const existing = await manager
            .createQueryBuilder(IDGeneration, 'idGen')
            .where('idGen.tableName IN (:...names)', { names: possibleNames })
            .getOne();
          if (existing) {
            existing.lastId = Math.max(existing.lastId, startId + count - 1);
            await manager.save(existing);
            return Math.max(existing.lastId - count + 1, startId);
          } else {
            const nextIdGenRecordId = await this.getNextIdGenerationId(manager);
            await manager.query(
              `INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [nextIdGenRecordId, info?.tableName || tableName, startId + count - 1]
            );
          }
        }
        return startId;
      } else {
        const startId = Math.max(idGen.lastId + 1, maxDbId + 1);
        idGen.lastId = startId + count - 1;
        if (info?.tableName) {
          idGen.tableName = info.tableName;
        }
        await manager.save(idGen);
        return startId;
      }
    });
  }
}
