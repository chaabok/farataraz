import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import moment from 'moment-jalaali';

/**
 * Converts various date values (Jalali string, ISO string, Date object)
 * to a standardized Jalali date string "YYYY/MM/DD".
 */
export function toJalaliDateString(val: any): string {
  if (!val) return '';
  try {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      // If string starts with Jalali year 13xx or 14xx
      if (/^1[34]\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(trimmed)) {
        const datePart = trimmed.split('T')[0].split(' ')[0].replace(/-/g, '/');
        const parts = datePart.split('/');
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${y}/${m}/${d}`;
      }
      const m = moment(trimmed);
      if (m.isValid()) return m.format('jYYYY/jMM/jDD');
    }
    if (val instanceof Date) {
      const m = moment(val);
      if (m.isValid()) return m.format('jYYYY/jMM/jDD');
    }
  } catch (e) {}
  return String(val || '').split('T')[0];
}

/**
 * Validates whether document Date is BEFORE OR EQUAL TO the Stocktaking Tag Issuance Date
 * for any of the specified warehouses.
 * If tags were issued for a warehouse on date T_tag, saving documents on date <= T_tag is blocked.
 */
export async function validateStocktakingTagLock(
  dataSource: DataSource,
  warehouseRefs: (number | string | undefined | null)[],
  documentDate: any,
): Promise<void> {
  const validWarehouseIds = Array.from(
    new Set(
      warehouseRefs
        .map((w) => (w !== null && w !== undefined ? Number(w) : NaN))
        .filter((w) => !isNaN(w) && w > 0)
    )
  );

  if (validWarehouseIds.length === 0 || !documentDate) {
    return;
  }

  const docDateJalali = toJalaliDateString(documentDate);
  if (!docDateJalali) return;

  // Query tag details where tag numbers were issued
  const rows = await dataSource.query(
    `
    SELECT DISTINCT
      d."WarehouseRef" AS "warehouseRef",
      h."StocktakingDate" AS "tagDate",
      COALESCE(w."WarehouseTitle", w."WarehouseCode"::text, 'نامشخص') AS "warehouseName"
    FROM "Inv"."StocktakingTagDetails" d
    INNER JOIN "Inv"."StocktakingTagHeaders" h ON h."StocktakingTagHeaderID" = d."StocktakingTagHeaderRef"
    LEFT JOIN "Inv"."Warehouses" w ON w."WarehouseID" = d."WarehouseRef"
    WHERE d."WarehouseRef" = ANY($1::bigint[])
      AND d."TagNumber" IS NOT NULL
      AND TRIM(d."TagNumber") != ''
    ORDER BY h."StocktakingDate" DESC
    `,
    [validWarehouseIds]
  );

  if (!rows || rows.length === 0) {
    return;
  }

  for (const row of rows) {
    const tagDateJalali = toJalaliDateString(row.tagDate);
    if (tagDateJalali && docDateJalali <= tagDateJalali) {
      const warehouseTitle = row.warehouseName || 'انتخاب‌شده';
      throw new BadRequestException(
        `امکان ثبت یا تغییر سند در تاریخ (${docDateJalali}) برای انبار «${warehouseTitle}» وجود ندارد؛ زیرا برای این انبار در تاریخ (${tagDateJalali}) تگ انبارگردانی صادر شده است.`
      );
    }
  }
}
