"use client";

import { useParams } from "next/navigation";
import { TrackingFactor } from "@/components/forms/inv/TrackingFactor";

export default function EditTrackingFactorPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="w-full h-[calc(100vh-4rem)] p-2">
      <TrackingFactor id={id} />
    </div>
  );
}
