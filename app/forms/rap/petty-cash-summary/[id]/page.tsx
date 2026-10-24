"use client";

import { useParams } from "next/navigation";
import PettyCashSummaryForm from "@/components/forms/rap/PettyCashSummary";

export default function EditPettyCashSummaryPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <PettyCashSummaryForm id={id} />
    </div>
  );
}
