"use client";
import { use } from "react";
import { ReportBuilder } from "@/components/forms/common/ReportBuilder";
export default function ReportBuilderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <ReportBuilder id={resolvedParams.id} />;
}
