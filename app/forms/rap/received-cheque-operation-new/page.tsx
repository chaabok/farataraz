"use client";
import { PageContainer } from "@/components/layout/PageContainer";
import ReceivedChequeOperation from "@/components/forms/rap/ReceivedChequeOperation";
export default function ReceivedChequeOperationNewPage() {
  return (
    <PageContainer title="عملیات چک دریافتنی جدید">
      <div className="h-full w-full">
        <ReceivedChequeOperation />
      </div>
    </PageContainer>
  );
}
