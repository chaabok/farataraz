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
var DbInitController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbInitController = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let DbInitController = DbInitController_1 = class DbInitController {
    constructor() {
        this.logger = new common_1.Logger(DbInitController_1.name);
    }
    async init() {
        const rawDbUrl = (process.env.DATABASE_URL || '').trim();
        const rawDbHost = (process.env.DB_HOST || 'localhost').trim();
        const rawDbPort = parseInt(process.env.DB_PORT || '5432', 10);
        const rawDbUser = (process.env.DB_USERNAME || 'postgres').trim();
        const rawDbPass = (process.env.DB_PASSWORD || '').trim();
        const rawDbName = (process.env.DB_DATABASE || 'postgres').trim();
        let clientConfig = {};
        if (rawDbUrl && rawDbUrl !== '""' && rawDbUrl !== "''") {
            let cleanUrl = rawDbUrl;
            if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"'))
                cleanUrl = cleanUrl.slice(1, -1);
            if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'"))
                cleanUrl = cleanUrl.slice(1, -1);
            cleanUrl = cleanUrl.trim();
            const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1');
            clientConfig = {
                connectionString: cleanUrl,
                ssl: isLocal ? false : { rejectUnauthorized: false },
                connectionTimeoutMillis: 10000,
            };
        }
        else {
            clientConfig = {
                host: rawDbHost,
                port: rawDbPort,
                user: rawDbUser,
                password: rawDbPass,
                database: rawDbName,
                ssl: rawDbHost === 'localhost' || rawDbHost === '127.0.0.1' ? false : { rejectUnauthorized: false },
                connectionTimeoutMillis: 10000,
            };
        }
        const client = new pg_1.Client(clientConfig);
        try {
            await client.connect();
            const schemas = ['Gnr', 'Acc', 'Rap', 'Cnt', 'Iam', 'Rpt', 'Inv', 'Dfb', 'Sle'];
            for (const schema of schemas) {
                await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
            }
            await client.query(`
      DROP TABLE IF EXISTS "Inv"."CustomerGroups" CASCADE;
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
    `);
            await client.query(`
      ALTER TABLE "Inv"."StocktakingTagHeaders" ADD COLUMN IF NOT EXISTS "Description" text;

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

      -- Ensure IDGeneration entries
      DO $$
      DECLARE
        v_max_id bigint;
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'Gnr' AND table_name = 'IDGeneration') THEN
          SELECT COALESCE(MAX("IDGenerationID"), 0) INTO v_max_id FROM "Gnr"."IDGeneration";

          IF NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'StocktakingCounts') THEN
            v_max_id := v_max_id + 1;
            INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES (v_max_id, 'StocktakingCounts', 1);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'StocktakingCountDetails') THEN
            v_max_id := v_max_id + 1;
            INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES (v_max_id, 'StocktakingCountDetails', 1);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'StocktakingCountTrackingFactors') THEN
            v_max_id := v_max_id + 1;
            INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES (v_max_id, 'StocktakingCountTrackingFactors', 1);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'Customers') THEN
            v_max_id := v_max_id + 1;
            INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID") VALUES (v_max_id, 'Customers', 1);
          END IF;
        END IF;
      END $$;
    `);
            const checkRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE (table_schema = 'Inv' AND table_name IN ('StocktakingCounts', 'StocktakingCountDetails', 'StocktakingCountTrackingFactors'))
         OR (table_schema = 'Sle' AND table_name IN ('Customers'))
      ORDER BY table_schema, table_name;
    `);
            await client.end();
            return {
                success: true,
                message: 'Database schema and StocktakingCounts tables verified and created successfully.',
                verifiedTables: checkRes.rows.map((r) => r.table_name),
            };
        }
        catch (err) {
            try {
                await client.end();
            }
            catch {
            }
            this.logger.error('Error in /api/db-init:', err instanceof Error ? err.stack : err);
            throw new common_1.InternalServerErrorException({
                success: false,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
};
exports.DbInitController = DbInitController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbInitController.prototype, "init", null);
exports.DbInitController = DbInitController = DbInitController_1 = __decorate([
    (0, common_1.Controller)('db-init')
], DbInitController);
//# sourceMappingURL=db-init.controller.js.map