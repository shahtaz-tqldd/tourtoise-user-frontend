import { Suspense } from "react";

import Journal from "@/templates/journal";

export default function Page() {
  return <Suspense fallback={null}><Journal /></Suspense>;
}
