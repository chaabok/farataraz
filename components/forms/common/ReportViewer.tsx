"use client";

import React from 'react';
import { ReportBuilder } from '@/components/forms/common/ReportBuilder';

export function ReportViewer({ reportId, recordId, isUserReport, isFileReport }: { reportId: string, recordId?: string, isUserReport?: boolean, isFileReport?: boolean }) {
  if (!reportId) return null;

  return (
    <div className="w-full h-full overflow-hidden">
      <ReportBuilder 
        id={isNaN(Number(reportId)) ? reportId : parseInt(reportId)} 
        recordId={recordId} 
        startInPreview={true} 
        isUserReport={isUserReport}
        isFileReport={isFileReport}
      />
    </div>
  );
}
