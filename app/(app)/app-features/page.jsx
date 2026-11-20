import { Suspense } from "react";

import AppFeatures from "@/templates/app-features";

export default function Page() {
  return <Suspense fallback={null}><AppFeatures /></Suspense>;
}
