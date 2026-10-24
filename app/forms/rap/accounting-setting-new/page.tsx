"use client";
import { RecieptAndPaymentAccountingSetting } from "@/components/forms/rap/RecieptAndPaymentAccountingSetting";
export const fetchCache = 'force-no-store';

export default function NewAccountingSettingPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <RecieptAndPaymentAccountingSetting />
    </div>
  );
}
