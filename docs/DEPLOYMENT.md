# راهنمای استقرار پارسا ERP (پس از اعمال فازهای ۱ و ۲)

## اجرای محلی (Development)

```bash
bun install
cp .env.example .env   # مقادیر را تنظیم کنید
bun run dev            # فرانت‌اند :3000 + بک‌اند :3005 + کامپایل خودکار بک‌اند
```

پیش‌فرض‌های توسعه: `DB_SYNCHRONIZE=true` و `BOOTSTRAP_DDL=true` (اگر در `.env` تنظیم نشده باشند) — دیتابیس fresh به‌صورت خودکار ساخته می‌شود.

## اجرای پروداکشن با Docker

```bash
JWT_SECRET=$(openssl rand -hex 48) docker compose up -d --build
```

اسکیمای دیتابیس از طریق migration ها اعمال می‌شود (`backend/src/migrations`)؛ در این پروفایل `DB_SYNCHRONIZE=false` و `BOOTSTRAP_DDL=false` است.

## Migration های دیتابیس

```bash
cd backend
npm run migration:generate   # تولید migration از اختلاف entity ها
npm run migration:run        # اعمال migration ها
npm run migration:revert     # بازگردانی آخرین migration
```

اتصال از طریق `DATABASE_URL` یا متغیرهای `DB_*` خوانده می‌شود.

## لایسنس (Ed25519)

- کلید خصوصی: `backend/keys/license_private_key.pem` (هرگز commit/ship نشود)
- کلید عمومی: `backend/keys/license_public_key.pem` یا متغیر `LICENSE_PUBLIC_KEY`
- تولید جفت‌کلید: `cd backend && npm run license:keygen`
- صدور لایسنس: `cd backend && npm run license:generate -- --licensee "شرکت شما" --expiry 2030-12-31 --features all`
- در صورت نبود لایسنس معتبر در حالت production، همه‌ی endpoint ها (به‌جز auth/license/health) با خطای 403 بسته می‌شوند؛ فعال‌سازی از پنجره‌ی لایسنس در UI با ورود رشته‌ی لایسنس انجام می‌شود.
- کلید اضطراری: `LICENSE_ENFORCEMENT=false`
- در حالت dev بدون لایسنس، یک DEV-TRIAL هفت‌روزه‌ی درون‌حافظه‌ای صادر می‌شود (هیچ‌وقت ذخیره نمی‌شود).

## متغیرهای محیطی مهم

| متغیر | توضیح |
|---|---|
| `DATABASE_URL` یا `DB_*` | اتصال PostgreSQL |
| `JWT_SECRET` | اجباری در production (اگر نباشد کرش می‌کند) |
| `DB_SYNCHRONIZE` | `false` در production (مبتنی بر migration) |
| `BOOTSTRAP_DDL` | `false` در production (DDL هنگام بوت خاموش) |
| `DB_SSL` | `false`/`true` — تعیین صریح SSL |
| `LICENSE_PUBLIC_KEY` | کلید عمومی لایسنس (base64/PEM) |
| `LICENSE_ENFORCEMENT` | `false` = خاموش‌کردن اجباری لایسنس |
| `CORS_ORIGINS` | مباحای CORS (پیش‌فرض: same-origin) |
| `FRONTEND_PUBLIC_DIR` / `FRONTEND_ROOT` | مسیر پوشه public/ریشه فرانت‌اند برای upload/fonts/help |
