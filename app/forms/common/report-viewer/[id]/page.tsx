"use client";
import { use } from "react";
import { ReportViewer } from "@/components/forms/common/ReportViewer";
export default function ReportViewerPage({ params, searchParams }: any) {
  const resolvedParams = use(params);
  const resolvedSearch = use(searchParams);
  const { id } = resolvedParams;
  const recordId = resolvedSearch?.id;
  const isUserReport = resolvedSearch?.isSystemReport !== 'true';
  return <ReportViewer reportId={id} recordId={recordId} isUserReport={isUserReport} />;
}
