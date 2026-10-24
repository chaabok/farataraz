# راهنمای جامع قفل‌گذاری و محافظت از نرم‌افزار در برابر کپی غیرمجاز

این سند شامل یک مشاوره تخصصی و جامع در زمینه روش‌ها، ابزارها و استراتژی‌های مختلف قفل‌گذاری و محافظت از نرم‌افزار است تا از سوءاستفاده، شکستن قفل (Crack) و کپی غیرمجاز آن تا حد امکان جلوگیری شود.

---

### سوال کاربر (User Query)
> **درباره قفل گذاری روی نرم افزار به نحوی که از هرگونه سوء استفاده از نرم افزار و کپی غیرمجاز جلوگیری گردد مشاوره بدهید.**

---

### پاسخ و مشاوره تخصصی (Expert Advisory)

#### مقدمه و واقعیت اساسی امنیت نرم‌افزار
پیش از ورود به جزئیات فنی، یک اصل طلایی در دنیای امنیت نرم‌افزار وجود دارد: **هیچ قفل یا سیستم امنیتی ۱۰۰٪ غیرقابل نفوذ نیست.** هر برنامه‌ای که روی سیستم کاربر نهایی اجرا می‌شود (Client-side)، در نهایت قابل مهندسی معکوس و کرک شدن است؛ زیرا هکرها دسترسی فیزیکی و کامل به سخت‌افزار، حافظه موقت (RAM) و پردازنده دارند.

بنابراین، هدف از قفل‌گذاری بستن راه کپی نیست، بلکه **«بالا بردن هزینه اقتصادی و زمانی کرک»** است. ما باید کاری کنیم که هزینه و زمان مورد نیاز برای شکستن قفل نرم‌افزار بسیار بیشتر از ارزش خرید لایسنس قانونی آن باشد.

---

## ۱. انواع روش‌های قفل‌گذاری روی نرم‌افزار

امنیت نرم‌افزار معمولاً از طریق یکی از سه رویکرد زیر پیاده‌سازی می‌شود:

### الف) قفل‌های سخت‌افزاری (Hardware Dongles)
در این روش، نرم‌افزار برای اجرا نیاز به یک دانگل USB فیزیکی دارد. کدهای حساس نرم‌افزار مستقیماً در پردازنده داخلی دانگل اجرا می‌شوند یا داده‌ها با کلیدهای درون دانگل رمزنگاری می‌شوند.
*   **مزایا:** امنیت بسیار بالا؛ کپی کردن لایسنس سخت‌افزاری تقریباً غیرممکن است.
*   **معایب:** هزینه بالای خرید قفل‌ها برای هر مشتری، سختی فرآیند توزیع و ارسال پستی، ناسازگاری احتمالی با برخی سیستم‌ها و سیستم‌های مجازی (Virtual Machines).
*   **ابزارهای معروف:** Sentinel HASP, UniKey, Tiny Dongle.

### ب) قفل‌های نرم‌افزاری مبتنی بر امضای سخت‌افزاری (System-Bound Licensing)
در این روش، یک مشخصه منحصربه‌فرد از سخت‌افزار کاربر (مانند سریال پردازنده CPU، مک‌آدرس کارت شبکه، سریال مادربورد و هارد دیسک) خوانده شده و یک اثر انگشت سخت‌افزاری (Hardware Fingerprint) توليد می‌شود. لایسنس فقط و فقط برای همان سخت‌افزار صادر می‌شود.
*   **مزایا:** عدم نیاز به ارسال سخت‌افزار فیزیکی، هزینه پایین، فرآیند راه‌اندازی سریع به صورت ایمیلی یا اینترنتی.
*   **معایب:** اگر کاربر قطعه‌ای از سیستم خود را ارتقا دهد (مثلاً تعویض هارد یا مادربورد)، لایسنس باطل می‌شود و نیاز به فعال‌سازی مجدد دارد.

### ج) لایسنس‌های آنلاین و ابری (Cloud-Based Licensing)
نرم‌افزار در زمان اجرا یا به صورت دوره‌ای (مثلا روزانه یا هفتگی) به یک سرور لایسنس متصل شده و وضعیت معتبر بودن اشتراک کاربر را بررسی می‌کند.
*   **مزایا:** امکان ابطال لایسنس به صورت آنی، مدیریت متمرکز کاربران، امکان ارائه مدل‌های اشتراکی زمان‌دار (مانند اشتراک ماهانه).
*   **معایب:** نیاز مبرم به اینترنت (اگرچه می‌توان برای حالت آفلاین محدودیت مثلاً ۷ روزه تعریف کرد).

