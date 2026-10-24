import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { ActivityLogService } from '../core/services/activity-log.service';
import { frontendPublicDir } from './pg-identifier.util';

interface UploadedFilePayload {
  originalname?: string;
  size?: number;
  mimetype?: string;
  buffer?: Buffer;
}

/**
 * Ported from the former Next.js route `app/api/upload/route.ts` (Task 5-a).
 *
 * SECURITY: uploads are user content that land in the publicly-served
 * `public/image` folder. Authentication is enforced by the global
 * JwtAuthGuard. The extension list below is a strict WHITELIST: only
 * jpg/jpeg/png/gif/webp/pdf are accepted, everything else (including
 * svg/html/js) is rejected.
 */
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: UploadedFilePayload) {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException({ error: 'File is required.' });
      }

      // SECURITY: strict extension whitelist (was a blacklist before Task 5-a).
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
      const rawExtension = file.originalname ? file.originalname.split('.').pop() || '' : '';
      const fileExtension = '.' + rawExtension.toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        throw new BadRequestException({ error: 'آپلود این نوع فایل مجاز نمی‌باشد.' });
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if ((file.size || 0) > MAX_FILE_SIZE) {
        throw new BadRequestException({ error: 'حجم فایل بیشتر از ۱۰ مگابایت مجاز نیست.' });
      }

      const restrictedMimeTypes = [
        'application/x-msdownload',
        'application/x-ms-dos-executable',
        'application/x-exe',
        'application/x-sh',
        'application/java-archive',
        'text/javascript',
        'application/javascript',
        'image/svg+xml',
        'text/html',
      ];
      if (file.mimetype && restrictedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException({ error: 'آپلود این نوع فایل مجاز نمی‌باشد.' });
      }

      const buffer = Buffer.from(file.buffer);

      // Magic number check
      if (buffer.length >= 4) {
        const header = buffer.toString('hex', 0, 4);
        const maliciousSignatures = [
          '4d5a', // MZ (Windows Executables: .exe, .dll)
          '7f454c46', // ELF (Linux Executables)
          '2321', // #! (Shell Scripts)
          'cafebabe', // Java Class / Mach-O
        ];
        const isMalicious = maliciousSignatures.some(sig => header.startsWith(sig));
        if (isMalicious) {
          throw new BadRequestException({ error: 'محتوای فایل نامعتبر یا مخرب است.' });
        }
      }

      // Create the directory if it doesn't exist
      const publicDir = path.join(frontendPublicDir(), 'image');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Creating a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeName = (file.originalname || 'upload').replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = uniqueSuffix + '-' + safeName;
      const filepath = path.join(publicDir, filename);

      // Write file to disk
      fs.writeFileSync(filepath, buffer);

      // Fire-and-forget activity log (same fields as the legacy Next route;
      // user/ip/url/agent context comes from RequestContextService ALS store).
      try {
        this.activityLogService.logActionAsync({
          action: 'UPLOAD',
          entityName: 'FILE',
          description: `User uploaded file: ${file.originalname} (${((file.size || 0) / 1024).toFixed(2)} KB)`,
        });
      } catch (logErr) {
        this.logger.warn(`Activity log for upload failed: ${logErr instanceof Error ? logErr.message : logErr}`);
      }

      // Return the URL for the frontend to use
      const url = `/image/${filename}`;
      return { url };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('File upload error:', error instanceof Error ? error.stack : error);
      throw new HttpException({ error: 'Internal server error uploading file' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
