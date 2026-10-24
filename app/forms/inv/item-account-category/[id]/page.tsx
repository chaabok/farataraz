"use client";

import { use } from "react";
import { ItemAccountCategory } from "@/components/forms/inv/ItemAccountCategory";

export default function EditItemAccountCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idNum = resolvedParams.id ? parseInt(resolvedParams.id, 10) : undefined;

  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <ItemAccountCategory id={idNum} />
    </div>
  );
}
