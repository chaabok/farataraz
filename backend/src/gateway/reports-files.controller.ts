import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { frontendRoot } from './pg-identifier.util';

/**
 * SECURITY: report names are used to build file paths. Only allow safe
 * identifier-like names to prevent path traversal (e.g. "../../x").
 */
function isSafeReportName(name: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(name) && !name.includes('..');
}

// Recursive finder function to locate report files inside subdirectories
function findReportFile(baseDir: string, reportName: string): string | null {
  if (!isSafeReportName(reportName)) return null;
  if (!fs.existsSync(baseDir)) return null;

  const targetName = reportName.endsWith('.json') ? reportName : `${reportName}.json`;

  // 1. Direct check in current folder
  const directPath = path.join(baseDir, targetName);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  // 2. Recursive check in subdirectories
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subPath = path.join(baseDir, entry.name);
      const found = findReportFile(subPath, reportName);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Ported from the former Next.js route `app/api/reports/save/route.ts`
 * (Task 5-a). Auth is enforced by the global JwtAuthGuard. Report JSON files
 * are read from / written under `<FRONTEND_ROOT>/Reports` (fallback: ./Reports).
 */
@Controller('reports/save')
export class ReportsFilesController {
  private readonly logger = new Logger(ReportsFilesController.name);

  @Get()
  getReport(@Query('reportName') reportName?: string) {
    if (!reportName) {
      throw new BadRequestException({ message: 'نام گزارش الزامی است' });
    }

    const reportsBaseDir = path.join(frontendRoot(), 'Reports');
    const filePath = findReportFile(reportsBaseDir, reportName);

    if (!filePath) {
      throw new HttpException({ message: 'Report layout not found' }, HttpStatus.NOT_FOUND);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Error reading report file:', error instanceof Error ? error.stack : error);
      throw new HttpException({ message: 'Error reading file' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveReport(@Body() data?: any) {
    try {
      const { reportName, title, category, input, script, layouts, items, formulas, aggregates, isSystemReport, reportID } =
        data || {};

      if (!reportName) {
        throw new BadRequestException({ message: 'نام گزارش الزامی است' });
      }

      // SECURITY: block path traversal via crafted report names
      if (!isSafeReportName(reportName)) {
        throw new BadRequestException({ message: 'نام گزارش شامل کاراکترهای غیرمجاز است' });
      }

      // 1. Determine if this is a System Report or User Report
      const isSystem =
        !!isSystemReport ||
        (category && category.toLowerCase().includes('system')) ||
        (layouts && Array.isArray(layouts) && layouts[0]?.isSystemReport === true) ||
        reportName === 'PaymentNotificationA4' ||
        reportName === 'ReceiptNotificationA4';

      const baseFolderName = isSystem ? 'SystemReports' : 'UserReports';

      // 2. Determine Software/Module Name
      const rawTable = (data.primaryTable || data.primarytable || '').toLowerCase();
      const rawTargetForm = (data.targetForm || data.targetform || '').toLowerCase();
      const rawCategory = (category || '').toLowerCase();

      let softwareName = 'General';
      if (rawTable.startsWith('rap.') || rawTargetForm.includes('rap.') || rawCategory === 'rap') {
        softwareName = 'RAP';
      } else if (rawTable.startsWith('acc.') || rawTargetForm.includes('acc.') || rawCategory === 'accounting' || rawCategory === 'acc') {
        softwareName = 'Accounting';
      } else if (rawTable.startsWith('cnt.') || rawTargetForm.includes('cnt.') || rawCategory === 'cnt' || rawCategory === 'contract') {
        softwareName = 'Contract';
      } else if (rawTable.startsWith('gnr.') || rawTargetForm.includes('gnr.') || rawCategory === 'common' || rawCategory === 'general') {
        softwareName = 'Common';
      } else if (data.softwareName) {
        const sw = data.softwareName.trim().toUpperCase();
        if (sw === 'RAP') softwareName = 'RAP';
        else if (sw === 'ACCOUNTING' || sw === 'ACC') softwareName = 'Accounting';
        else if (sw === 'CONTRACT' || sw === 'CNT') softwareName = 'Contract';
        else if (sw === 'COMMON') softwareName = 'Common';
        else {
          softwareName = sw.charAt(0).toUpperCase() + sw.slice(1).toLowerCase();
        }
      }

      // 3. Determine safe English Filename
      let finalFileName = reportName;
      if (!isSystem) {
        const isAlreadyFormatted = /^Report[A-Z0-9]+$/i.test(reportName);
        if (!isAlreadyFormatted) {
          // Format according to: Report + SoftwareName (uppercase) + ID / unique sequential value
          const uniqueId = reportID || Date.now().toString().slice(-7);
          finalFileName = `Report${softwareName.toUpperCase()}${uniqueId}`;
        }
      }

      // SECURITY: final defense-in-depth check on the composed file name
      if (!isSafeReportName(finalFileName)) {
        throw new BadRequestException({ message: 'نام فایل گزارش نامعتبر است' });
      }

      // Ensure the folder under Reports exists
      const targetDir = path.join(frontendRoot(), 'Reports', baseFolderName, softwareName);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, `${finalFileName}.json`);

      const reportContent = {
        reportID: reportID || undefined,
        reportName: finalFileName,
        title: title || reportName,
        category,
        input,
        script,
        layouts,
        items,
        formulas,
        aggregates,
        isSystemReport: isSystem,
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(reportContent, null, 2), 'utf-8');

      return {
        message: 'Report saved successfully',
        fileName: finalFileName,
        filePath: `/Reports/${baseFolderName}/${softwareName}/${finalFileName}.json`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error saving report:', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException({
        message: 'Server error saving report',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (error as any)?.message,
      });
    }
  }
}
