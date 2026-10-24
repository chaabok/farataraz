# Recent Changes / تغییرات اخیر

## تغییر #۱
- تاریخ: 2026-10-22 (UTC)
- عنوان: یکسان‌سازی ساختار فرم گروه‌بندی کالا فروش با فرم نرخ استاندارد کالا با استفاده از SimpleFormTwoRowTabbed
- جزئیات:
  - جایگزینی کامپوننت `SimpleForm` با `SimpleFormTwoRowTabbed` در کامپوننت `SalesItemGroup.tsx` جهت ایجاد ساختار دوردیفی (فیلدهای هدر در بالا و تب کالاهای مرتبط با اسپیلیتر قابل تغییر اندازه و نوار تب استاندارد در پایین) مشابه فرم نرخ استاندارد کالا.
- فایل‌های ایجادشده / ویرایش‌شده:
  - `/components/forms/sle/SalesItemGroup.tsx`
  - `/RECENT_CHANGES.md`

## تغییر #۲
- تاریخ: 2026-10-22 (UTC)
- عنوان: حذف کامل اسکرول و گاتر اسکرول‌بار از جدول تب کالاهای مرتبط با تنظیم `overflow-hidden`
- جزئیات:
  - تغییر کلاس اسکرول `overflow-x-auto overflow-y-hidden` به `overflow-hidden` در فیلدست محتوای جدول `TabCellRow.tsx` جهت حذف قطعی هرگونه نوار اسکرول یا کنترلر اسکرول.
- فایل‌های ایجادشده / ویرایش‌شده:
  - `/components/forms/TabCellRow.tsx`
  - `/RECENT_CHANGES.md`

## تغییر #۳
- تاریخ: 2026-10-22 (UTC)
- عنوان: مخفی‌سازی کامل اسکرول‌بار در جدول تب کالاهای مرتبط (TabCellRow)
- جزئیات:
  - افزودن کلاس‌های مخفی‌ساز اسکرول‌بار (`[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`) به فیلدست محتوای جدول در `TabCellRow.tsx`.
- فایل‌های ایجادشده / ویرایش‌شده:
  - `/components/forms/TabCellRow.tsx`
  - `/RECENT_CHANGES.md`

## تغییر #۴
- تاریخ: 2026-10-22 (UTC)
- عنوان: حذف ارتفاع ثابت و اسکرول عمودی اضافی از جدول اقلام مرتبط در فرم گروه‌بندی کالا فروش
- جزئیات:
  - جایگزینی ارتفاع ثابت `h-[300px]` با کلاس‌های انعطاف‌پذیر `flex flex-col min-h-0` در کانتینر دربرگیرنده `TabCellRow` در کامپوننت `SalesItemGroup.tsx`.
- فایل‌های ایجادشده / ویرایش‌شده:
  - `/components/forms/sle/SalesItemGroup.tsx`
  - `/RECENT_CHANGES.md`

## تغییر #۵
- تاریخ: 2026-10-22 (UTC)
- عنوان: حذف پدینگ بدنه فرم SimpleForm در فرم گروه‌بندی کالا فروش جهت چسبندگی کامل تب‌بار
- جزئیات:
  - افزودن `contentClassName="p-0"` به کامپوننت `SimpleForm` در `SalesItemGroup.tsx` برای حذف پدینگ پیش‌فرض (`px-6 pt-4 pb-6`) و حذف فضای خالی اطراف تب‌بار و جدول.
- فایل‌های ایجادشده / ویرایش‌شده:
  - `/components/forms/sle/SalesItemGroup.tsx`
  - `/RECENT_CHANGES.md`