---

## ۲. تکنیک‌های پدافندی و ضد مهندسی معکوس (Anti-Reverse Engineering)

برای اینکه هکرها نتوانند قفل شما را دور بزنند (Bypass)، باید تکنیک‌های زیر را در برنامه خود اعمال کنید:

### ۱. ابهام‌سازی کد (Code Obfuscation)
بسیاری از زبان‌های برنامه‌نویسی مدرن مانند سی‌شارپ (C# / .NET)، جاوا (Java) و جاوا اسکریپت (JavaScript) به راحتی به سورس کدی بسیار خوانا دکامپایل (Decompile) می‌شوند. ابهام‌ساز با تغییر نام متغیرها، متدها، درهم‌ریختن جریان کنترل (Control Flow) و رمزنگاری رشته‌ها، کد را برای انسان و ابزارهای دی‌کامپایلر غیرقابل‌فهم می‌کند.
*   **ابزارها:** 
    *   برای دات‌نت: *Dotfuscator, ConfuserEx, Obfuscar*
    *   برای جاوا/اندروید: *ProGuard, R8, DexGuard*
    *   برای جاوااسکریپت: *javascript-obfuscator*

### ۲. حفاظت از فایل‌های اجرایی با پکرها (Packing & Crypters)
پکرها فایل اجرایی نهایی (EXE یا DLL) شما را فشرده و رمزنگاری می‌کنند. در زمان اجرا، این ابزارها ابتدا کدهای برنامه را در حافظه RAM رمزگشایی کرده و سپس اجرا می‌کنند. این کار مانع از آن می‌شود که هکر بتواند فایل شما را در ابزارهایی مانند IDA Pro یا x64dbg بررسی کند.
*   **ابزارهای معروف پرچمدار:** *VMProtect, Themida, Enigma Protector*. (ابزار VMProtect بخش‌هایی از کد شما را به یک زبان اسمبلی مجازی اختصاصی تبدیل می‌کند که کرک کردن آن عملاً کابوس هکرهاست).

### ۳. بررسی یکپارچگی فایل (Integrity Checks)
سیستم قفل باید بررسی کند که آیا هیچ‌کدام از فایل‌های نرم‌افزار، DLLها یا خود فایل اجرایی تغییر یافته‌اند یا خیر. این کار معمولاً با محاسبه مداوم هش (Hash مانند SHA-256) فایل‌ها و مقایسه آن با مقدار اصلی انجام می‌شود. در صورت عدم تطابق، برنامه فوراً بسته می‌شود.

### ۴. مکانیسم ضد دیباگ و ضد شبیه‌سازی (Anti-Debugging & Anti-VM)
هکرها برای فهمیدن سیستم قفل، برنامه را درون محیط‌های دیباگر یا ماشین‌های مجازی اجرا می‌کنند. شما باید کدهایی را در برنامه بنویسید که فعال بودن دیباگرها را شناسایی کند (مانند `IsDebuggerPresent` در ویندوز) یا اجرا در شبیه‌سازهایی مثل VMware و VirtualBox را تشخیص داده و فرآیند را متوقف کند.

---

## ۳. امن‌ترین معماری نرم‌افزاری چیست؟ (توصیه طلایی)

اگر می‌خواهید نرم‌افزار شما **صد در صد غیرقابل کرک** باشد، باید از استراتژی **«انتقال منطق به سرور» (Software as a Service - SaaS)** استفاده کنید.

در این مدل:
1.  برنامه کلاینت که روی سیستم نصب می‌شود، عملاً فقط یک واسط گرافیکی (UI) است.
2.  بخش اصلی، محاسبات حساس، الگوریتم‌های کلیدی و پردازش‌های سنگین داده‌ها در یک سرور امن (روي کلود یا هاست خصوصی شما) قرار دارد.
3.  کاربر برای انجام هر عملیاتی، اطلاعات را به سرور شما ارسال می‌کند و سرور پس از احراز هویت لایسنس، پاسخ را بازمی‌گرداند.
4.  در این حالت، هکر هیچ دسترسی فیزیکی به کدهای مدیریت داده ندارد و عملاً امکان کرک کردن آن صفر است.

---

## ۴. جدول مقایسه راهکارهای قفل‌گذاری

| روش حفاظت | سطح امنیت | هزینه پیاده‌سازی و نگهداری | تجربه کاربری (UX) | بهترین کاربرد |
| :--- | :---: | :---: | :---: | :--- |
| **قفل فیزیکی (دانگل USB)** | فوق‌العاده بالا | بسیار بالا (هزینه قطعه فیزیکی) | متوسط (اشغال پورت USB) | نرم‌افزارهای بسیار گران‌قیمت صنعتی و پزشکی |
| **قفل نرم‌افزاری محلی (امضای سخت‌افزار)** | متوسط رو به بالا | پایین تا متوسط | خوب (بدون نیاز به اینترنت همیشگی) | نرم‌افزارهای عمومی دسکتاپ آفلاین |
| **لایسنس آنلاین (کلود)** | بسیار بالا | متوسط (هزینه سرور) | عالی (فعال‌سازی سریع و خودکار) | نرم‌افزارهای مدرن، سیستم‌های اشتراکی |
| **معماری کلاینت-سرور (SaaS)** | **۱۰۰٪ غیرقابل کرک** | بالا (نیاز به توسعه سمت سرور) | وابسته به کیفیت اینترنت | اتوماسیون‌های اداری، نرم‌افزارهای مبتنی بر داده |

---

## ۵. چک‌پوینت‌های اجرایی برای یک قفل‌گذاری موفق

برای اجرای قفل‌گذاری روی نرم‌افزار خود، مراحل زیر را به ترتیب پیش ببرید:

1.  **بخش‌های حساس را با زبان‌های سیستم بنویسید:** اگر نرم‌افزار دسکتاپ می‌نویسید، حداقل بخش لایسنس و کدهای فوق‌العاده حساس را به صورت Native با زبان‌هایی مثل C++ یا Rust بنویسید و به صورت یک فایل DLL درآورید. دکامپایل کردن این زبان‌ها بسیار سخت‌تر از دات‌نت یا جاوا است.
2.  **فرآیند چک کردن لایسنس را پراکنده کنید:** یک خط کدِ چک کردن ساده مانند `if (isLicensed == false) exit();` برای هکرها به راحتی در چند ثانیه با تغییر یک بایت (مثلا تبدیل دستور `JZ` به `JNZ` در اسمبلی) دور زده می‌شود. به جای این، چک کردن لایسنس را در ده‌ها نقطه مختلف برنامه و به صورت غیرمستقیم توزیع کنید.
3.  **به تجربه کاربری آسیب نزنید:** قفل‌گذاری نباید کار با نرم‌افزار را برای مشتریان قانونی دلسردکننده یا فوق‌العاده سخت کند. سیستم فعال‌سازی را به ساده‌ترین شکل ممکن طراحی کنید.
4.  **کارتان را از ابتدا سخت نکنید:** اگر در اوایل مسیر کسب‌وکار خود هستید، لایسنس آنلاین ساده یا قفل‌های نرم‌افزاری از پیش‌ساخته هزینه کمتری داشته و به شما اجازه زمان‌گذاری روی بهبود کیفیت خود محصول را می‌دهد. پلتفرم‌هایی مانند **Keygen.sh** یا کتابخانه‌های آماده قفل‌گذاری می‌توانند نقطه شروع فوق‌العاده‌ای باشند.

---

## ۶. پیوست: کدهای اجرایی برای مینی‌برنامه‌های مدیریت لایسنس
پیرو درخواست شما مبنی بر ساخت ابزارهای جداگانه و محلی (بدون ارتباط با سورس تجاری برنامه)، دو اسکریپت پایتون همراه با رابط کاربری (GUI) حرفه‌ای طراحی شده‌اند. این کدها هیچ نیازی به پکیج‌های خارجی ندارند و صرفاً با اجرای پایتون قابل استفاده‌اند. این ابزارها تمامی موارد ذکر شده (۳۵ ماژول، ساختارهای مجاز، تنظیمات کاربران و چینش راست‌به‌چپ) را دارا می‌باشند.

### الف) برنامه استخراج‌کننده شناسه سخت‌افزاری (Hardware ID Extractor)
این مینی‌برنامه تنها در سیستم مشتری اجرا شده و مشخصات سخت‌افزاری یکتای دستگاه مشتری را روی کلیپ‌بورد کپی می‌کند.

فایل `hw_extractor.py`:
```python
import tkinter as tk
from tkinter import ttk, messagebox
import platform, subprocess, hashlib

def get_hardware_id():
    hw_data = platform.node() + platform.machine() + platform.processor()
    if platform.system() == "Windows":
        try:
            output = subprocess.check_output("wmic csproduct get uuid", shell=True, creationflags=subprocess.CREATE_NO_WINDOW).decode()
            hw_data += output.split('\n')[1].strip()
        except:
            pass
    return hashlib.sha256(hw_data.encode()).hexdigest().upper()[:16]

def copy_to_clipboard():
    root.clipboard_clear()
    root.clipboard_append(hw_id_var.get())
    messagebox.showinfo("موفق", "شناسه سخت‌افزاری با موفقیت در کلیپ‌بورد کپی شد")

root = tk.Tk()
root.title("Hardware ID Extractor")
root.geometry("400x200")
root.configure(bg="#2b2b2b")

style = ttk.Style()
style.theme_use('clam')
tk.Label(root, text="استخراج‌کننده شناسه سخت‌افزاری", bg="#2b2b2b", fg="white", font=("Tahoma", 14, "bold")).pack(pady=20)

hw_id_var = tk.StringVar(value=get_hardware_id())
frame = tk.Frame(root, bg="#2b2b2b")
frame.pack(pady=10)

entry = tk.Entry(frame, textvariable=hw_id_var, font=("Courier", 12, "bold"), width=20, justify="center", state="readonly")
entry.pack(side=tk.LEFT, padx=10)

btn_copy = tk.Button(frame, text="کپی شناسه", bg="#106ebe", fg="white", font=("Tahoma", 10), command=copy_to_clipboard, borderwidth=0, padx=15, pady=5)
btn_copy.pack(side=tk.LEFT)

root.mainloop()
```


### ب) برنامه تولیدکننده لایسنس (License Generator)
این برنامه صرفاً در اختیار مدیر/توسعه‌دهنده سیستم خواهد بود. تمامی ۳۵ نرم‌افزار به شکل راست‌چین شبکه‌ای به همراه چک‌باکس در سمت راستِ برچسب‌ها قرار گرفته است. پس از کلیک بر روی ذخیره، فایل خروجی به شکل JSON در دیسک ذخیره می‌شود که می‌توانید محتوای آن را بعداً برای سیستم لایسنس رمزنگاری کنید.

فایل `license_generator.py`:
```python
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import random, json, datetime

MODULES = [
    "حسابداری", "انبار و حسابداری انبار", "انبار ردیابی", "چندواحدی کالا",
    "فروش", "دارایی ثابت", "دریافت و پرداخت", "مدیریت سهام",
    "کنترل قراردادها", "نگهداری و تعمیرات", "زیرسیستم ارزی", "صورت های مالی",
    "گزارشات مدیریتی", "خرید و تدارکات", "سفارشات خارجی", "حقوق و دستمزد",
    "ماژول جذب و استخدام", "ماژول آموزش کارکنان", "مدیریت تردد", "برنامه ریزی تولید",
    "کنترل تحویل مواد", "بهای تمام شده", "پخش گرم", "پخش سرد",
    "اتوماسیون اداری", "سامانه مودیان", "خرده فروشی", "خدمات پس از فروش",
    "مدیریت ارتباط با مشتریان", "وبسایت آنلاین", "پیام رسان", "وب سرویس",
    "فرم ساز", "گزارش ساز", "مدیریت گردش کار"
]

class LicenseGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Parsa ERP - License Generator (Admin)")
        self.root.geometry("850x800")
        self.root.configure(bg="#2b2b2b")
        
        tk.Label(root, text="ERP تولید کننده لایسنس سیستم", bg="#2b2b2b", fg="white", font=("Tahoma", 18, "bold")).pack(pady=15)
        
        main_frame = tk.Frame(root, bg="#333333", padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # --- Top Section ---
        top_frame = tk.Frame(main_frame, bg="#333333")
        top_frame.pack(fill=tk.X, pady=5)
        
        # 1. Customer Code
        tk.Label(top_frame, text=":کد مشتری", bg="#333333", fg="white", font=("Tahoma", 10)).grid(row=0, column=3, sticky="e", pady=5)
        self.customer_code_var = tk.StringVar()
        self.customer_code_var.set(str(random.randint(100000, 999999)))
        tk.Entry(top_frame, textvariable=self.customer_code_var, width=25, font=("Courier", 10, "bold"), justify="center", state="readonly").grid(row=0, column=2, padx=10, pady=5)
        
        # 2. Customer Name
        tk.Label(top_frame, text=":نام مشتری", bg="#333333", fg="white", font=("Tahoma", 10)).grid(row=1, column=3, sticky="e", pady=5)
        self.name_var = tk.StringVar()
        tk.Entry(top_frame, textvariable=self.name_var, width=25, font=("Tahoma", 10), justify="right").grid(row=1, column=2, padx=10, pady=5)
        
        # 3. Hardware ID
        tk.Label(top_frame, text=":شناسه سخت افزاری", bg="#333333", fg="white", font=("Tahoma", 10)).grid(row=2, column=3, sticky="e", pady=5)
        self.hw_id_var = tk.StringVar()
        tk.Entry(top_frame, textvariable=self.hw_id_var, width=25, font=("Courier", 10), justify="center").grid(row=2, column=2, padx=10, pady=5)
        btn_paste = tk.Button(top_frame, text="Paste", command=self.paste_hw_id, bg="#106ebe", fg="white", borderwidth=0, padx=22)
        btn_paste.grid(row=2, column=1)
        
        # 4. Validity Period
        tk.Label(top_frame, text=":(روز) مدت اعتبار", bg="#333333", fg="white", font=("Tahoma", 10)).grid(row=3, column=3, sticky="e", pady=5)
        self.validity_var = tk.StringVar(value="0")
        tk.Entry(top_frame, textvariable=self.validity_var, width=10, font=("Courier", 10), justify="center").grid(row=3, column=2, sticky="e", padx=10, pady=5)
        tk.Label(top_frame, text="(صفر = ناوابسته/نامحدود)", bg="#333333", fg="#aaa", font=("Tahoma", 8)).grid(row=3, column=1, sticky="e", padx=5)
        
        # 5. Users Count
        tk.Label(top_frame, text=":تعداد کاربر مجاز", bg="#333333", fg="white", font=("Tahoma", 10)).grid(row=4, column=3, sticky="e", pady=5)
        self.users_count_var = tk.StringVar(value="1")
        tk.Entry(top_frame, textvariable=self.users_count_var, width=10, font=("Courier", 10), justify="center").grid(row=4, column=2, sticky="e", padx=10, pady=5)
        
        # 6. Activation Code
        tk.Label(top_frame, text=":کد فعال‌سازی", bg="#333333", fg="white", font=("Tahoma", 10)).grid(row=5, column=3, sticky="e", pady=5)
        self.activation_code_var = tk.StringVar()
        self.generate_activation_code()
        tk.Entry(top_frame, textvariable=self.activation_code_var, width=25, font=("Courier", 12, "bold"), justify="center", state="readonly").grid(row=5, column=2, padx=10, pady=5)
        btn_new_act = tk.Button(top_frame, text="تغییر تصادفی", command=self.generate_activation_code, bg="#555", fg="white", borderwidth=0, padx=10)
        btn_new_act.grid(row=5, column=1)

        top_frame.grid_columnconfigure(0, weight=1)

        # --- Structures Section ---
        struct_frame = tk.LabelFrame(main_frame, text=" نوع ساختار مجاز ", bg="#333333", fg="#ddd", font=("Tahoma", 10, "bold"), labelanchor="ne")
        struct_frame.pack(fill=tk.X, pady=10, ipadx=10, ipady=10)
        
        self.struct_vars = {}
        structures_info = [
            ("دفتر مرکزی", True, 2),
            ("شرکت", False, 0),
            ("شعبه", False, 0),
            ("نمایندگی", False, 0)
        ]
        
        for name, def_checked, def_val in structures_info:
            f = tk.Frame(struct_frame, bg="#333333")
            f.pack(side=tk.RIGHT, padx=10)
            
            chk_var = tk.BooleanVar(value=def_checked)
            spn_var = tk.IntVar(value=def_val)
            self.struct_vars[name] = {"enabled": chk_var, "count": spn_var}
            
            lbl = tk.Label(f, text=name, bg="#333333", fg="white", font=("Tahoma", 9))
            lbl.pack(side=tk.LEFT)
            cb = tk.Checkbutton(f, variable=chk_var, bg="#333333", selectcolor="#444")
            cb.pack(side=tk.LEFT)
            
            tk.Spinbox(f, from_=0, to=999, textvariable=spn_var, width=3, font=("Courier", 10)).pack(side=tk.LEFT, padx=5)

        # --- Modules Section ---
        modules_frame = tk.LabelFrame(main_frame, text=" نرم افزارها و ماژول های مجاز ", bg="#333333", fg="#ddd", font=("Tahoma", 10, "bold"), labelanchor="ne")
        modules_frame.pack(fill=tk.BOTH, expand=True, pady=5, ipadx=5, ipady=5)
        
        self.module_vars = {}
        num_cols = 4 
        for i, mod in enumerate(MODULES):
            row = i // num_cols
            col = num_cols - 1 - (i % num_cols)
            
            var = tk.BooleanVar(value=(mod == "حسابداری"))
            self.module_vars[mod] = var
            
            mf = tk.Frame(modules_frame, bg="#333333")
            mf.grid(row=row, column=col, sticky="e", padx=5, pady=2)
            
            # برچسب سمت چپ، چک‌باکس در سمت راست قرار می‌گیرد تا حالت راست‌چین رعایت شود
            lbl = tk.Label(mf, text=mod, bg="#333333", fg="white", font=("Tahoma", 9))
            lbl.pack(side=tk.LEFT)
            cb = tk.Checkbutton(mf, variable=var, bg="#333333", selectcolor="#444")
            cb.pack(side=tk.LEFT)
            
        for i in range(num_cols):
            modules_frame.grid_columnconfigure(i, weight=1)

        # --- Footer Section ---
        btn_frame = tk.Frame(main_frame, bg="#333333")
        btn_frame.pack(fill=tk.X, pady=15)
        
        btn_save = tk.Button(btn_frame, text="ذخیره در فایل", bg="#106ebe", fg="white", font=("Tahoma", 11, "bold"), borderwidth=0, padx=20, pady=8, cursor="hand2", command=self.save_to_file)
        btn_save.pack(side=tk.LEFT, expand=True)

    def paste_hw_id(self):
        try:
            self.hw_id_var.set(self.root.clipboard_get())
        except tk.TclError:
            pass
            
    def generate_activation_code(self):
        code = str(random.randint(1000000000, 9999999999))
        self.activation_code_var.set(code)

    def save_to_file(self):
        customer = self.name_var.get().strip() or "Unnamed"
        code = self.customer_code_var.get()
        suggested = f"License_{code}_{customer}.json"
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            initialfile=suggested,
            title="ذخیره فایل لایسنس",
            filetypes=[("JSON files", "*.json")]
        )
        
        if not file_path:
            return
            
        enabled_structures = {k: v["count"].get() for k, v in self.struct_vars.items() if v["enabled"].get()}
        enabled_modules = [k for k, v in self.module_vars.items() if v.get()]
        
        data = {
            "customer_name": self.name_var.get(),
            "customer_code": code,
            "hardware_id": self.hw_id_var.get(),
            "validity_days": int(self.validity_var.get() or 0),
            "users_count": int(self.users_count_var.get() or 1),
            "activation_code": self.activation_code_var.get(),
            "allowed_structures": enabled_structures,
            "modules": enabled_modules,
            "issue_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            messagebox.showinfo("موفقیت", "فایل لایسنس با موفقیت ذخیره شد")
            self.generate_activation_code()
        except Exception as e:
            messagebox.showerror("خطا", str(e))

if __name__ == "__main__":
    root = tk.Tk()
    app = LicenseGeneratorApp(root)
    root.mainloop()
```
