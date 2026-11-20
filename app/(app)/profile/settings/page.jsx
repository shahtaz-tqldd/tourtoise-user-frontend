import { Suspense } from "react";

import Settings from "@/templates/profile/components/settings";
import RequireAuth from "@/templates/guards/require-auth";

export default function Page() {
  return <Suspense fallback={null}><RequireAuth>
      <Settings />
    </RequireAuth></Suspense>;
}
