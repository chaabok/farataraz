import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyRequestAuth, unauthorizedResponse, isValidPgIdentifier } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

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

export async function GET(req: Request) {
  const user = verifyRequestAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(req.url);
  const reportName = searchParams.get('reportName');

  if (!reportName) {
    return NextResponse.json({ message: 'نام گزارش الزامی است' }, { status: 400 });
  }

  const reportsBaseDir = path.join(process.cwd(), 'Reports');
  const filePath = findReportFile(reportsBaseDir, reportName);

  if (!filePath) {
    return NextResponse.json({ message: 'Report layout not found' }, { status: 404 });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(content), { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error reading file' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = verifyRequestAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const data = await req.json();
    const { reportName, title, category, input, script, layouts, items, formulas, aggregates, isSystemReport, reportID } = data;

    if (!reportName) {
      return NextResponse.json({ message: 'نام گزارش الزامی است' }, { status: 400 });
    }

    // SECURITY: block path traversal via crafted report names
    if (!isSafeReportName(reportName)) {
      return NextResponse.json({ message: 'نام گزارش شامل کاراکترهای غیرمجاز است' }, { status: 400 });
    }

    // 1. Determine if this is a System Report or User Report
    const isSystem = !!isSystemReport || 
                     (category && category.toLowerCase().includes('system')) ||
                     (layouts && Array.isArray(layouts) && layouts[0]?.isSystemReport === true) ||
                     (reportName === 'PaymentNotificationA4' || reportName === 'ReceiptNotificationA4');

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
      return NextResponse.json({ message: 'نام فایل گزارش نامعتبر است' }, { status: 400 });
    }

    // Ensure the folder under Reports exists
    const targetDir = path.join(process.cwd(), 'Reports', baseFolderName, softwareName);
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
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(reportContent, null, 2), 'utf-8');

    return NextResponse.json({ 
      message: 'Report saved successfully', 
      fileName: finalFileName,
      filePath: `/Reports/${baseFolderName}/${softwareName}/${finalFileName}.json`
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error saving report:', error);
    return NextResponse.json({ message: 'Server error saving report', error: error.message }, { status: 500 });
  }
}
