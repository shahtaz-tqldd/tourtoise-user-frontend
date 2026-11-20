import { Suspense } from "react";

import Register from "@/templates/auth/register";
import GuestOnly from "@/templates/guards/guest-only";

export default function Page() {
  return <Suspense fallback={null}><GuestOnly>
      <Register />
    </GuestOnly></Suspense>;
}
