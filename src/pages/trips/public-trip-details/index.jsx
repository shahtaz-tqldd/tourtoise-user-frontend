import React, { useMemo } from "react";
import { Backpack, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

import BrokenPage from "@/components/shared/broken-page";
import { Logo } from "@/components/shared/utils";
import { Container, Header } from "@/components/ui/container";
import { usePublicTripDetailsQuery } from "@/features/trips/tripApiSlice";
import useTitle from "@/hooks/useTitle";
import TripOverview from "../trip-details/components/overview";
import PublicTripPlanningTabs from "./planning-tabs";
import Badge from "@/components/ui/badge";

const unwrapTrip = (response) => response?.data || response;

const normalizePublicTrip = (sourceTrip) => {
  if (!sourceTrip) return null;

  const destinations = (sourceTrip.trip_destinations || []).map(
    (tripDestination, index) => {
      const destination = tripDestination.destination || tripDestination;

      return {
        id:
          destination.slug || destination.id || `${destination.name}-${index}`,
        slug: destination.slug || "",
        name: destination.name || sourceTrip.title,
        country: destination.country || "",
        region: destination.region || "",
        tagline: destination.tagline || "",
        destination_type: destination.destination_type || "",
        tags: destination.tags || [],
        arrival_date: tripDestination.arrival_date || "",
        departure_date: tripDestination.departure_date || "",
        stay: tripDestination.is_primary
          ? "Primary destination"
          : tripDestination.stay_nights
            ? `${tripDestination.stay_nights} nights`
            : "Trip destination",
        image_url: destination.cover_image || destination.image_url,
        summary: destination.description || destination.overview || "",
      };
    },
  );

  const origin = [sourceTrip.origin_city, sourceTrip.origin_country]
    .filter(Boolean)
    .join(", ");

  return {
    ...sourceTrip,
    overview: sourceTrip.planning_summary || destinations[0]?.tagline || "",
    budget: sourceTrip.budget || { total_estimated: sourceTrip.total_budget },
    budget_currency:
      sourceTrip.budget?.currency || sourceTrip.budget_currency || "USD",
    destinations,
    start_location: origin ? { address: origin } : null,
    packing_items: sourceTrip.packing_items || [],
    required_documents: sourceTrip.required_documents || [],
    heads_up: sourceTrip.heads_up || [],
    routes: sourceTrip.routes || [],
    days: sourceTrip.days || [],
  };
};

const PublicTripDetailsPage = () => {
  const { tripToken } = useParams();
  const { data, isLoading, isFetching, isError, refetch } =
    usePublicTripDetailsQuery({ tripToken });
  const trip = useMemo(() => normalizePublicTrip(unwrapTrip(data)), [data]);

  useTitle(
    trip?.title ? `tourtoise - ${trip.title}` : "tourtoise - Shared trip",
  );

  if (isLoading || isFetching) {
    return (
      <div className="center min-h-screen bg-primary/[0.07] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading trip details...
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-primary/[0.07] p-2.5 md:p-4">
        <BrokenPage
          title="Shared trip not found"
          description="This shared trip link may be invalid or no longer available."
          icon={Backpack}
          actionLabel={null}
          actionTo={null}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/[0.07]">
      <Container className="py-0 md:py-5">
        <section className="max-w-4xl mx-auto space-y-5 pb-8">
          <div className="flbx">
            <Logo />
            <Badge>Shared trip</Badge>
          </div>
          <TripOverview trip={trip} readOnly />
          <PublicTripPlanningTabs key={trip.id} trip={trip} />
        </section>
      </Container>
    </div>
  );
};

export default PublicTripDetailsPage;
