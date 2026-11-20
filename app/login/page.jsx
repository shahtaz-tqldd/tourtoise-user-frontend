import { Suspense } from "react";

import Login from "@/templates/auth/login";
import GuestOnly from "@/templates/guards/guest-only";

export default function Page() {
  return <Suspense fallback={null}><GuestOnly>
      <Login />
    </GuestOnly></Suspense>;
}
