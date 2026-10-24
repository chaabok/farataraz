"use client";
import PaidDocumentClearingForm from "@/components/forms/rap/PaidDocumentClearing";
export default function EditPaidDocumentClearingPage() {
  const params = useParams();
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <PaidDocumentClearingForm id={params.id as string} />
    </div>
  );
}
