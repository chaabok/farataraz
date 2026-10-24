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
exports.DatabaseSchemaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseSchemaService = class DatabaseSchemaService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        if (process.env.SYNC_DB === 'true') {
            await this.ensureSchemas();
        }
    }
    async ensureSchemas() {
        const schemas = ['Gnr', 'Acc', 'Rap', 'Cnt', 'Iam', 'Rpt', 'Inv', 'Sle', 'Dfb'];
        const dbType = this.dataSource.options.type;
        if (dbType === 'postgres') {
            console.log('PostgreSQL detected. Ensuring schemas exist:', schemas.join(', '));
            for (const schema of schemas) {
                try {
                    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
                    console.log(`Schema "${schema}" ensured.`);
                }
                catch (error) {
                    console.error(`Error creating schema "${schema}":`, error);
                }
            }
            try {
                await this.dataSource.query(`ALTER TABLE "Inv"."StocktakingTagHeaders" ADD COLUMN IF NOT EXISTS "Description" text;`);
                await this.dataSource.query(`ALTER TABLE "Sle"."CustomerGroups" ADD COLUMN IF NOT EXISTS "IsMandatory" boolean DEFAULT false;`);
                await this.dataSource.query(`ALTER TABLE "Inv"."Items" ADD COLUMN IF NOT EXISTS "SalesAccountCategoryRef" bigint;`);
                await this.dataSource.query(`
          CREATE TABLE IF NOT EXISTS "Sle"."SalesAccountCategories" (
            "SalesAccountCategoryID" bigint PRIMARY KEY,
            "SalesAccountCategoryCode" int,
            "SalesAccountCategoryName" varchar(150),
            "SalesAccountCategoryName2" varchar(150),
            "PricingMethod" int DEFAULT 1,
            "StandardRate" int DEFAULT 1,
            "IsActive" boolean DEFAULT true,
            "InventorySlAccountRef" bigint,
            "IndividualPurchaseSlAccountRef" bigint,
            "CorporatePurchaseSlAccountRef" bigint,
            "FreightSlAccountRef" bigint,
            "SuspensePurchaseSlAccountRef" bigint,
            "ForeignPurchaseSlAccountRef" bigint,
            "ScrapExpenseSlAccountRef" bigint,
            "ConsignmentOursSlAccountRef" bigint,
            "ConsignmentOthersSlAccountRef" bigint,
            "ConsignmentOffsetSlAccountRef" bigint,
            "IndividualPrepaymentSlAccountRef" bigint,
            "CorporatePrepaymentSlAccountRef" bigint,
            "ScrapIncomeSlAccountRef" bigint,
            "BusinessStructureRef" bigint DEFAULT 2,
            "CompanyRef" bigint,
            "Creator" bigint DEFAULT 1,
            "CreationDate" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            "LastModifier" bigint DEFAULT 1,
            "LastModificationDate" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
            "Version" bigint DEFAULT 1
          );
        `);
                await this.dataSource.query(`
          INSERT INTO "Gnr"."IDGeneration" ("IDGenerationID", "TableName", "LastID")
          SELECT (COALESCE(MAX("IDGenerationID"), 0) + 1), 'SalesAccountCategories', 1
          FROM "Gnr"."IDGeneration"
          WHERE NOT EXISTS (SELECT 1 FROM "Gnr"."IDGeneration" WHERE "TableName" = 'SalesAccountCategories');
        `).catch(() => { });
            }
            catch (e) {
            }
        }
    }
};
exports.DatabaseSchemaService = DatabaseSchemaService;
exports.DatabaseSchemaService = DatabaseSchemaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseSchemaService);
//# sourceMappingURL=database-schema.service.js.map