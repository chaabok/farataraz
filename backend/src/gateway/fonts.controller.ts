import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { frontendPublicDir } from './pg-identifier.util';

interface UploadedFontPayload {
  originalname?: string;
  size?: number;
  mimetype?: string;
  buffer?: Buffer;
}

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
  'application/font-woff2',
];

/**
 * Ported from the former Next.js route `app/api/fonts/route.ts` (Task 5-a).
 * Serves the standard/custom font files used by the form-engine settings UI.
 * Files live in `<FRONTEND_PUBLIC_DIR>/uploads/fonts` (fallback: ./public).
 */
@Controller('fonts')
export class FontsController {
  private readonly logger = new Logger(FontsController.name);

  private fontsDir(): string {
    return path.join(frontendPublicDir(), 'uploads', 'fonts');
  }

  @Get()
  list() {
    try {
      const fontsDir = this.fontsDir();

      if (!fs.existsSync(fontsDir)) {
        return { fonts: [] };
      }

      const files = fs.readdirSync(fontsDir);

      const fonts = files
        .filter(file => ALLOWED_EXTENSIONS.includes('.' + (file.split('.').pop() || '').toLowerCase()))
        .map(file => ({
          filename: file,
          url: `/uploads/fonts/${file}`,
        }));

      return { fonts };
    } catch (error) {
      this.logger.error('Error listing fonts:', error instanceof Error ? error.stack : error);
      throw new HttpException({ error: 'خطا در دریافت لیست فونت‌ها' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file?: UploadedFontPayload) {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException({ error: 'فایلی انتخاب نشده است.' });
      }

      const rawExtension = file.originalname ? file.originalname.split('.').pop() || '' : '';
      const fileExtension = '.' + rawExtension.toLowerCase();

      // Security check 1: Extension
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        throw new BadRequestException({
          error: 'فقط آپلود فونت‌های استاندارد (ttf, otf, woff, woff2) مجاز است.',
        });
      }

      // Security check 2: Size
      if ((file.size || 0) > MAX_FILE_SIZE) {
        throw new BadRequestException({ error: 'حجم فونت نمی‌تواند بیشتر از 10 مگابایت باشد.' });
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
        'text/html',
      ];
      if (file.mimetype && restrictedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException({ error: 'فرمت فایل معتبر نیست.' });
      }

      const buffer = Buffer.from(file.buffer);

      // Create the directory if it doesn't exist
      // Using public/uploads/fonts so it's accessible directly via browser URL
      const publicDir = this.fontsDir();
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Sanitize filename
      const safeFilename = (file.originalname || 'font').replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filepath = path.join(publicDir, safeFilename);

      // Write file to disk
      fs.writeFileSync(filepath, buffer);

      const url = `/uploads/fonts/${safeFilename}`;

      return {
        success: true,
        url,
        filename: safeFilename,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Font upload error:', error instanceof Error ? error.stack : error);
      throw new HttpException({ error: 'خطای سرور در آپلود فونت.' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete()
  remove(@Query('filename') filename?: string) {
    try {
      if (!filename) {
        throw new BadRequestException({ error: 'نام فایل ارسال نشده است.' });
      }

      // Sanitize filename to prevent directory traversal
      const safeFilename = path.basename(filename);
      const publicDir = this.fontsDir();
      const filepath = path.join(publicDir, safeFilename);

      // Make sure the resolved path is inside the fonts directory (additional safety)
      if (!filepath.startsWith(publicDir)) {
        throw new BadRequestException({ error: 'مسیر فایل نامعتبر است.' });
      }

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return { success: true, message: 'فایل با موفقیت حذف شد.' };
      } else {
        throw new NotFoundException({ error: 'فایل یافت نشد.' });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error deleting font:', error instanceof Error ? error.stack : error);
      throw new HttpException({ error: 'خطا در حذف فونت' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
