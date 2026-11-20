import { Suspense } from "react";

import DesignSystem from "@/templates/design-system";

export default function Page() {
  return <Suspense fallback={null}><DesignSystem /></Suspense>;
}
