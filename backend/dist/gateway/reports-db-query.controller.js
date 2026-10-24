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
var ReportsDbQueryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsDbQueryController = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const pg_identifier_util_1 = require("./pg-identifier.util");
const TABLE_MAP = {
    'حساب کل': { schema: 'Acc', table: 'Accounts' },
    'حساب معین': { schema: 'Acc', table: 'Accounts' },
    'حساب تفصیلی': { schema: 'Acc', table: 'DetailedAccounts' },
    'مرکز هزینه': { schema: 'Acc', table: 'CostCenter' },
    'گروه حساب': { schema: 'Acc', table: 'DetailedTypes' },
    'انواع سند': { schema: 'Acc', table: 'VoucherType' },
    'سند حسابداری': { schema: 'Acc', table: 'Voucher' },
    'اقلام سند': { schema: 'Acc', table: 'VoucherItem' },
    'اطلاعات تکمیلی': { schema: 'Acc', table: 'OtherDetails' },
    صندوق: { schema: 'Rap', table: 'Cashes' },
    'حساب بانکی': { schema: 'Rap', table: 'BankAccounts' },
    'نوع حساب بانکی': { schema: 'Rap', table: 'BankAccountTypes' },
    بانک: { schema: 'Rap', table: 'Banks' },
    'شعبه بانک': { schema: 'Rap', table: 'BankBranchs' },
    'دسته چک': { schema: 'Rap', table: 'Chequebooks' },
    'برگ چک': { schema: 'Rap', table: 'ChequebookItems' },
    'درگاه پرداخت': { schema: 'Rap', table: 'PaymentGateways' },
    'ساختار کسب و کار': { schema: 'Gnr', table: 'BusinessStructure' },
    'سال مالی': { schema: 'Gnr', table: 'FiscalYears' },
    ارزها: { schema: 'Gnr', table: 'Currency' },
    'نرخ برابری ارز': { schema: 'Gnr', table: 'CurrencyExchangeRates' },
    اشخاص: { schema: 'Gnr', table: 'Parties' },
    'مناطق جغرافیایی': { schema: 'Gnr', table: 'GeoLocations' },
};
let ReportsDbQueryController = ReportsDbQueryController_1 = class ReportsDbQueryController {
    constructor() {
        this.logger = new common_1.Logger(ReportsDbQueryController_1.name);
    }
    async query(data) {
        try {
            return await this.runQuery(data);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('DB_ERROR DETAILED:', error instanceof Error ? error.stack : error);
            throw new common_1.HttpException({ error: error?.message || 'خطای سرور' }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async runQuery(data) {
        const { action, script, tableName } = data || {};
        const rawDbUrl = (process.env.DATABASE_URL || '').trim();
        let dbConfig = {};
        if (rawDbUrl && rawDbUrl !== '""' && rawDbUrl !== "''") {
            let cleanUrl = rawDbUrl;
            if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"'))
                cleanUrl = cleanUrl.slice(1, -1);
            if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'"))
                cleanUrl = cleanUrl.slice(1, -1);
            cleanUrl = cleanUrl.trim();
            const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1') || cleanUrl.includes('::1');
            dbConfig = {
                connectionString: cleanUrl,
                ssl: isLocal ? false : { rejectUnauthorized: false },
                connectionTimeoutMillis: 30000,
            };
        }
        else {
            const host = (process.env.DB_HOST || 'localhost').trim();
            const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
            dbConfig = {
                host: host,
                port: parseInt(process.env.DB_PORT || '5432', 10),
                user: (process.env.DB_USERNAME || 'postgres').trim(),
                password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'postgres',
                database: (process.env.DB_DATABASE || 'postgres').trim(),
                ssl: isLocalHost ? false : { rejectUnauthorized: false },
                connectionTimeoutMillis: 30000,
            };
        }
        const client = new pg_1.Client(dbConfig);
        await client.connect();
        try {
            if (action === 'validateScript' || (action === 'getPreviewData' && script && script.trim())) {
                if (script) {
                    if (script.includes(';')) {
                        throw new common_1.HttpException({ valid: false, error: 'استفاده از کاراکتر (;) و اجرای چند دستوری در اسکریپت مجاز نیست.' }, common_1.HttpStatus.BAD_REQUEST);
                    }
                    const forbiddenKeywords = [
                        '\\bINSERT\\b', '\\bUPDATE\\b', '\\bDELETE\\b', '\\bDROP\\b', '\\bALTER\\b',
                        '\\bTRUNCATE\\b', '\\bGRANT\\b', '\\bREVOKE\\b', '\\bCREATE\\b', '\\bEXECUTE\\b',
                        '\\bVACUUM\\b', '\\bCOPY\\b', '\\bPG_\\b', '\\bSET\\b',
                    ];
                    const upperScript = script.toUpperCase();
                    for (const pattern of forbiddenKeywords) {
                        const regex = new RegExp(pattern, 'i');
                        if (regex.test(upperScript)) {
                            throw new common_1.HttpException({ valid: false, error: 'اسکریپت شامل دستورات غیرمجاز یا تغییر دهنده داده‌ها است.' }, common_1.HttpStatus.BAD_REQUEST);
                        }
                    }
                }
            }
            await client.query('SET default_transaction_read_only = on;');
            await client.query('SET statement_timeout = 5000;');
            if (action === 'getSchemasAndTables') {
                const tableRes = await client.query(`
          SELECT table_schema, table_name
          FROM information_schema.tables
          WHERE table_type = 'BASE TABLE'
            AND table_schema NOT IN ('pg_catalog', 'information_schema')
          ORDER BY table_schema, table_name;
        `);
                const schemaMap = {};
                tableRes.rows.forEach((r) => {
                    if (!schemaMap[r.table_schema]) {
                        schemaMap[r.table_schema] = [];
                    }
                    schemaMap[r.table_schema].push(r.table_name);
                });
                return { valid: true, schemaMap };
            }
            if (action === 'validateScript') {
                if (!script || !script.trim())
                    throw new Error('اسکریپت نمی‌تواند خالی باشد.');
                let testScript = script;
                testScript = testScript.replace(/@\w+\b/g, 'NULL');
                await client.query(`EXPLAIN ${testScript}`);
                const queryRes = await client.query(`SELECT * FROM (${testScript}) AS _test LIMIT 0`);
                const fields = queryRes.fields.map((f) => ({
                    name: f.name,
                    type: 'Script Column',
                }));
                return { valid: true, fields, tableName: 'اسکریپت' };
            }
            if (action === 'getTableFields') {
                let targetSchema = 'public';
                let targetTable = tableName || '';
                if (targetTable.includes('.')) {
                    const parts = targetTable.split('.');
                    targetSchema = parts[0];
                    targetTable = parts[1];
                    if (targetTable === 'VoucherTypes')
                        targetTable = 'VoucherType';
                }
                else {
                    const mapped = TABLE_MAP[targetTable];
                    if (mapped) {
                        targetSchema = mapped.schema;
                        targetTable = mapped.table;
                    }
                }
                const colRes = await client.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position
        `, [targetSchema, targetTable]);
                if (colRes.rows.length === 0) {
                    return {
                        valid: true,
                        fields: [
                            { name: 'شناسه', type: 'bigint' },
                            { name: 'عنوان', type: 'character varying' },
                            { name: 'کد', type: 'character varying' },
                        ],
                        relatedTables: [],
                    };
                }
                const fkRes = await client.query(`
          SELECT
              kcu.column_name,
              rel_tco.table_schema AS foreign_schema,
              rel_tco.table_name AS foreign_table,
              rel_kcu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tco
          JOIN information_schema.key_column_usage kcu
                    ON tco.constraint_schema = kcu.constraint_schema
                   AND tco.constraint_name = kcu.constraint_name
          JOIN information_schema.referential_constraints rco
                    ON tco.constraint_schema = rco.constraint_schema
                   AND tco.constraint_name = rco.constraint_name
          JOIN information_schema.table_constraints rel_tco
                    ON rco.unique_constraint_schema = rel_tco.constraint_schema
                   AND rco.unique_constraint_name = rel_tco.constraint_name
          JOIN information_schema.key_column_usage rel_kcu
                    ON rel_tco.constraint_schema = rel_kcu.constraint_schema
                   AND rel_tco.constraint_name = rel_kcu.constraint_name
                   AND kcu.position_in_unique_constraint = rel_kcu.ordinal_position
          WHERE tco.constraint_type = 'FOREIGN KEY'
            AND tco.table_schema = $1
            AND tco.table_name = $2;
        `, [targetSchema, targetTable]);
                const fetchTableMetadata = async (clientObj, schemaName, tblName, depth, maxDepth, fkName) => {
                    if (depth > maxDepth)
                        return [];
                    const colResInner = await clientObj.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = $1 AND table_name = $2
            ORDER BY ordinal_position
          `, [schemaName, tblName]);
                    const fkResInner = await clientObj.query(`
            SELECT
                kcu.column_name,
                rel_tco.table_schema AS foreign_schema,
                rel_tco.table_name AS foreign_table,
                rel_kcu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tco
            JOIN information_schema.key_column_usage kcu
                      ON tco.constraint_schema = kcu.constraint_schema
                     AND tco.constraint_name = kcu.constraint_name
            JOIN information_schema.referential_constraints rco
                      ON tco.constraint_schema = rco.constraint_schema
                     AND tco.constraint_name = rco.constraint_name
            JOIN information_schema.table_constraints rel_tco
                      ON rco.unique_constraint_schema = rel_tco.constraint_schema
                     AND rco.unique_constraint_name = rel_tco.constraint_name
            JOIN information_schema.key_column_usage rel_kcu
                      ON rel_tco.constraint_schema = rel_kcu.constraint_schema
                     AND rel_tco.constraint_name = rel_kcu.constraint_name
                     AND kcu.position_in_unique_constraint = rel_kcu.ordinal_position
            WHERE tco.constraint_type = 'FOREIGN KEY'
              AND tco.table_schema = $1
              AND tco.table_name = $2;
          `, [schemaName, tblName]);
                    const fkMap = {};
                    for (const r of fkResInner.rows) {
                        fkMap[r.column_name] = { schema: r.foreign_schema, table: r.foreign_table, pk: r.foreign_column_name };
                    }
                    const fieldsData = [];
                    for (const r of colResInner.rows) {
                        const baseField = {
                            name: r.column_name,
                            type: r.data_type,
                            ...(depth > 0 ? { isFromFk: true, parentFkName: fkName } : {}),
                        };
                        if (fkMap[r.column_name] && depth < maxDepth) {
                            const fk = fkMap[r.column_name];
                            baseField['foreignSchema'] = fk.schema;
                            baseField['foreignTable'] = fk.table;
                            baseField['foreignPK'] = fk.pk;
                            baseField['childrenFields'] = await fetchTableMetadata(clientObj, fk.schema, fk.table, depth + 1, maxDepth, r.column_name);
                        }
                        fieldsData.push(baseField);
                    }
                    return fieldsData;
                };
                const fields = await fetchTableMetadata(client, targetSchema, targetTable, 0, 2);
                const relRes = await client.query(`
          SELECT
              tco.table_schema,
              tco.table_name
          FROM information_schema.table_constraints tco
          JOIN information_schema.referential_constraints rco
                    ON tco.constraint_schema = rco.constraint_schema
                   AND tco.constraint_name = rco.constraint_name
          JOIN information_schema.table_constraints rel_tco
                    ON rco.unique_constraint_schema = rel_tco.constraint_schema
                   AND rco.unique_constraint_name = rel_tco.constraint_name
          WHERE tco.constraint_type = 'FOREIGN KEY'
            AND rel_tco.table_schema = $1
            AND rel_tco.table_name = $2;
        `, [targetSchema, targetTable]);
                const relatedTables = relRes.rows.map(r => `"${r.table_schema}"."${r.table_name}"`);
                const uniqueRelatedTables = [...new Set(relatedTables)];
                const relatedTablesWithFields = [];
                for (const tbl of uniqueRelatedTables) {
                    const parts = tbl.replace(/"/g, '').split('.');
                    const schemaName = parts[0];
                    const tblName = parts[1];
                    try {
                        const relatedFields = await fetchTableMetadata(client, schemaName, tblName, 0, 1);
                        relatedTablesWithFields.push({
                            tableName: tbl,
                            fields: relatedFields,
                        });
                    }
                    catch (e) {
                        this.logger.error('Error fetching related table columns:', e instanceof Error ? e.stack : e);
                    }
                }
                return {
                    valid: true,
                    fields,
                    relatedTables: uniqueRelatedTables,
                    relatedTablesWithFields,
                };
            }
            if (action === 'getPreviewData') {
                const { fields, params } = data || {};
                let resultData = [];
                if (script && script.trim()) {
                    try {
                        let finalScript = script;
                        const values = [];
                        if (params && typeof params === 'object') {
                            let idx = 1;
                            for (const [k, v] of Object.entries(params)) {
                                const regex = new RegExp(`@${k}\\b`, 'g');
                                if (regex.test(finalScript)) {
                                    finalScript = finalScript.replace(regex, `$${idx}`);
                                    values.push(v);
                                    idx++;
                                }
                            }
                        }
                        finalScript = finalScript.replace(/@\w+\b/g, 'NULL');
                        const res = await client.query(`SELECT * FROM (${finalScript}) AS _preview LIMIT 1000`, values);
                        resultData = res.rows;
                    }
                    catch (e) {
                        this.logger.error('Preview error:', e instanceof Error ? e.stack : e);
                    }
                }
                else if (tableName) {
                    let targetSchema = 'public';
                    let targetTable = tableName;
                    if (tableName.includes('.')) {
                        const parts = tableName.split('.');
                        targetSchema = parts[0];
                        targetTable = parts[1];
                        if (targetTable === 'VoucherTypes')
                            targetTable = 'VoucherType';
                    }
                    else {
                        const mapped = TABLE_MAP[tableName];
                        if (mapped) {
                            targetSchema = mapped.schema;
                            targetTable = mapped.table;
                        }
                    }
                    let selectList = ['main.*'];
                    let joins = '';
                    if (!(0, pg_identifier_util_1.isValidPgIdentifier)(targetSchema) || !(0, pg_identifier_util_1.isValidPgIdentifier)(targetTable)) {
                        throw new common_1.HttpException({ valid: false, error: 'نام جدول گزارش نامعتبر است.' }, common_1.HttpStatus.BAD_REQUEST);
                    }
                    if (fields && Array.isArray(fields)) {
                        for (const f of fields) {
                            if (!(0, pg_identifier_util_1.isValidPgIdentifier)(f.name) || !(0, pg_identifier_util_1.isValidPgIdentifier)(f.foreignTable) || !(0, pg_identifier_util_1.isValidPgIdentifier)(f.foreignSchema)) {
                                throw new common_1.HttpException({ valid: false, error: 'نام فیلد یا جدول مرتبط نامعتبر است.' }, common_1.HttpStatus.BAD_REQUEST);
                            }
                            const childNames = Array.isArray(f.childrenFields) ? f.childrenFields.map(cf => cf.name) : [];
                            for (const cn of childNames) {
                                if (!(0, pg_identifier_util_1.isValidPgIdentifier)(cn)) {
                                    throw new common_1.HttpException({ valid: false, error: 'نام فیلد مرتبط نامعتبر است.' }, common_1.HttpStatus.BAD_REQUEST);
                                }
                            }
                        }
                    }
                    try {
                        if (fields && Array.isArray(fields)) {
                            for (const f of fields) {
                                if (f.childrenFields && f.childrenFields.length > 0 && f.foreignTable && f.foreignSchema) {
                                    const fAlias = `fk_${f.name}`;
                                    const foreignPK = (0, pg_identifier_util_1.isValidPgIdentifier)(f.foreignPK) ? f.foreignPK : `${f.foreignTable}ID`;
                                    joins +=
                                        ` LEFT JOIN "${f.foreignSchema}"."${f.foreignTable}" AS ${fAlias} ` +
                                            `ON main."${f.name}" = ${fAlias}."${foreignPK}" `;
                                    for (const cf of f.childrenFields) {
                                        selectList.push(`${fAlias}."${cf.name}" AS "${f.name}.${cf.name}"`);
                                    }
                                }
                            }
                        }
                    }
                    catch (identErr) {
                        throw new common_1.HttpException({ valid: false, error: identErr?.message || 'شناسه‌های کوئری نامعتبرند.' }, common_1.HttpStatus.BAD_REQUEST);
                    }
                    try {
                        const checkRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`, [targetSchema, targetTable]);
                        if (checkRes.rows.length === 0 && targetSchema === 'public') {
                            return {
                                valid: false,
                                error: 'جدول گزارش نامعتبر است (رابطه وجود ندارد). احتمالا جدول را به درستی در گزارش ثبت نکرده‌اید.',
                            };
                        }
                        const queryStr = `SELECT ${selectList.join(', ')} FROM "${targetSchema}"."${targetTable}" AS main ${joins} LIMIT 10`;
                        const res = await client.query(queryStr);
                        resultData = res.rows;
                    }
                    catch (e) {
                        this.logger.error('Preview Query Error:', e instanceof Error ? e.stack : e);
                        return {
                            valid: false,
                            error: 'خطا در اجرای کوئری پیش‌نمایش: ' + (e?.message || 'خطای سرور'),
                        };
                    }
                }
                return { valid: true, data: resultData };
            }
            return { valid: false, error: 'عملیات نامعتبر است.' };
        }
        finally {
            await client.end();
        }
    }
};
exports.ReportsDbQueryController = ReportsDbQueryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsDbQueryController.prototype, "query", null);
exports.ReportsDbQueryController = ReportsDbQueryController = ReportsDbQueryController_1 = __decorate([
    (0, common_1.Controller)('reports/db-query')
], ReportsDbQueryController);
//# sourceMappingURL=reports-db-query.controller.js.map