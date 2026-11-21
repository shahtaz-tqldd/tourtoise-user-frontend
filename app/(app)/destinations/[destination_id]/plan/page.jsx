import { Suspense } from "react";

import RequireAuth from "@/templates/guards/require-auth";
import TripPlanner from "@/templates/trip-planner";

export default function Page() {
  return (
    <RequireAuth reason="plan">
      <Suspense fallback={null}>
        <TripPlanner />
      </Suspense>
    </RequireAuth>
  );
}
