"use client";

import { useParams } from "next/navigation";
import PettyCashForm from "@/components/forms/rap/PettyCash";

export default function EditPettyCashPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <PettyCashForm id={id} />
    </div>
  );
}
