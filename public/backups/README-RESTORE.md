# بک‌آپ پروژه پارسا ERP — 2026-10-23

## فایل‌ها
- `parsa-db-backup-2026-10-23-22-48-56.sql` — دیتابیس کامل PostgreSQL (173 جدول، 462 ردیف، همه اسکیماها: Sle/Inv/Acc/Gnr/Iam/Dfb/Cnt/Rap/Rpt/public)
- `parsa-source-backup-2026-10-23-22-49.tar.gz` — سورس کامل پروژه (فرانت + بک‌اند + اسکریپت‌ها + مستندات؛ بدون node_modules/.next/pgdata)

## بازیابی دیتابیس
روش ۱ (با psql در هر سروری):
    psql -U postgres -c "CREATE DATABASE parsaDb ENCODING 'UTF8'"
    psql -U postgres -d parsaDb -f parsa-db-backup-2026-10-23-22-48-56.sql

روش ۲ (با Node در همین پروژه):
    node .zscripts/restore-database.js <مسیر-فایل-sql> parsaDb drop
  (پارامتر drop دیتابیس قبلی را کامل پاک و از صفر می‌سازد)

## بازیابی سورس
    tar xzf parsa-source-backup-2026-10-23-22-49.tar.gz -C <پوشه-مقصد>
    سپس: bun install  (و برای بک‌اند: node node_modules/typescript/bin/tsc --project backend/tsconfig.json)

## تأیید صحت
بازیابی آزمایشی این بک‌آپ در دیتابیس تست انجام شد — تعداد جدول‌ها و ردیف‌ها با سورس اصلی کاملاً برابر بود (MATCH_OK).
