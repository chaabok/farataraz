"use client";
import { ReportViewer } from "@/components/forms/common/ReportViewer";
export default function ReportViewerPage({ params, searchParams }: any) {
  const { id } = params;
  const recordId = searchParams?.id;
  const isUserReport = searchParams?.isSystemReport !== 'true';
  return <ReportViewer reportId={id} recordId={recordId} isUserReport={isUserReport} />;
}
