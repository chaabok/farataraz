"use client";

import PaymentGatewayForm from "@/components/forms/rap/PaymentGateway";
import { useParams } from "next/navigation";

export default function EditPaymentGatewayPage() {
  const params = useParams();
  return (
    <div className="w-full h-full p-2">
      <PaymentGatewayForm id={params.id as string} />
    </div>
  );
}
