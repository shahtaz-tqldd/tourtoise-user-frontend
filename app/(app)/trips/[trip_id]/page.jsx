import { Suspense } from "react";

import TripDetails from "@/templates/trips/trip-details";
import RequireAuth from "@/templates/guards/require-auth";

export default function Page() {
  return <Suspense fallback={null}><RequireAuth reason="trips">
      <TripDetails />
    </RequireAuth></Suspense>;
}
