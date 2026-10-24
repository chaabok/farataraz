import { Controller, Post, Body, HttpCode, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { Client } from 'pg';
import { isValidPgIdentifier } from './pg-identifier.util';

// Minimal mapping from Persian UI names to DB Schema/Table
const TABLE_MAP: Record<string, { schema: string; table: string }> = {
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

interface DbQueryField {
  name?: string;
  foreignTable?: string;
  foreignSchema?: string;
  foreignPK?: string;
  childrenFields?: DbQueryField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface DbQueryBody {
  action?: string;
  script?: string;
  tableName?: string;
  fields?: DbQueryField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
}

/**
 * Ported from the former Next.js route `app/api/reports/db-query/route.ts`
 * (Task 5-a). Auth is now enforced by the global JwtAuthGuard instead of the
 * route's manual JWT check.
 *
 * SECURITY invariants (ported verbatim):
 *  - multi-statement scripts (any `;`) are rejected;
 *  - a strict keyword blacklist rejects DDL/DML/system functions;
 *  - `SET default_transaction_read_only = on` + 5s statement_timeout;
 *  - every client-supplied schema/table/column identifier is validated with
 *    isValidPgIdentifier BEFORE interpolation (identifier failures are 400s).
 */
@Controller('reports/db-query')
export class ReportsDbQueryController {
  private readonly logger = new Logger(ReportsDbQueryController.name);

  @Post()
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query(@Body() data?: DbQueryBody): Promise<any> {
    try {
      return await this.runQuery(data);
    } catch (error) {
      // Parity with the legacy Next route: unexpected errors surface as
      // 400 { error: message } instead of a generic 500.
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('DB_ERROR DETAILED:', error instanceof Error ? error.stack : error);
      throw new HttpException(
        { error: (error as Error)?.message || 'خطای سرور' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async runQuery(data?: DbQueryBody): Promise<any> {
    const { action, script, tableName } = data || {};

    const rawDbUrl = (process.env.DATABASE_URL || '').trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbConfig: any = {};

    if (rawDbUrl && rawDbUrl !== '""' && rawDbUrl !== "''") {
      let cleanUrl = rawDbUrl;
      if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) cleanUrl = cleanUrl.slice(1, -1);
      if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'")) cleanUrl = cleanUrl.slice(1, -1);
      cleanUrl = cleanUrl.trim();

      const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1') || cleanUrl.includes('::1');
      dbConfig = {
        connectionString: cleanUrl,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000,
      };
    } else {
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

    const client = new Client(dbConfig);
    await client.connect();

    try {
      if (action === 'validateScript' || (action === 'getPreviewData' && script && script.trim())) {
        if (script) {
          // 1. Block multi-statement queries (semicolons) to prevent SQL injection chaining
          if (script.includes(';')) {
            throw new HttpException(
              { valid: false, error: 'استفاده از کاراکتر (;) و اجرای چند دستوری در اسکریپت مجاز نیست.' },
              HttpStatus.BAD_REQUEST,
            );
          }

          // 2. Strict blacklist check for DDL / DML / System functions
          const forbiddenKeywords = [
            '\\bINSERT\\b', '\\bUPDATE\\b', '\\bDELETE\\b', '\\bDROP\\b', '\\bALTER\\b',
            '\\bTRUNCATE\\b', '\\bGRANT\\b', '\\bREVOKE\\b', '\\bCREATE\\b', '\\bEXECUTE\\b',
            '\\bVACUUM\\b', '\\bCOPY\\b', '\\bPG_\\b', '\\bSET\\b',
          ];
          const upperScript = script.toUpperCase();
          for (const pattern of forbiddenKeywords) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(upperScript)) {
              throw new HttpException(
                { valid: false, error: 'اسکریپت شامل دستورات غیرمجاز یا تغییر دهنده داده‌ها است.' },
                HttpStatus.BAD_REQUEST,
              );
            }
          }
        }
      }

      // Enforce read-only session & query timeout for all DB operations in this endpoint.
      // NOTE: "SET TRANSACTION READ ONLY" outside an explicit transaction is a no-op;
      // default_transaction_read_only actually enforces read-only on implicit transactions.
      await client.query('SET default_transaction_read_only = on;');
      await client.query('SET statement_timeout = 5000;'); // 5s timeout

      if (action === 'getSchemasAndTables') {
        const tableRes = await client.query(`
          SELECT table_schema, table_name
          FROM information_schema.tables
          WHERE table_type = 'BASE TABLE'
            AND table_schema NOT IN ('pg_catalog', 'information_schema')
          ORDER BY table_schema, table_name;
        `);

        // Group by schema
        const schemaMap: Record<string, string[]> = {};
        tableRes.rows.forEach((r: { table_schema: string; table_name: string }) => {
          if (!schemaMap[r.table_schema]) {
            schemaMap[r.table_schema] = [];
          }
          schemaMap[r.table_schema].push(r.table_name);
        });

        return { valid: true, schemaMap };
      }

      if (action === 'validateScript') {
        if (!script || !script.trim()) throw new Error('اسکریپت نمی‌تواند خالی باشد.');

        let testScript = script;
        // Mock any @parameters to NULL so EXPLAIN doesn't fail on syntax error
        testScript = testScript.replace(/@\w+\b/g, 'NULL');

        // 1. Syntactic Validation
        await client.query(`EXPLAIN ${testScript}`);

        // 2. Get column metadata safely
        const queryRes = await client.query(`SELECT * FROM (${testScript}) AS _test LIMIT 0`);
        const fields = queryRes.fields.map((f: { name: string }) => ({
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
          // Backward compatibility for reports saved before the fix
          if (targetTable === 'VoucherTypes') targetTable = 'VoucherType';
        } else {
          const mapped = TABLE_MAP[targetTable];
          if (mapped) {
            targetSchema = mapped.schema;
            targetTable = mapped.table;
          }
        }

        // Query columns for the mapped/target table
        const colRes = await client.query(
          `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position
        `,
          [targetSchema, targetTable],
        );

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

        // Fetch outgoing foreign keys
        const fkRes = await client.query(
          `
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
        `,
          [targetSchema, targetTable],
        );

        const fetchTableMetadata = async (
          clientObj: Client,
          schemaName: string,
          tblName: string,
          depth: number,
          maxDepth: number,
          fkName?: string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ): Promise<any[]> => {
          if (depth > maxDepth) return [];
          const colResInner = await clientObj.query(
            `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = $1 AND table_name = $2
            ORDER BY ordinal_position
          `,
            [schemaName, tblName],
          );

          const fkResInner = await clientObj.query(
            `
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
          `,
            [schemaName, tblName],
          );

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fkMap: Record<string, { schema: string; table: string; pk: string }> = {};
          for (const r of fkResInner.rows as Array<Record<string, string>>) {
            fkMap[r.column_name] = { schema: r.foreign_schema, table: r.foreign_table, pk: r.foreign_column_name };
          }

          const fieldsData = [];
          for (const r of colResInner.rows as Array<{ column_name: string; data_type: string }>) {
            const baseField: Record<string, unknown> = {
              name: r.column_name,
              type: r.data_type,
              ...(depth > 0 ? { isFromFk: true, parentFkName: fkName } : {}),
            };
            if (fkMap[r.column_name] && depth < maxDepth) {
              const fk = fkMap[r.column_name];
              baseField['foreignSchema'] = fk.schema;
              baseField['foreignTable'] = fk.table;
              baseField['foreignPK'] = fk.pk;

              baseField['childrenFields'] = await fetchTableMetadata(
                clientObj,
                fk.schema,
                fk.table,
                depth + 1,
                maxDepth,
                r.column_name,
              );
            }
            fieldsData.push(baseField);
          }
          return fieldsData;
        };

        const fields = await fetchTableMetadata(client, targetSchema, targetTable, 0, 2);

        // Query relations (tables that have a foreign key to this table)
        // Which means, find tables that depend on THIS table!
        const relRes = await client.query(
          `
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
        `,
          [targetSchema, targetTable],
        );

        const relatedTables = (relRes.rows as Array<{ table_schema: string; table_name: string }>).map(
          r => `"${r.table_schema}"."${r.table_name}"`,
        );
        const uniqueRelatedTables = [...new Set(relatedTables)];

        // Retrieve fields (columns) for each related referencing table
        const relatedTablesWithFields: Array<{ tableName: string; fields: unknown[] }> = [];
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
          } catch (e) {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let resultData: any[] = [];

        if (script && script.trim()) {
          try {
            let finalScript = script;
            const values: unknown[] = [];
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
            // Replace any remaining unmapped parameters with NULL to prevent syntax errors
            finalScript = finalScript.replace(/@\w+\b/g, 'NULL');

            // The preview gets up to 1000 rows (10 in the legacy UI preview is handled client-side).
            const res = await client.query(`SELECT * FROM (${finalScript}) AS _preview LIMIT 1000`, values);
            resultData = res.rows;
          } catch (e) {
            this.logger.error('Preview error:', e instanceof Error ? e.stack : e);
          }
        } else if (tableName) {
          let targetSchema = 'public';
          let targetTable = tableName;
          if (tableName.includes('.')) {
            const parts = tableName.split('.');
            targetSchema = parts[0];
            targetTable = parts[1];
            // Backward compatibility for reports saved before the fix
            if (targetTable === 'VoucherTypes') targetTable = 'VoucherType';
          } else {
            const mapped = TABLE_MAP[tableName];
            if (mapped) {
              targetSchema = mapped.schema;
              targetTable = mapped.table;
            }
          }

          let selectList = ['main.*'];
          let joins = '';

          // Validate every client-supplied identifier BEFORE interpolation (SQLi guard).
          // SECURITY (Task 5-a): identifier failures are hard 400s.
          if (!isValidPgIdentifier(targetSchema) || !isValidPgIdentifier(targetTable)) {
            throw new HttpException(
              { valid: false, error: 'نام جدول گزارش نامعتبر است.' },
              HttpStatus.BAD_REQUEST,
            );
          }

          if (fields && Array.isArray(fields)) {
            for (const f of fields) {
              if (!isValidPgIdentifier(f.name) || !isValidPgIdentifier(f.foreignTable) || !isValidPgIdentifier(f.foreignSchema)) {
                throw new HttpException(
                  { valid: false, error: 'نام فیلد یا جدول مرتبط نامعتبر است.' },
                  HttpStatus.BAD_REQUEST,
                );
              }
              const childNames = Array.isArray(f.childrenFields) ? f.childrenFields.map(cf => cf.name) : [];
              for (const cn of childNames) {
                if (!isValidPgIdentifier(cn)) {
                  throw new HttpException(
                    { valid: false, error: 'نام فیلد مرتبط نامعتبر است.' },
                    HttpStatus.BAD_REQUEST,
                  );
                }
              }
            }
          }

          try {
            if (fields && Array.isArray(fields)) {
              for (const f of fields) {
                // Must have childrenFields to warrant a join, plus schema/table defined
                if (f.childrenFields && f.childrenFields.length > 0 && f.foreignTable && f.foreignSchema) {
                  const fAlias = `fk_${f.name}`;
                  const foreignPK = isValidPgIdentifier(f.foreignPK) ? f.foreignPK : `${f.foreignTable}ID`;

                  joins +=
                    ` LEFT JOIN "${f.foreignSchema}"."${f.foreignTable}" AS ${fAlias} ` +
                    `ON main."${f.name}" = ${fAlias}."${foreignPK}" `;

                  for (const cf of f.childrenFields) {
                    selectList.push(`${fAlias}."${cf.name}" AS "${f.name}.${cf.name}"`);
                  }
                }
              }
            }
          } catch (identErr) {
            throw new HttpException(
              { valid: false, error: (identErr as Error)?.message || 'شناسه‌های کوئری نامعتبرند.' },
              HttpStatus.BAD_REQUEST,
            );
          }
          try {
            const checkRes = await client.query(
              `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
              [targetSchema, targetTable],
            );
            if (checkRes.rows.length === 0 && targetSchema === 'public') {
              return {
                valid: false,
                error:
                  'جدول گزارش نامعتبر است (رابطه وجود ندارد). احتمالا جدول را به درستی در گزارش ثبت نکرده‌اید.',
              };
            }
            const queryStr = `SELECT ${selectList.join(', ')} FROM "${targetSchema}"."${targetTable}" AS main ${joins} LIMIT 10`;
            const res = await client.query(queryStr);
            resultData = res.rows;
          } catch (e) {
            this.logger.error('Preview Query Error:', e instanceof Error ? e.stack : e);
            return {
              valid: false,
              error: 'خطا در اجرای کوئری پیش‌نمایش: ' + ((e as Error)?.message || 'خطای سرور'),
            };
          }
        }

        // Convert large objects (dates, etc) inside to string if needed, or simply return rows
        return { valid: true, data: resultData };
      }

      return { valid: false, error: 'عملیات نامعتبر است.' };
    } finally {
      await client.end();
    }
  }
}
