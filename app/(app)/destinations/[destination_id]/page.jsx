import { Suspense } from "react";

import DestinationDetails from "@/templates/destinations/destination-details";

export default function Page() {
  return <Suspense fallback={null}><DestinationDetails /></Suspense>;
}
