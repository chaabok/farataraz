"use client";

import { use } from "react";
import { ItemPackage } from "@/components/forms/inv/ItemPackage";

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idNum = Number(resolvedParams.id);

  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <ItemPackage id={idNum} />
    </div>
  );
}
