import { Suspense } from "react";

import ResetPassword from "@/templates/auth/reset-password";

export default function Page() {
  return <Suspense fallback={null}><ResetPassword /></Suspense>;
}
