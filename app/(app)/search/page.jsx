import { Suspense } from "react";

import Search from "@/templates/search";

export default function Page() {
  return <Suspense fallback={null}><Search /></Suspense>;
}
