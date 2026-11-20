import { Suspense } from "react";

import CreditHistory from "@/templates/profile/components/credit-history";
import RequireAuth from "@/templates/guards/require-auth";

export default function Page() {
  return <Suspense fallback={null}><RequireAuth>
      <CreditHistory />
    </RequireAuth></Suspense>;
}
