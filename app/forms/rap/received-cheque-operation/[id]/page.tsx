"use client";
import { PageContainer } from "@/components/layout/PageContainer";
import ReceivedChequeOperation from "@/components/forms/rap/ReceivedChequeOperation";
export default function EditReceivedChequeOperationPage() {
  const params = useParams();
  return (
    <PageContainer title="ویرایش عملیات چک دریافتنی">
      <div className="w-full h-full">
        <ReceivedChequeOperation id={params.id as string} />
      </div>
    </PageContainer>
  );
}
