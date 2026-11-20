import { Suspense } from "react";

import VerifyOtp from "@/templates/auth/verify-otp";

export default function Page() {
  return <Suspense fallback={null}><VerifyOtp /></Suspense>;
}
