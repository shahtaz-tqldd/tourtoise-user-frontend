"use client";

import { useSearchParams } from "next/navigation";
import ClientRedirect from "@/components/shared/client-redirect";

// components
import SavedDestinations from "./components/saved-destinations";
import useTitle from "@/hooks/useTitle";
import { Container } from "@/components/ui/container";
import ListingHeader from "@/components/shared/listing-header";

/** Saved destinations. Saved journal posts live in the journal's "Saved" view. */
const SavedItemsPage = () => {
  const searchParams = useSearchParams();
  useTitle("tourtoise - saved places");

  // Old links pointed here for saved journals.
  if (searchParams?.get("tab") === "journals") {
    return <ClientRedirect to="/travel-journal?view=saved" />;
  }

  return (
    <Container>
      <ListingHeader title="Saved places" />
      <SavedDestinations />
    </Container>
  );
};

export default SavedItemsPage;
