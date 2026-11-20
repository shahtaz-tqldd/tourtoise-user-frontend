import { Suspense } from "react";

import JournalDetails from "@/templates/journal/journal-details";

export default function Page() {
  return <Suspense fallback={null}><JournalDetails /></Suspense>;
}
