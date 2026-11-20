import { Suspense } from "react";

import Onboarding from "@/templates/onboarding";
import RequireAuth from "@/templates/guards/require-auth";

export default function Page() {
  return <Suspense fallback={null}><RequireAuth>
      <Onboarding />
    </RequireAuth></Suspense>;
}
