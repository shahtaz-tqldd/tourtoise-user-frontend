import { Suspense } from "react";

import Profile from "@/templates/profile";
import RequireAuth from "@/templates/guards/require-auth";

export default function Page() {
  return <Suspense fallback={null}><RequireAuth>
      <Profile />
    </RequireAuth></Suspense>;
}
