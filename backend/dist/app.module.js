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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const accounting_module_1 = require("./softwares/accounting/accounting.module");
const common_module_1 = require("./softwares/common/common.module");
const rap_module_1 = require("./softwares/rap/rap.module");
const cnt_module_1 = require("./softwares/cnt/cnt.module");
const inv_module_1 = require("./softwares/inv/inv.module");
const sle_module_1 = require("./softwares/sle/sle.module");
const core_module_1 = require("./core/core.module");
const auth_module_1 = require("./auth/auth.module");
const rpt_module_1 = require("./softwares/rpt/rpt.module");
const dfb_module_1 = require("./softwares/dfb/dfb.module");
const health_controller_1 = require("./health.controller");
const request_context_middleware_1 = require("./core/middlewares/request-context.middleware");
const permissions_guard_1 = require("./auth/permissions.guard");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const tenant_validation_guard_1 = require("./core/guards/tenant-validation.guard");
const license_enforcement_guard_1 = require("./core/guards/license-enforcement.guard");
const pg_1 = require("pg");
const gateway_module_1 = require("./gateway/gateway.module");
let AppModule = class AppModule {
    constructor() {
        console.log('AppModule initialized');
    }
    configure(consumer) {
        consumer
            .apply(request_context_middleware_1.RequestContextMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '../.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const rawDbUrl = (process.env.DATABASE_URL || configService.get('DATABASE_URL') || '').trim();
                    const rawDbHost = (process.env.DB_HOST || configService.get('DB_HOST') || '').trim();
                    let dbConfig = {
                        autoLoadEntities: true,
                        synchronize: process.env.DB_SYNCHRONIZE === 'false' ? false : true,
                        logging: ['error'],
                        retryAttempts: 1,
                        retryDelay: 1000,
                        keepConnectionAlive: true,
                        type: 'postgres',
                    };
                    console.log('Resolving database configuration...');
                    console.log('DATABASE_URL present:', !!rawDbUrl);
                    console.log('DB_HOST present:', !!rawDbHost);
                    if (rawDbUrl && rawDbUrl !== '""' && rawDbUrl !== "''") {
                        let cleanUrl = rawDbUrl;
                        if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"'))
                            cleanUrl = cleanUrl.slice(1, -1);
                        if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'"))
                            cleanUrl = cleanUrl.slice(1, -1);
                        cleanUrl = cleanUrl.trim();
                        const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1') || cleanUrl.includes('::1');
                        if (process.env.DB_SSL === 'false') {
                            dbConfig.ssl = false;
                        }
                        else if (process.env.DB_SSL === 'true') {
                            dbConfig.ssl = { rejectUnauthorized: false };
                        }
                        else if (isLocal) {
                            dbConfig.ssl = false;
                        }
                        else {
                            dbConfig.ssl = { rejectUnauthorized: false };
                            dbConfig.extra = {
                                max: 10,
                                connectionTimeoutMillis: 30000,
                                idleTimeoutMillis: 30000,
                                keepAlive: true,
                            };
                        }
                        dbConfig.url = cleanUrl;
                        try {
                            const u = new URL(cleanUrl);
                            dbConfig.host = u.hostname;
                            dbConfig.port = u.port ? parseInt(u.port, 10) : 5432;
                            dbConfig.username = decodeURIComponent(u.username || 'postgres');
                            dbConfig.password = decodeURIComponent(u.password || '');
                            dbConfig.database = u.pathname ? u.pathname.replace(/^\//, '') : 'postgres';
                        }
                        catch (e) { }
                    }
                    else if (rawDbHost) {
                        dbConfig.host = rawDbHost;
                        dbConfig.port = parseInt((process.env.DB_PORT || configService.get('DB_PORT') || '5432').trim(), 10);
                        dbConfig.username = (process.env.DB_USERNAME || configService.get('DB_USERNAME') || 'postgres').trim();
                        const rawPwd = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : configService.get('DB_PASSWORD');
                        let pwd = rawPwd !== undefined && rawPwd !== null ? String(rawPwd) : '';
                        pwd = pwd.trim();
                        if (pwd.startsWith('"') && pwd.endsWith('"'))
                            pwd = pwd.slice(1, -1);
                        if (pwd.startsWith("'") && pwd.endsWith("'"))
                            pwd = pwd.slice(1, -1);
                        dbConfig.password = pwd;
                        dbConfig.database = (process.env.DB_DATABASE || configService.get('DB_DATABASE') || 'postgres').trim();
                        const isLocalHost = dbConfig.host === 'localhost' || dbConfig.host === '127.0.0.1' || dbConfig.host === '::1';
                        if (process.env.DB_SSL === 'false') {
                            dbConfig.ssl = false;
                        }
                        else if (process.env.DB_SSL === 'true') {
                            dbConfig.ssl = { rejectUnauthorized: false };
                        }
                        else if (isLocalHost) {
                            dbConfig.ssl = false;
                        }
                        else {
                            dbConfig.ssl = { rejectUnauthorized: false };
                            dbConfig.extra = {
                                max: 10,
                                connectionTimeoutMillis: 30000,
                                idleTimeoutMillis: 30000,
                                keepAlive: true,
                            };
                        }
                    }
                    else {
                        console.warn('[DB CONFIG] No PostgreSQL connection parameters provided. Database connection may fail.');
                        dbConfig.type = 'postgres';
                    }
                    console.log('Database Connection Details resolved:', dbConfig.type, !!dbConfig.url ? 'Using URL' : 'Using Host config', 'SSL enabled:', !!dbConfig.ssl);
                    if (dbConfig.type === 'postgres') {
                        console.log('PostgreSQL detected. Testing connection & ensuring schemas...');
                        const isLocalEnv = !dbConfig.ssl;
                        let client = new pg_1.Client({
                            connectionString: dbConfig.url,
                            host: dbConfig.host,
                            port: dbConfig.port,
                            user: dbConfig.username,
                            password: dbConfig.password,
                            database: dbConfig.database,
                            ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
                            connectionTimeoutMillis: 30000,
                        });
                        let connectionSuccessful = false;
                        let lastConnError = null;
                        try {
                            await client.connect();
                            connectionSuccessful = true;
                            console.log(`[DB INIT] Successfully connected to PostgreSQL (${isLocalEnv ? 'Local' : 'Cloud'}) - Database: "${dbConfig.database || 'default'}"`);
                        }
                        catch (connErr) {
                            lastConnError = connErr;
                            console.error('[DB INIT] Connection failed:', connErr.message || connErr);
                            if (isLocalEnv && (connErr.code === '3D000' || String(connErr.message).includes('does not exist'))) {
                                const targetDb = dbConfig.database || 'parsaDb';
                                console.log(`[DB INIT] Database "${targetDb}" not found on local PostgreSQL. Attempting to create it automatically...`);
                                const rootClient = new pg_1.Client({
                                    host: dbConfig.host || 'localhost',
                                    port: dbConfig.port || 5432,
                                    user: dbConfig.username || 'postgres',
                                    password: dbConfig.password || '',
                                    database: 'postgres',
                                    ssl: false,
                                    connectionTimeoutMillis: 10000,
                                });
                                try {
                                    await rootClient.connect();
                                    await rootClient.query(`CREATE DATABASE "${targetDb}"`);
                                    await rootClient.end();
                                    console.log(`[DB INIT] Database "${targetDb}" created successfully! Reconnecting...`);
                                    client = new pg_1.Client({
                                        connectionString: dbConfig.url,
                                        host: dbConfig.host,
                                        port: dbConfig.port,
                                        user: dbConfig.username,
                                        password: dbConfig.password,
                                        database: targetDb,
                                        ssl: false,
                                        connectionTimeoutMillis: 30000,
                                    });
                                    await client.connect();
                                    connectionSuccessful = true;
                                    console.log(`[DB INIT] Connected to freshly created database "${targetDb}"!`);
                                }
                                catch (createErr) {
                                    lastConnError = createErr;
                                    console.error('[DB INIT] Could not auto-create local database:', createErr.message || createErr);
                                    try {
                                        await rootClient.end();
                                    }
                                    catch (e) { }
                                }
                            }
                        }
                        if (connectionSuccessful) {
                            try {
                                const schemas = ['Gnr', 'Acc', 'Rap', 'Cnt', 'Iam', 'Rpt', 'Inv', 'Dfb', 'Sle'];
                                for (const schema of schemas) {
                                    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
                                }
                                console.log('Schemas ensured.');
                                try {
                                    await client.query(`
                  CREATE TABLE IF NOT EXISTS "Sle"."SalesProformaInvoices" (
                    "SalesProformaID" bigint PRIMARY KEY,
                    "Version" bigint DEFAULT 1,
                    "Creator" bigint DEFAULT 1,
                    "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
                    "CreateTime" varchar(8) DEFAULT '00:00:00',
                    "LastModifier" bigint DEFAULT 1,
                    "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
                    "LastModificationTime" varchar(8) DEFAULT '00:00:00',
                    "BusinessStructureRef" bigint DEFAULT 2,
                    "CompanyRef" bigint,
                    "BranchRef" bigint,
                    "AgencyRef" bigint,
                    "ProformaNumber" integer NOT NULL,
                    "ProformaDate" varchar(10),
                    "ValidityDate" varchar(10),
                    "CustomerRef" bigint,
                    "CustomerName" varchar(200),
                    "SalesTypeRef" bigint,
                    "SalesCenterRef" bigint,
                    "DeliveryLocationRef" bigint,
                    "SettlementMethodRef" bigint,
                    "Status" integer DEFAULT 1,
                    "Description" varchar(1000),
                    "FiscalYearRef" bigint
                  );
                  CREATE TABLE IF NOT EXISTS "Sle"."SalesProformaInvoiceItems" (
                    "SalesProformaInvoiceItemID" bigint PRIMARY KEY,
                    "SalesProformaRef" bigint NOT NULL,
                    "RowNo" integer NOT NULL,
                    "ItemRef" bigint,
                    "ItemCode" varchar(100),
                    "ItemName" varchar(250),
                    "UnitName" varchar(100),
                    "Quantity" numeric(18,4) DEFAULT 0,
                    "UnitPrice" numeric(18,2) DEFAULT 0,
                    "TotalPrice" numeric(18,2) DEFAULT 0,
                    "Description" varchar(500),
                    "TrackingFactorValues" jsonb
                  );
                  CREATE TABLE IF NOT EXISTS "Sle"."SalesProformaInvoiceFactors" (
                    "SalesProformaInvoiceFactorID" bigint PRIMARY KEY,
                    "SalesProformaRef" bigint NOT NULL,
                    "RowNo" integer DEFAULT 1,
                    "FactorTitle" varchar(200),
                    "FactorType" integer DEFAULT 1,
                    "Amount" numeric(18,4) DEFAULT 0,
                    "Description" varchar(500)
                  );
                `);
                                    await client.query(`
                  DO $$
                  BEGIN
                    IF NOT EXISTS (
                      SELECT 1 FROM pg_constraint WHERE conname = 'FK_SalesProformaInvoiceItems_SalesProforma'
                    ) THEN
                      ALTER TABLE "Sle"."SalesProformaInvoiceItems" ADD CONSTRAINT "FK_SalesProformaInvoiceItems_SalesProforma"
                        FOREIGN KEY ("SalesProformaRef") REFERENCES "Sle"."SalesProformaInvoices"("SalesProformaID") ON DELETE CASCADE;
                    END IF;
                    IF NOT EXISTS (
                      SELECT 1 FROM pg_constraint WHERE conname = 'FK_SalesProformaInvoiceFactors_SalesProforma'
                    ) THEN
                      ALTER TABLE "Sle"."SalesProformaInvoiceFactors" ADD CONSTRAINT "FK_SalesProformaInvoiceFactors_SalesProforma"
                        FOREIGN KEY ("SalesProformaRef") REFERENCES "Sle"."SalesProformaInvoices"("SalesProformaID") ON DELETE CASCADE;
                    END IF;
                  END $$;
                `);
                                    console.log('[Task88] SalesProformaInvoices tables ensured.');
                                }
                                catch (proformaErr) {
                                    console.warn('[Task88] Could not ensure SalesProformaInvoices tables:', proformaErr.message);
                                }
                                try {
                                    await client.query(`
                  CREATE TABLE IF NOT EXISTS "Sle"."SalesContracts" (
                    "SalesContractID" bigint PRIMARY KEY,
                    "Version" bigint DEFAULT 1,
                    "Creator" bigint DEFAULT 1,
                    "CreationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
                    "CreateTime" varchar(8) DEFAULT '00:00:00',
                    "LastModifier" bigint DEFAULT 1,
                    "LastModificationDate" timestamp DEFAULT CURRENT_TIMESTAMP,
                    "LastModificationTime" varchar(8) DEFAULT '00:00:00',
                    "BusinessStructureRef" bigint DEFAULT 2,
                    "CompanyRef" bigint,
                    "BranchRef" bigint,
                    "AgencyRef" bigint,
                    "ContractNumber" integer NOT NULL,
                    "DocumentDate" varchar(10),
                    "ContractDate" varchar(10),
                    "CustomerRef" bigint,
                    "CustomerName" varchar(200),
                    "SalesTypeRef" bigint,
                    "SalesCenterRef" bigint,
                    "DeliveryLocationRef" bigint,
                    "SettlementMethodRef" bigint,
                    "Status" integer DEFAULT 1,
                    "ContractSubject" varchar(1000),
                    "FiscalYearRef" bigint
                  );
                  CREATE TABLE IF NOT EXISTS "Sle"."SalesContractItems" (
                    "SalesContractItemID" bigint PRIMARY KEY,
                    "SalesContractRef" bigint NOT NULL,
                    "RowNo" integer NOT NULL,
                    "ItemRef" bigint,
                    "ItemCode" varchar(100),
                    "ItemName" varchar(250),
                    "UnitName" varchar(100),
                    "Quantity" numeric(18,4) DEFAULT 0,
                    "UnitPrice" numeric(18,2) DEFAULT 0,
                    "TotalPrice" numeric(18,2) DEFAULT 0,
                    "Description" varchar(500),
                    "TrackingFactorValues" jsonb
                  );
                  CREATE TABLE IF NOT EXISTS "Sle"."SalesContractFactors" (
                    "SalesContractFactorID" bigint PRIMARY KEY,
                    "SalesContractRef" bigint NOT NULL,
                    "RowNo" integer DEFAULT 1,
                    "FactorTitle" varchar(200),
                    "FactorType" integer DEFAULT 1,
                    "Amount" numeric(18,4) DEFAULT 0,
                    "Description" varchar(500)
                  );
                `);
                                    await client.query(`
                  DO $$
                  BEGIN
                    IF NOT EXISTS (
                      SELECT 1 FROM pg_constraint WHERE conname = 'FK_SalesContractItems_SalesContract'
                    ) THEN
                      ALTER TABLE "Sle"."SalesContractItems" ADD CONSTRAINT "FK_SalesContractItems_SalesContract"
                        FOREIGN KEY ("SalesContractRef") REFERENCES "Sle"."SalesContracts"("SalesContractID") ON DELETE CASCADE;
                    END IF;
                    IF NOT EXISTS (
                      SELECT 1 FROM pg_constraint WHERE conname = 'FK_SalesContractFactors_SalesContract'
                    ) THEN
                      ALTER TABLE "Sle"."SalesContractFactors" ADD CONSTRAINT "FK_SalesContractFactors_SalesContract"
                        FOREIGN KEY ("SalesContractRef") REFERENCES "Sle"."SalesContracts"("SalesContractID") ON DELETE CASCADE;
                    END IF;
                  END $$;
                `);
                                    console.log('[Task128] SalesContracts tables ensured.');
                                }
                                catch (contractErr) {
                                    console.warn('[Task128] Could not ensure SalesContracts tables:', contractErr.message);
                                }
                                console.log('Cleaning up self-referential or blocking foreign key constraints referencing BusinessStructure...');
                                const dropFksQuery = `
              DO $$
              DECLARE
                  r RECORD;
              BEGIN
                  FOR r IN (
                      SELECT 
                          tc.table_schema, 
                          tc.table_name, 
                          tc.constraint_name
                      FROM 
                          information_schema.table_constraints AS tc 
                          JOIN information_schema.constraint_column_usage AS ccu
                            ON ccu.constraint_name = tc.constraint_name
                            AND ccu.table_schema = tc.table_schema
                      WHERE ccu.table_name = 'BusinessStructure' 
                        AND tc.constraint_type = 'FOREIGN KEY'
                        AND tc.constraint_name NOT LIKE 'fk_%_bsref'
                  ) LOOP
                      EXECUTE 'ALTER TABLE "' || r.table_schema || '"."' || r.table_name || '" DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '" CASCADE;';
                  END LOOP;
              END $$;
            `;
                                try {
                                    await client.query(dropFksQuery);
                                    console.log('Cleaned up blocking foreign keys successfully.');
                                }
                                catch (e) {
                                    console.warn('Could not drop foreign keys referencing BusinessStructure:', e.message);
                                }
                                console.log('Ensuring foreign key constraints for BusinessStructureRef...');
                                const fkTb = ['"Rap"."BankAccountTypes"', '"Gnr"."BaseSettings"', '"Acc"."VoucherType"', '"Gnr"."Currency"', '"Acc"."DetailedTypes"', '"Gnr"."GeoLocations"', '"Rap"."Banks"'];
                                for (const table of fkTb) {
                                    const q = `
                  DO $$ 
                  BEGIN 
                      BEGIN
                          ALTER TABLE ${table} 
                          ADD CONSTRAINT fk_${table.replace(/["\.]/g, '')}_bsref 
                          FOREIGN KEY ("BusinessStructureRef") 
                          REFERENCES "Gnr"."BusinessStructure"("BusinessStructureID")
                          ON DELETE CASCADE;
                      EXCEPTION
                          WHEN duplicate_object THEN null;
                          WHEN undefined_table THEN null;
                      END;
                  END $$;
               `;
                                    await client.query(q);
                                }
                                console.log('Constraints ensured.');
                                await client.query('DROP TABLE IF EXISTS "public"."ReconcileBankStatementItem" CASCADE');
                                await client.query('DROP TABLE IF EXISTS "public"."ReconcileBankStatement" CASCADE');
                                try {
                                    await client.query(`
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "PricingMethod";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "StandardRate";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "ScrapExpenseSlAccountRef";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "ConsignmentOursSlAccountRef";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "ConsignmentOthersSlAccountRef";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "ConsignmentOffsetSlAccountRef";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "IndividualPrepaymentSlAccountRef";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "CorporatePrepaymentSlAccountRef";
                ALTER TABLE "Sle"."SalesAccountCategories" DROP COLUMN IF EXISTS "ScrapIncomeSlAccountRef";
                ALTER TABLE "Sle"."SalesAccountCategories" ADD COLUMN IF NOT EXISTS "CurrencyRef" bigint;
              `);
                                }
                                catch (e) { }
                                try {
                                    await client.query(`
                DO $$ 
                BEGIN 
                  -- Handle WarehouseReceipts -> WarehouseVouchers
                  BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseVouchers') 
                       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseReceipts') THEN
                      DROP TABLE "Inv"."WarehouseVouchers" CASCADE;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseReceipts') THEN
                      ALTER TABLE "Inv"."WarehouseReceipts" RENAME TO "WarehouseVouchers";
                    END IF;
                  EXCEPTION WHEN OTHERS THEN NULL;
                  END;

                  -- Handle WarehouseReceiptDetails -> WarehouseVouchersDetails
                  BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseVouchersDetails') 
                       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseReceiptDetails') THEN
                      DROP TABLE "Inv"."WarehouseVouchersDetails" CASCADE;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseReceiptDetails') THEN
                      ALTER TABLE "Inv"."WarehouseReceiptDetails" RENAME TO "WarehouseVouchersDetails";
                    END IF;
                  EXCEPTION WHEN OTHERS THEN NULL;
                  END;

                  -- Handle WarehouseReceiptFactors -> WarehouseVouchersFactors
                  BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseVouchersFactors') 
                       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseReceiptFactors') THEN
                      DROP TABLE "Inv"."WarehouseVouchersFactors" CASCADE;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'WarehouseReceiptFactors') THEN
                      ALTER TABLE "Inv"."WarehouseReceiptFactors" RENAME TO "WarehouseVouchersFactors";
                    END IF;
                  EXCEPTION WHEN OTHERS THEN NULL;
                  END;

                  -- Update IDGeneration table
                  BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Gnr' AND table_name = 'IDGeneration') THEN
                      UPDATE "Gnr"."IDGeneration" SET "TableName" = 'WarehouseVouchers' WHERE "TableName" = 'WarehouseReceipts';
                      UPDATE "Gnr"."IDGeneration" SET "TableName" = 'WarehouseVouchersDetails' WHERE "TableName" = 'WarehouseReceiptDetails';
                      UPDATE "Gnr"."IDGeneration" SET "TableName" = 'WarehouseVouchersFactors' WHERE "TableName" = 'WarehouseReceiptFactors';
                    END IF;
                  EXCEPTION WHEN OTHERS THEN NULL;
                  END;
                END $$;
              `);
                                    console.log('Renamed WarehouseReceipts tables to WarehouseVouchers successfully.');
                                }
                                catch (err) {
                                    console.warn('Failed to rename WarehouseReceipts tables:', err.message);
                                }
                                try {
                                    await client.query(`
                ALTER TABLE "Inv"."WarehouseVouchersDetails" 
                ADD COLUMN IF NOT EXISTS "UnitPrice" decimal(18, 4) NOT NULL DEFAULT 0,
                ADD COLUMN IF NOT EXISTS "Discount" decimal(18, 4) NOT NULL DEFAULT 0,
                ADD COLUMN IF NOT EXISTS "TotalPrice" decimal(18, 4) NOT NULL DEFAULT 0;

                UPDATE "Inv"."WarehouseVouchersDetails" d
                SET "UnitPrice" = COALESCE(p."UnitPrice", 0),
                    "Discount" = COALESCE(p."Deductions", 0)
                FROM "Inv"."WarehouseVouchersPricing" p
                WHERE p."WarehouseVoucherDetailRef" = d."WarehouseReceiptDetailID"
                  AND (d."UnitPrice" = 0 OR d."UnitPrice" IS NULL);
              `);
                                }
                                catch (err) {
                                    console.warn('Failed to ensure UnitPrice and Discount in WarehouseVouchersDetails:', err.message);
                                }
                                try {
                                    await client.query(`
                DO $$ 
                BEGIN 
                  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'StocktakingSettings') THEN
                    IF NOT EXISTS (
                      SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'Inv' AND table_name = 'StocktakingSettings' AND column_name = 'StocktakingSettingID'
                    ) THEN
                      DROP TABLE "Inv"."StocktakingSettings" CASCADE;
                    END IF;
                  END IF;

                  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'StocktakingTagHeaders') THEN
                    ALTER TABLE "Inv"."StocktakingTagHeaders" ALTER COLUMN "OfficerPartyRef" DROP NOT NULL;
                    BEGIN
                      ALTER TABLE "Inv"."StocktakingTagHeaders" ALTER COLUMN "FiscalYearRef" DROP NOT NULL;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                      ALTER TABLE "Inv"."StocktakingTagHeaders" ADD COLUMN IF NOT EXISTS "StocktakingPeriod" VARCHAR(150);
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                      ALTER TABLE "Inv"."StocktakingTagHeaders" ADD COLUMN IF NOT EXISTS "Description" TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                  END IF;

                  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'StocktakingTagDetails') THEN
                    BEGIN
                      ALTER TABLE "Inv"."StocktakingTagDetails" ALTER COLUMN "TagNumber" DROP NOT NULL;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                  END IF;
                END $$;
              `);
                                    console.log('StocktakingSettings and StocktakingTagHeaders table compatibility verified.');
                                }
                                catch (err) {
                                    console.warn('Failed to verify StocktakingSettings/StocktakingTagHeaders table:', err.message);
                                }
                                await client.query('DROP TABLE IF EXISTS "Rap"."CheckPrintTemplates"');
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Rap"."ChequePrintTemplates" (
                "ChequePrintTemplateID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "BankRef" bigint NOT NULL,
                "Title" varchar(150) NOT NULL,
                "ImageBlob" text,
                "Config" jsonb NOT NULL DEFAULT '{}'::jsonb
              )
            `);
                                console.log('Table ChequePrintTemplates ensured.');
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ItemRequests" (
                "ItemRequestID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "BasisType" integer NOT NULL DEFAULT 1,
                "RequestNumber" varchar(50),
                "RequestDate" varchar(10),
                "WarehouseRef" bigint,
                "ProjectRef" bigint,
                "Description" varchar(500),
                "FiscalYearRef" bigint
              )
            `);
                                await client.query(`
              DO $$ 
              BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'ItemRequests') THEN
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "BasisType" integer NOT NULL DEFAULT 1;
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "RequestType" integer DEFAULT 1;
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "Priority" integer NOT NULL DEFAULT 1;
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "Status" integer NOT NULL DEFAULT 1;
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "Requester" varchar(200);
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "RequesterRef" bigint;
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "WarehouseRef" bigint;
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "ProjectRef" bigint;
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "Description" varchar(1000);
                  ALTER TABLE "Inv"."ItemRequests" ADD COLUMN IF NOT EXISTS "FiscalYearRef" bigint;
                  ALTER TABLE "Inv"."ItemRequests" ALTER COLUMN "RequestDate" DROP NOT NULL;
                END IF;
              END $$;
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ItemRequestDetails" (
                "ItemRequestDetailID" bigint PRIMARY KEY,
                "ItemRequestRef" bigint NOT NULL,
                "RowNo" integer NOT NULL DEFAULT 1,
                "ItemRef" bigint NOT NULL,
                "RequestQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "ApprovedQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "DeliveryDate" varchar(10),
                "Description" varchar(500),
                "TrackingFactorValues" jsonb
              )
            `);
                                await client.query(`
              DO $$ 
              BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'ItemRequestDetails') THEN
                  ALTER TABLE "Inv"."ItemRequestDetails" ADD COLUMN IF NOT EXISTS "TrackingFactorValues" jsonb;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'TemporaryItemReceiptDetails') THEN
                  ALTER TABLE "Inv"."TemporaryItemReceiptDetails" ADD COLUMN IF NOT EXISTS "TrackingFactorValues" jsonb;
                END IF;
              END $$;
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ServiceRequests" (
                "ServiceRequestID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "RequestNumber" bigint,
                "RequestDate" varchar(10),
                "Priority" integer NOT NULL DEFAULT 1,
                "Status" integer NOT NULL DEFAULT 1,
                "Requester" varchar(200),
                "RequesterRef" bigint,
                "Description" varchar(1000),
                "FiscalYearRef" bigint
              )
            `);
                                await client.query(`
              DO $$ 
              BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Inv' AND table_name = 'ServiceRequests') THEN
                  ALTER TABLE "Inv"."ServiceRequests" ADD COLUMN IF NOT EXISTS "RequesterRef" bigint;
                END IF;
              END $$;
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ServiceRequestDetails" (
                "ServiceRequestDetailID" bigint PRIMARY KEY,
                "ServiceRequestRef" bigint NOT NULL,
                "RowNo" integer NOT NULL DEFAULT 1,
                "ItemRef" bigint NOT NULL,
                "RequestQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "ApprovedQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "DeliveryDate" varchar(10),
                "Description" varchar(500)
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ItemSupplyRequests" (
                "ItemSupplyRequestID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "BasisType" integer NOT NULL DEFAULT 1,
                "RequestNumber" bigint,
                "RequestDate" timestamp without time zone,
                "RequestType" integer DEFAULT 1,
                "Priority" integer NOT NULL DEFAULT 1,
                "Status" integer NOT NULL DEFAULT 1,
                "Requester" varchar(200),
                "RequesterRef" bigint,
                "WarehouseRef" bigint,
                "Description" varchar(1000),
                "FiscalYearRef" bigint
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ItemSupplyRequestDetails" (
                "ItemSupplyRequestDetailID" bigint PRIMARY KEY,
                "ItemSupplyRequestRef" bigint NOT NULL,
                "RowNo" integer NOT NULL DEFAULT 1,
                "ItemRef" bigint NOT NULL,
                "RequestQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "ApprovedQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "DeliveryDate" timestamp without time zone,
                "Description" varchar(500)
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ServiceSupplyRequests" (
                "ServiceSupplyRequestID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "BasisType" integer NOT NULL DEFAULT 1,
                "RequestNumber" bigint,
                "RequestDate" timestamp without time zone,
                "RequestType" integer DEFAULT 1,
                "Priority" integer NOT NULL DEFAULT 1,
                "Status" integer NOT NULL DEFAULT 1,
                "Requester" varchar(200),
                "RequesterRef" bigint,
                "WarehouseRef" bigint,
                "Description" varchar(1000),
                "FiscalYearRef" bigint
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ServiceSupplyRequestDetails" (
                "ServiceSupplyRequestDetailID" bigint PRIMARY KEY,
                "ServiceSupplyRequestRef" bigint NOT NULL,
                "RowNo" integer NOT NULL DEFAULT 1,
                "ItemRef" bigint NOT NULL,
                "RequestQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "ApprovedQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "DeliveryDate" timestamp without time zone,
                "Description" varchar(500)
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Sle"."CustomerGroups" (
                "CustomerGroupID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "Code" varchar(50),
                "Title" varchar(250) NOT NULL,
                "Title2" varchar(250),
                "DetailedAccountRef" bigint,
                "Description" varchar(500),
                "ParentRef" bigint
              );

              CREATE TABLE IF NOT EXISTS "Sle"."Wallets" (
                "WalletID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "Code" integer NOT NULL,
                "Title" varchar(250) NOT NULL,
                "Title2" varchar(250) NOT NULL,
                "Nature" integer NOT NULL DEFAULT 1,
                "IsActive" boolean DEFAULT true,
                "Description" varchar(500)
              );

              CREATE TABLE IF NOT EXISTS "Sle"."SalesChannels" (
                "SalesChannelID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "Code" integer NOT NULL,
                "Title" varchar(250) NOT NULL,
                "Title2" varchar(250) NOT NULL,
                "Type" integer NOT NULL DEFAULT 1,
                "IsActive" boolean DEFAULT true,
                "Description" varchar(500)
              );

              CREATE TABLE IF NOT EXISTS "Sle"."SalesTypes" (
                "SalesTypeID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "Code" integer NOT NULL,
                "Title" varchar(255) NOT NULL,
                "Title2" varchar(255) NOT NULL,
                "IsActive" boolean DEFAULT true,
                "Description" text
              );

              CREATE TABLE IF NOT EXISTS "Sle"."DeliveryLocations" (
                "DeliveryLocationID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "Code" bigint NOT NULL,
                "Title" varchar(250) NOT NULL,
                "Title2" varchar(250) NOT NULL,
                "IsActive" boolean DEFAULT true,
                "Description" varchar(1000)
              );

              CREATE TABLE IF NOT EXISTS "Sle"."SalesCenters" (
                "SalesCenterID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "Code" integer NOT NULL,
                "Type" integer NOT NULL DEFAULT 4,
                "ReferenceRef" bigint,
                "Title" varchar(255) NOT NULL,
                "Title2" varchar(255) NOT NULL,
                "IsActive" boolean DEFAULT true,
                "Description" text
              );

              CREATE TABLE IF NOT EXISTS "Sle"."Customers" (
                "CustomerID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "Code" varchar(50) NOT NULL,
                "CustomerType" integer NOT NULL DEFAULT 1,
                "PartyRef" bigint,
                "CustomerGroupRef" bigint,
                "SalesChannels" text,
                "SalesStatus" integer NOT NULL DEFAULT 1,
                "SalesIntermediaryRef" bigint,
                "SalesTypes" text,
                "CurrencyRef" bigint,
                "IsActive" boolean DEFAULT true,
                "FiscalYearRef" bigint,
                "CreatorRef" bigint,
                "LastModifierRef" bigint
              );

              BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Gnr' AND table_name = 'IDGeneration') THEN
                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'Wallets', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'Wallets');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'SalesChannels', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'SalesChannels');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'SalesTypes', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'SalesTypes');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'DeliveryLocations', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'DeliveryLocations');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'SalesCenters', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'SalesCenters');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'Customers', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'Customers');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'SalesDocumentSettings', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'SalesDocumentSettings');
                END IF;
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Sle"."SalesDocumentSettings" (
                "SalesDocumentSettingsID" bigint PRIMARY KEY,
                "SalesDocumentType" integer NOT NULL,
                "HasBaseDocument" boolean DEFAULT false,
                "BaseDocumentTypes" text,
                "ShowWarehouse" boolean DEFAULT false,
                "DefaultWarehouseRef" bigint,
                "ShowSalesCenter" boolean DEFAULT false,
                "DefaultSalesCenterRef" bigint,
                "ShowSalesType" boolean DEFAULT false,
                "DefaultSalesTypeRef" bigint,
                "ShowDeliveryLocations" boolean DEFAULT false,
                "DefaultDeliveryLocationRef" bigint,
                "HasAccountingDocument" boolean DEFAULT false,
                "ShowPurchaseSalesParameters" boolean DEFAULT false,
                "IsActive" boolean DEFAULT true,
                "BusinessStructureRef" bigint,
                "CompanyRef" bigint,
                "CreatorRef" bigint,
                "CreationDate" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                "LastModifierRef" bigint,
                "LastModificationDate" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
              );
              CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SalesDocumentSettings_Type_BS"
                ON "Sle"."SalesDocumentSettings" ("SalesDocumentType", "BusinessStructureRef");
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ItemRequestTrackingFactors" (
                "ItemRequestTrackingFactorID" bigint PRIMARY KEY,
                "ItemRequestDetailRef" bigint NOT NULL,
                "TrackingFactorRef" bigint,
                "TrackingFactorCode" integer,
                "TrackingFactorName" varchar(200),
                "Quantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "FactorValue" text,
                "StartValue" varchar(100),
                "EndValue" varchar(100),
                "TrackingFactorValues" jsonb,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."ItemSupplyRequestTrackingFactors" (
                "ItemSupplyRequestTrackingFactorID" bigint PRIMARY KEY,
                "ItemSupplyRequestDetailRef" bigint NOT NULL,
                "TrackingFactorRef" bigint,
                "TrackingFactorCode" integer,
                "TrackingFactorName" varchar(200),
                "Quantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "FactorValue" text,
                "StartValue" varchar(100),
                "EndValue" varchar(100),
                "TrackingFactorValues" jsonb,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."PurchaseInvoiceTrackingFactors" (
                "PurchaseInvoiceTrackingFactorID" bigint PRIMARY KEY,
                "PurchaseInvoiceDetailRef" bigint NOT NULL,
                "TrackingFactorRef" bigint,
                "TrackingFactorCode" integer,
                "TrackingFactorName" varchar(200),
                "Quantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "FactorValue" text,
                "StartValue" varchar(100),
                "EndValue" varchar(100),
                "TrackingFactorValues" jsonb,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."TemporaryItemReceiptTrackingFactors" (
                "TemporaryItemReceiptTrackingFactorID" bigint PRIMARY KEY,
                "TemporaryItemReceiptDetailRef" bigint NOT NULL,
                "TrackingFactorRef" bigint,
                "TrackingFactorCode" integer,
                "TrackingFactorName" varchar(200),
                "Quantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "FactorValue" text,
                "StartValue" varchar(100),
                "EndValue" varchar(100),
                "TrackingFactorValues" jsonb,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint
              )
            `);
                                await client.query(`
              CREATE TABLE IF NOT EXISTS "Inv"."StocktakingCounts" (
                "StocktakingCountID" bigint PRIMARY KEY,
                "Version" bigint NOT NULL DEFAULT 1,
                "Creator" bigint NOT NULL DEFAULT 1,
                "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "LastModifier" bigint NOT NULL DEFAULT 1,
                "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                "CompanyRef" bigint,
                "BranchRef" bigint,
                "AgencyRef" bigint,
                "StocktakingTagHeaderRef" bigint NOT NULL,
                "WarehouseRef" bigint NOT NULL,
                "StocktakingDate" varchar(20) NOT NULL,
                "StocktakingNumber" bigint NOT NULL,
                "CountRound" integer NOT NULL DEFAULT 1,
                "Status" integer NOT NULL DEFAULT 1,
                "Description" varchar(500),
                "FiscalYearRef" bigint
              );

              CREATE TABLE IF NOT EXISTS "Inv"."StocktakingCountDetails" (
                "StocktakingCountDetailID" bigint PRIMARY KEY,
                "StocktakingCountRef" bigint NOT NULL,
                "RowNumber" integer NOT NULL DEFAULT 1,
                "ItemRef" bigint NOT NULL,
                "TagNumber" varchar(100),
                "CountedQuantity" numeric(18, 4) NOT NULL DEFAULT 0,
                "Description" varchar(500)
              );

              CREATE TABLE IF NOT EXISTS "Inv"."StocktakingCountTrackingFactors" (
                "StocktakingCountTrackingFactorID" bigint PRIMARY KEY,
                "StocktakingCountDetailRef" bigint NOT NULL,
                "TrackingFactorRef" bigint NOT NULL,
                "FactorValue" varchar(255),
                "CountedQuantity" numeric(18, 4) NOT NULL DEFAULT 0
              );

              -- Ensure IDGeneration entries exist
              BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Gnr' AND table_name = 'IDGeneration') THEN
                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'StocktakingCounts', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'StocktakingCounts');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'StocktakingCountDetails', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'StocktakingCountDetails');

                  INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                  SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'StocktakingCountTrackingFactors', 1
                  FROM "Gnr"."IDGeneration"
                  WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'StocktakingCountTrackingFactors');
                END IF;
              EXCEPTION WHEN OTHERS THEN NULL;
              END;
            `);
                                console.log('Tables StocktakingCounts, StocktakingCountDetails, and TrackingFactors ensured.');
                                await client.query(`
               CREATE SCHEMA IF NOT EXISTS "Sle";

               CREATE TABLE IF NOT EXISTS "Sle"."SalesAccountCategories" (
                 "SalesAccountCategoryID" bigint PRIMARY KEY,
                 "Version" bigint NOT NULL DEFAULT 1,
                 "Creator" bigint NOT NULL DEFAULT 1,
                 "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "LastModifier" bigint NOT NULL DEFAULT 1,
                 "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                 "CompanyRef" bigint,
                 "SalesAccountCategoryCode" integer,
                 "SalesAccountCategoryName" varchar(150),
                 "SalesAccountCategoryName2" varchar(150),
                 "IsActive" boolean DEFAULT true,
                 "InventorySlAccountRef" bigint,
                 "IndividualPurchaseSlAccountRef" bigint,
                 "CorporatePurchaseSlAccountRef" bigint,
                 "FreightSlAccountRef" bigint,
                 "SuspensePurchaseSlAccountRef" bigint,
                 "ForeignPurchaseSlAccountRef" bigint,
                 "CurrencyRef" bigint
               );

               CREATE TABLE IF NOT EXISTS "Sle"."SalesItemGroups" (
                 "SalesItemGroupID" bigint PRIMARY KEY,
                 "Version" bigint NOT NULL DEFAULT 1,
                 "Creator" bigint NOT NULL DEFAULT 1,
                 "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "LastModifier" bigint NOT NULL DEFAULT 1,
                 "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                 "CompanyRef" bigint,
                 "SalesItemGroupCode" varchar(50),
                 "SalesItemGroupName" varchar(250),
                 "SalesItemGroupName2" varchar(250),
                 "Description" varchar(500),
                 "IsMandatory" boolean DEFAULT false,
                 "ParentRef" bigint
               );

               CREATE TABLE IF NOT EXISTS "Sle"."SalesItemGroupFields" (
                 "SalesItemGroupFieldID" bigint PRIMARY KEY,
                 "Version" bigint NOT NULL DEFAULT 1,
                 "Creator" bigint NOT NULL DEFAULT 1,
                 "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "LastModifier" bigint NOT NULL DEFAULT 1,
                 "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                 "CompanyRef" bigint,
                 "SalesItemGroupRef" bigint NOT NULL,
                 "FieldTitle" varchar(150),
                 "FieldTitle2" varchar(150),
                 "FieldType" integer DEFAULT 1,
                 "IsRequired" boolean DEFAULT false,
                 "Options" varchar(500),
                 "RowNo" integer DEFAULT 0
               );

               CREATE TABLE IF NOT EXISTS "Sle"."SalesItemGroupRelatedProducts" (
                 "SalesItemGroupRelatedProductID" bigint PRIMARY KEY,
                 "Version" bigint NOT NULL DEFAULT 1,
                 "Creator" bigint NOT NULL DEFAULT 1,
                 "CreationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "CreateTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "LastModifier" bigint NOT NULL DEFAULT 1,
                 "LastModificationDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 "LastModificationTime" varchar(8) NOT NULL DEFAULT '00:00:00',
                 "BusinessStructureRef" bigint NOT NULL DEFAULT 2,
                 "CompanyRef" bigint,
                 "SalesItemGroupRef" bigint NOT NULL,
                 "ProductCode" varchar(100),
                 "ProductName" varchar(250),
                 "Unit" varchar(100),
                 "IsActive" boolean DEFAULT true,
                 "Description" varchar(500)
               );

               BEGIN
                 IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Gnr' AND table_name = 'IDGeneration') THEN
                   INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                   SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'SalesAccountCategories', 1
                   FROM "Gnr"."IDGeneration"
                   WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'SalesAccountCategories');

                   INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
                   SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'SalesItemGroups', 1
                   FROM "Gnr"."IDGeneration"
                   WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'SalesItemGroups');
                 END IF;
               EXCEPTION WHEN OTHERS THEN NULL;
               END;
             `);
                                console.log('Tables SalesAccountCategories, SalesItemGroups ensured in Sle schema.');
                                console.log('Tables ItemRequests, ItemRequestDetails, TrackingFactors, etc. ensured in Inv schema.');
                            }
                            catch (schemaErr) {
                                console.warn('[DB INIT] Non-fatal warning during schema initialization (PostgreSQL connection maintained):', schemaErr.message || schemaErr);
                            }
                            finally {
                                try {
                                    await client.end();
                                }
                                catch (e) { }
                            }
                        }
                        if (!connectionSuccessful) {
                            console.warn('[DB WARNING] PostgreSQL connection failed. Falling back to local SQLite database (database.sqlite)...');
                            dbConfig.type = 'sqlite';
                            dbConfig.database = 'database.sqlite';
                            delete dbConfig.url;
                            delete dbConfig.host;
                            delete dbConfig.port;
                            delete dbConfig.username;
                            delete dbConfig.password;
                            delete dbConfig.ssl;
                            delete dbConfig.extra;
                        }
                    }
                    return dbConfig;
                },
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 1000,
                }]),
            gateway_module_1.GatewayModule,
            auth_module_1.AuthModule,
            core_module_1.CoreModule,
            accounting_module_1.AccountingModule,
            common_module_1.CommonModule,
            rap_module_1.RapModule,
            cnt_module_1.CntModule,
            inv_module_1.InvModule,
            sle_module_1.SleModule,
            rpt_module_1.RptModule,
            dfb_module_1.DfbModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PermissionsGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_validation_guard_1.TenantValidationGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: license_enforcement_guard_1.LicenseEnforcementGuard,
            },
        ],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
//# sourceMappingURL=app.module.js.map