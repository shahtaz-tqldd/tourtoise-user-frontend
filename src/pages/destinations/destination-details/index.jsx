import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// query
import { useDestinationDetailQuery } from "@/features/destination/destinationApiSlice";

// comonents
import Gallery from "./components/gallery";
import DestinationCover from "./components/cover";
import TripPlanningDrawer from "@/pages/trips/trip-create";
import TripSnapshot from "./components/snapshot";
import DestinationHighlights from "./components/highlights";
import DestinationFeatures from "./components/activities";
import DestinationCuisine from "./components/cuisine";
import FeatureDetails from "./components/feature-details";
import TripEssentials from "./components/essentials";
import DestinationOverview from "./components/overview";
import TripPlan from "./components/trip-plan";
import {
  DestinationLoader,
  EmptyDestination,
} from "./components/fallback-component";
import { MapPinned } from "lucide-react";
import BrokenPage from "@/components/shared/broken-page";
import { Container } from "@/components/ui/container";
import useTitle from "@/hooks/useTitle";

const DestinationDetailsPage = () => {
  const { destination_id } = useParams();
  const [planningOpen, setPlanningOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const planningHistoryEntryRef = useRef(false);

  const { data, isFetching, error } = useDestinationDetailQuery(destination_id);
  const destination = data?.data || {};

  useTitle(`tourtoise - ${destination?.name}`);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handlePopState = () => {
      if (!planningHistoryEntryRef.current) return;

      planningHistoryEntryRef.current = false;
      setPlanningOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !planningOpen) return;
    if (planningHistoryEntryRef.current) return;

    window.history.pushState(
      {
        ...(window.history.state || {}),
        tripPlanningDrawer: true,
      },
      "",
      window.location.href,
    );
    planningHistoryEntryRef.current = true;
  }, [planningOpen]);

  const handlePlanningOpenChange = (nextOpen) => {
    if (nextOpen) {
      setPlanningOpen(true);
      return;
    }

    if (
      typeof window !== "undefined" &&
      planningHistoryEntryRef.current &&
      window.history.state?.tripPlanningDrawer
    ) {
      planningHistoryEntryRef.current = false;
      window.history.back();
    }

    setPlanningOpen(false);
  };

  if (isFetching) {
    return <DestinationLoader />;
  }

  if (!destination) {
    return <EmptyDestination />;
  }

  if (error?.status === 404 || !destination) {
    return (
      <BrokenPage
        title="Destination not found"
        description={`We couldn't find any destination with the ${destination_id}, Check the destination slug or explore somewhere else.`}
        icon={MapPinned}
        actionLabel="Explore destinations"
      />
    );
  }

  return (
    <Container>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 flex flex-col gap-6">
          <DestinationCover destination={destination} />
          <DestinationOverview destination={destination} />
          <div className="xl:hidden">
            <TripSnapshot
              destination={destination}
              setPlanningOpen={setPlanningOpen}
            />
          </div>

          <div className="xl:hidden">
            <Gallery destination={destination} />
          </div>
          <DestinationHighlights
            destination={destination}
            setActiveFeature={setActiveFeature}
          />
          <DestinationFeatures
            destination={destination}
            setActiveFeature={setActiveFeature}
          />
          <DestinationCuisine
            destination={destination}
            setActiveFeature={setActiveFeature}
          />

          <TripEssentials destination={destination} />

          <div className="xl:hidden">
            <TripPlan
              destination={destination}
              handlePlanningOpenChange={handlePlanningOpenChange}
            />
          </div>
        </div>

        <aside className="min-w-0 flex flex-col gap-6 md:sticky md:top-[90px] md:h-[calc(100vh-110px)] md:pr-1.5 md:overscroll-contain custom-scrollbar">
          <div className="hidden xl:block space-y-4">
            <TripSnapshot
              destination={destination}
              setPlanningOpen={setPlanningOpen}
            />
            <TripPlan
              destination={destination}
              handlePlanningOpenChange={handlePlanningOpenChange}
            />
          </div>
          <div className="hidden xl:block">
            <Gallery destination={destination} />
          </div>
        </aside>
      </div>

      <TripPlanningDrawer
        destination={destination}
        open={planningOpen}
        onOpenChange={handlePlanningOpenChange}
      />
      <FeatureDetails
        feature={activeFeature}
        destinationSlug={destination.slug || destination_id}
        open={Boolean(activeFeature)}
        onOpenChange={(open) => {
          if (!open) setActiveFeature(null);
        }}
      />
    </Container>
  );
};

export default DestinationDetailsPage;
