"use client";
import { MeasurementUnit } from "@/components/forms/inv/MeasurementUnit";
export default function EditMeasurementUnitPage() {
  const params = useParams();
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <MeasurementUnit id={params.id as string} />
    </div>
  );
}
