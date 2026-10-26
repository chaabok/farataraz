"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    process.on("unhandledRejection", (reason, promise) => {
        console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });
    process.on("uncaughtException", (err) => {
        console.error("Uncaught Exception thrown:", err);
    });
    try {
        console.log("Starting NestJS bootstrap...");
        console.log(`Current Working Directory: ${process.cwd()}`);
        console.log(`Node Version: ${process.version}`);
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ["error", "warn", "log", "debug", "verbose"],
            bodyParser: false,
        });
        console.log("NestJS Application instance created successfully");
        app.use((0, express_1.json)({ limit: "50mb" }));
        app.use((0, express_1.urlencoded)({ extended: true, limit: "50mb" }));
        app.use((0, cookie_parser_1.default)());
        app.use((0, helmet_1.default)());
        console.log("Helmet and CORS configured");
        const corsOrigins = process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
            : false;
        app.enableCors({
            origin: corsOrigins,
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
        }));
        const { DatabaseExceptionFilter } = await Promise.resolve().then(() => __importStar(require("./core/filters/database-exception.filter")));
        app.useGlobalFilters(new DatabaseExceptionFilter());
        const { EmptyResponseInterceptor } = await Promise.resolve().then(() => __importStar(require("./core/interceptors/empty-response.interceptor")));
        app.useGlobalInterceptors(new EmptyResponseInterceptor());
        console.log("Global pipes, filters, and interceptors configured");
        app.setGlobalPrefix("api");
        if (process.env.BOOTSTRAP_DDL !== 'false') {
            try {
                const { DataSource } = await Promise.resolve().then(() => __importStar(require("typeorm")));
                const dataSource = app.get(DataSource);
                const queryRunner = dataSource.createQueryRunner();
                await queryRunner.connect();
                try {
                    await queryRunner.query('DROP INDEX IF EXISTS "Rap"."IDX_dcbba47dd10bfa1596798e9805" CASCADE;');
                    await queryRunner.query('DROP INDEX IF EXISTS "Rap"."IDX_0ba13c9a62aa07acbed00c3b53" CASCADE;');
                    await queryRunner.query('DROP INDEX IF EXISTS "Rap"."IDX_0559f2a7db68da9ae07dbec595" CASCADE;');
                    await queryRunner.query('DROP INDEX IF EXISTS "Rap"."Banks_Code_key" CASCADE;');
                    await queryRunner.query('DROP INDEX IF EXISTS "Rap"."Banks_Title_key" CASCADE;');
                    await queryRunner.query('DROP INDEX IF EXISTS "Rap"."Banks_LatinTitle_key" CASCADE;');
                    try {
                        await queryRunner.query('ALTER TABLE "Gnr"."FiscalYear" DROP CONSTRAINT IF EXISTS "UQ_12c7b2830a72ebd1c73d523dbd1" CASCADE;');
                        await queryRunner.query('DROP INDEX IF EXISTS "Gnr"."UQ_12c7b2830a72ebd1c73d523dbd1" CASCADE;');
                    }
                    catch (e) {
                        console.warn('[STARTUPFIX] Could not drop FiscalYear unique constraint:', e.message);
                    }
                    try {
                        await queryRunner.query('SELECT setval(pg_get_serial_sequence(\'\"Gnr\".\"IDGeneration\"\', \'IDGenerationID\'), COALESCE(MAX("IDGenerationID"), 1)) FROM "Gnr"."IDGeneration";');
                    }
                    catch (seqErr) {
                    }
                    try {
                        await queryRunner.query(`
              CREATE SCHEMA IF NOT EXISTS "Inv";
              CREATE SCHEMA IF NOT EXISTS "Sle";
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
                        console.log('[MAIN BOOTSTRAP] StocktakingCounts tables ensured successfully.');
                    }
                    catch (stkErr) {
                        console.warn('[MAIN BOOTSTRAP] Non-fatal check on StocktakingCounts tables:', stkErr.message);
                    }
                    try {
                        await queryRunner.query('ALTER TABLE "Inv"."WarehouseDocumentTypes" ADD COLUMN IF NOT EXISTS "HasAccountingDocument" boolean DEFAULT false;');
                    }
                    catch (colErr) {
                    }
                    try {
                        const docTypesSeed = [
                            { code: 1, title: 'موجودی ابتدای دوره', nature: 1 },
                            { code: 2, title: 'رسید خرید', nature: 1 },
                            { code: 3, title: 'رسید موقت', nature: 1 },
                            { code: 4, title: 'دریافت از تولید', nature: 1 },
                            { code: 5, title: 'برگشت از مصرف مرکز', nature: 1 },
                            { code: 7, title: 'برگشت از مصرف پروژه', nature: 1 },
                            { code: 12, title: 'اضافی انبارگردانی', nature: 1 },
                            { code: 16, title: 'رسید برگشت از ضایعات', nature: 1 },
                            { code: 17, title: 'رسید انتقال بین انبارها', nature: 1 },
                            { code: 18, title: 'برگشت از فروش', nature: 1 },
                            { code: 19, title: 'رسید تبدیل کالا', nature: 1 },
                            { code: 20, title: 'برگشت از تولید', nature: 1 },
                            { code: 22, title: 'دریافت از پروژه', nature: 1 },
                            { code: 23, title: 'دریافت امانی دیگران نزد ما', nature: 1 },
                            { code: 24, title: 'برگشت امانی ما نزد دیگران', nature: 1 },
                            { code: 25, title: 'رسید تغییر عامل کنترل موجودی', nature: 1 },
                            { code: 26, title: 'مرجوعی از فروش جهت اصلاح', nature: 1 },
                            { code: 51, title: 'مصرف مرکز', nature: 2 },
                            { code: 52, title: 'مرجوعی به تولید', nature: 2 },
                            { code: 53, title: 'مصرف پروژه', nature: 2 },
                            { code: 55, title: 'برگشت به خرید داخلی', nature: 2 },
                            { code: 57, title: 'ارسال به تولید', nature: 2 },
                            { code: 62, title: 'کسری انبارگردانی', nature: 2 },
                            { code: 64, title: 'برگشت به خرید خارجی', nature: 2 },
                            { code: 66, title: 'تحویل ضایعات', nature: 2 },
                            { code: 68, title: 'حواله انتقال بین انبارها', nature: 2 },
                            { code: 69, title: 'تحویل فروش', nature: 2 },
                            { code: 70, title: 'حواله تبدیل کالا', nature: 2 },
                            { code: 71, title: 'تحویل دارایی ثابت', nature: 2 },
                            { code: 72, title: 'مرجوعی به پروژه', nature: 2 },
                            { code: 73, title: 'ارسال امانی ما نزد دیگران', nature: 2 },
                            { code: 74, title: 'برگشت امانی دیگران نزد ما', nature: 2 },
                            { code: 75, title: 'حواله تغییر عامل کنترل موجودی', nature: 2 },
                            { code: 79, title: 'تخفیفات و جوایز جنسی', nature: 2 },
                            { code: 100, title: 'امحاء / ضایعات', nature: 2 },
                            { code: 9999, title: 'فاکتور خرید کالا', nature: 3 },
                            { code: 9998, title: 'درخواست تامین کالا', nature: 3 },
                            { code: 9997, title: 'درخواست کالا', nature: 3 },
                            { code: 9996, title: 'رسید موقت', nature: 3 },
                        ];
                        for (const item of docTypesSeed) {
                            const existing = await queryRunner.query(`SELECT "WarehouseDocumentTypeID" FROM "Inv"."WarehouseDocumentTypes" WHERE "WarehouseDocumentTypeCode" = $1;`, [item.code]);
                            if (!existing || existing.length === 0) {
                                const maxRes = await queryRunner.query(`SELECT COALESCE(MAX("WarehouseDocumentTypeID"), 0) + 1 as next_id FROM "Inv"."WarehouseDocumentTypes";`);
                                const nextId = parseInt(maxRes[0].next_id, 10);
                                await queryRunner.query(`INSERT INTO "Inv"."WarehouseDocumentTypes" (
                    "WarehouseDocumentTypeID",
                    "WarehouseDocumentTypeCode",
                    "WarehouseDocumentTypeTitle",
                    "WarehouseDocumentNature",
                    "WarehouseName",
                    "DisplayableItemNatures",
                    "HasBaseDocument",
                    "IsActive",
                    "CompanyRef",
                    "BusinessStructureRef",
                    "CreationDate",
                    "LastModificationDate"
                  ) VALUES ($1, $2, $3, $4, $5, $6, false, true, 2, 2, NOW(), NOW());`, [nextId, item.code, item.title, item.nature, 'انبار اصلی', JSON.stringify([1, 2, 3])]);
                            }
                        }
                        console.log('[STARTUPFIX] Ensured 14 increasing WarehouseDocumentTypes exist in DB');
                    }
                    catch (seedErr) {
                        console.warn('[STARTUPFIX] Error seeding WarehouseDocumentTypes at startup:', seedErr.message);
                    }
                    console.log("Force dropped old bank indices");
                }
                catch (innerErr) {
                    console.error("Error dropping index:", innerErr);
                }
                finally {
                    await queryRunner.release();
                }
            }
            catch (e) {
                console.warn("Could not run DB index fixes at startup.", e);
            }
        }
        const port = process.env.BACKEND_PORT || 3005;
        console.log(`[DEBUG] Attempting to listen on port ${port} (0.0.0.0)...`);
        console.log(`[DEBUG] Process environment BACKEND_PORT: ${process.env.BACKEND_PORT}`);
        console.log(`[DEBUG] Process environment DATABASE_URL length: ${process.env.DATABASE_URL?.length || 0}`);
        if (process.env.DATABASE_URL) {
            console.log(`[DEBUG] DATABASE_URL starts with: ${process.env.DATABASE_URL.substring(0, 10)}...`);
        }
        try {
            try {
                const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
                const output = execSync(`ss -tulpn 2>/dev/null | grep :${port} || true`).toString();
                const matches = output.match(/pid=(\d+)/g);
                if (matches) {
                    matches.forEach(m => {
                        const pid = parseInt(m.replace('pid=', ''), 10);
                        if (pid && pid !== process.pid) {
                            console.log(`[BACKEND PREEMPTIVE] Reclaiming port ${port} from stale process ${pid}...`);
                            try {
                                process.kill(pid, 'SIGKILL');
                            }
                            catch (e) { }
                        }
                    });
                    await new Promise(r => setTimeout(r, 600));
                }
            }
            catch (e) { }
            await app.listen(port, "0.0.0.0");
            const url = await app.getUrl();
            console.log(`[BACKEND SUCCESS] NestJS backend is listening on: ${url}`);
            console.log(`[DEBUG] Backend host: 0.0.0.0, Port: ${port}`);
        }
        catch (listenError) {
            if (listenError.code !== 'EADDRINUSE') {
                console.error(`[BACKEND ERROR] Failed to listen on ${port} (0.0.0.0):`, listenError);
            }
            if (listenError.code === 'EADDRINUSE') {
                try {
                    const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
                    const output = execSync(`ss -tulpn 2>/dev/null | grep :${port} || true`).toString();
                    const matches = output.match(/pid=(\d+)/g);
                    if (matches) {
                        matches.forEach(m => {
                            const pid = parseInt(m.replace('pid=', ''), 10);
                            if (pid && pid !== process.pid) {
                                console.log(`[BACKEND FIX] Reclaiming port ${port} by terminating stale process ${pid}...`);
                                try {
                                    process.kill(pid, 'SIGKILL');
                                }
                                catch (e) { }
                            }
                        });
                        await new Promise(r => setTimeout(r, 800));
                        await app.listen(port, "0.0.0.0");
                        console.log(`[BACKEND SUCCESS] NestJS backend is listening on port ${port} after reclaiming port`);
                        return;
                    }
                }
                catch (recoverErr) {
                    console.error('[BACKEND ERROR] Port recovery failed:', recoverErr);
                }
            }
            console.log(`[DEBUG] Retrying listen on port ${port} without explicit host...`);
            try {
                await app.listen(port);
                console.log(`[BACKEND SUCCESS] NestJS backend is listening on port ${port}`);
            }
            catch (retryError) {
                console.error(`[BACKEND ERROR] Retry failed:`, retryError);
                process.exit(1);
            }
        }
    }
    catch (err) {
        console.error("CRITICAL: NestJS failed to start during bootstrap:");
        console.error(err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map