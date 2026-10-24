"use client";

import { use } from "react";
import { StandardItemRate } from "@/components/forms/inv/StandardItemRate";

export default function EditStandardItemRatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idNum = resolvedParams.id ? parseInt(resolvedParams.id, 10) : undefined;

  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <StandardItemRate id={idNum} />
    </div>
  );
}
