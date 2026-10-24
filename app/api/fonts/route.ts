import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for fonts
const ALLOWED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];
const ALLOWED_MIME_TYPES = [
  'font/ttf',
  'font/otf',
  'font/woff',
  'font/woff2',
  'application/x-font-ttf',
  'application/x-font-opentype',
  'application/font-woff',
  'application/font-woff2'
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'فایلی انتخاب نشده است.' }, { status: 400 });
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    // Security check 1: Extension
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({ error: 'فقط آپلود فونت‌های استاندارد (ttf, otf, woff, woff2) مجاز است.' }, { status: 400 });
    }

    // Security check 2: Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'حجم فونت نمی‌تواند بیشتر از 10 مگابایت باشد.' }, { status: 400 });
    }

    // Security check 3: MIME type checks (basic)
    // Note: Some browsers send generic application/octet-stream for fonts, so we rely heavily on extension,
    // but we can reject strictly malicious types like javascript or executable types if they got past the extension check.
    const restrictedMimeTypes = [
      'application/x-msdownload',
      'application/x-ms-dos-executable',
      'application/x-exe',
      'application/x-sh',
      'application/java-archive',
      'text/javascript',
      'application/javascript',
      'text/html'
    ];
    if (restrictedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'فرمت فایل معتبر نیست.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create the directory if it doesn't exist
    // Using public/uploads/fonts so it's accessible directly via browser URL
    const publicDir = path.join(process.cwd(), 'public', 'uploads', 'fonts');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Sanitize filename
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filepath = path.join(publicDir, safeFilename);

    // Write file to disk
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/fonts/${safeFilename}`;
    
    return NextResponse.json({ 
      success: true, 
      url, 
      filename: safeFilename 
    });
  } catch (error) {
    console.error('Font upload error:', error);
    return NextResponse.json({ error: 'خطای سرور در آپلود فونت.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'نام فایل ارسال نشده است.' }, { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const publicDir = path.join(process.cwd(), 'public', 'uploads', 'fonts');
    const filepath = path.join(publicDir, safeFilename);

    // Make sure the resolved path is inside the fonts directory (additional safety)
    if (!filepath.startsWith(publicDir)) {
       return NextResponse.json({ error: 'مسیر فایل نامعتبر است.' }, { status: 400 });
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return NextResponse.json({ success: true, message: 'فایل با موفقیت حذف شد.' });
    } else {
      return NextResponse.json({ error: 'فایل یافت نشد.' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error deleting font:', error);
    return NextResponse.json({ error: 'خطا در حذف فونت' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const fontsDir = path.join(process.cwd(), 'public', 'uploads', 'fonts');
    
    if (!fs.existsSync(fontsDir)) {
      return NextResponse.json({ fonts: [] });
    }

    const files = fs.readdirSync(fontsDir);
    
    const fonts = files
      .filter(file => ALLOWED_EXTENSIONS.includes('.' + file.split('.').pop()?.toLowerCase()))
      .map(file => ({
        filename: file,
        url: `/uploads/fonts/${file}`
      }));

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error('Error listing fonts:', error);
    return NextResponse.json({ error: 'خطا در دریافت لیست فونت‌ها' }, { status: 500 });
  }
}
