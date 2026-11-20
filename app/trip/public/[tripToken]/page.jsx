import { Suspense } from "react";

import PublicTripDetails from "@/templates/trips/public-trip-details";

export default function Page() {
  return <Suspense fallback={null}><PublicTripDetails /></Suspense>;
}
