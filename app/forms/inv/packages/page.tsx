"use client";

import { ItemPackageList } from "@/components/forms/inv/ItemPackageList";

export default function PackageListPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <ItemPackageList />
    </div>
  );
}
