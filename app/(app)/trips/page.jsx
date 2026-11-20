import { Suspense } from "react";

import Trips from "@/templates/trips";
import RequireAuth from "@/templates/guards/require-auth";

export default function Page() {
  return <Suspense fallback={null}><RequireAuth reason="trips">
      <Trips />
    </RequireAuth></Suspense>;
}
