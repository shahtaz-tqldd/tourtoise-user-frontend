import { Suspense } from "react";

import Destinations from "@/templates/destinations";

export default function Page() {
  return <Suspense fallback={null}><Destinations /></Suspense>;
}
