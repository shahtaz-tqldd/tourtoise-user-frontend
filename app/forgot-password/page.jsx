import { Suspense } from "react";

import ForgotPassword from "@/templates/auth/forgot-password";
import GuestOnly from "@/templates/guards/guest-only";

export default function Page() {
  return <Suspense fallback={null}><GuestOnly>
      <ForgotPassword />
    </GuestOnly></Suspense>;
}
