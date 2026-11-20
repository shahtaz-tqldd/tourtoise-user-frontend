import { Suspense } from "react";

import SavedItems from "@/templates/saved-items";
import RequireAuth from "@/templates/guards/require-auth";

export default function Page() {
  return <Suspense fallback={null}><RequireAuth reason="save">
      <SavedItems />
    </RequireAuth></Suspense>;
}
