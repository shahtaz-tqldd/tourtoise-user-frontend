"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { MapPinned } from "lucide-react";

import { useDestinationDetailQuery } from "@/features/destination/destinationApiSlice";
import TripPlanningDrawer from "@/templates/trips/trip-create";
import BrokenPage from "@/components/shared/broken-page";
import { Container } from "@/components/ui/container";
import useTitle from "@/hooks/useTitle";

import DestinationHeader from "./components/destination-header";
import PhotoHero from "./components/photo-hero";
import QuickFacts from "./components/quick-facts";
import PlanCard from "./components/plan-card";
import About from "./components/about";
import PlaceSection from "./components/place-section";
import GoodToKnow from "./components/good-to-know";
import FeatureDetails from "./components/feature-details";
import {
  DestinationLoader,
  EmptyDestination,
} from "./components/fallback-component";
import { getDestinationPhotos } from "./detail-utils";
import { PLACE_KINDS } from "./place-kinds";

const DestinationDetailsPage = () => {
  const { destination_id } = useParams();
  const [planningOpen, setPlanningOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const planningHistoryEntryRef = useRef(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const { data, isFetching, error, refetch } =
    useDestinationDetailQuery(destination_id);
  const destination = useMemo(() => data?.data || {}, [data]);
  const photos = useMemo(() => getDestinationPhotos(destination), [destination]);

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

  if (error?.status === 404) {
    return (
      <Container>
        <BrokenPage
          className="mt-0"
          title="Destination not found"
          description={`We couldn't find any destination with the ${destination_id}, Check the destination slug or explore somewhere else.`}
          icon={MapPinned}
          actionLabel="Explore destinations"
        />
      </Container>
    );
  }

  if (error) {
    // RTK reports non-JSON 5xx bodies as "PARSING_ERROR" with originalStatus.
    const statusCode = Number.isInteger(error.status)
      ? error.status
      : error.originalStatus || 500;

    return (
      <Container>
        <BrokenPage
          className="mt-0"
          statusCode={String(statusCode)}
          title="Couldn't load this destination"
          description="Something went wrong on our side. Please try again in a moment."
          icon={MapPinned}
          actionLabel="Explore destinations"
          onRetry={refetch}
        />
      </Container>
    );
  }

  if (!destination?.slug && !destination?.name) {
    return <EmptyDestination />;
  }

  const openPlanner = () => handlePlanningOpenChange(true);
  const destinationSlug = destination.slug || destination_id;
  const selectPlace = (kindKey) => (item) => {
    const kind = PLACE_KINDS[kindKey];
    setActiveFeature({
      title: kind.featureTitle,
      icon: kind.icon,
      featureType: kindKey,
      item,
    });
  };

  return (
    <Container>
      {/* Phones lead with the photos; larger screens lead with the title. */}
      <DestinationHeader destination={destination} className="order-2 md:order-1" />
      <PhotoHero photos={photos} name={destination.name} className="order-1 md:order-2" />

      <div className="order-3 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-10">
          <QuickFacts destination={destination} />
          <PlanCard destination={destination} onPlan={openPlanner} className="shadow-none lg:hidden" />
          <About destination={destination} />
          {Object.keys(PLACE_KINDS).map((kindKey) => (
            <PlaceSection
              key={kindKey}
              kindKey={kindKey}
              items={destination[kindKey]}
              onSelect={selectPlace(kindKey)}
            />
          ))}
          <GoodToKnow destination={destination} />
        </div>

        <aside className="hidden lg:block">
          <PlanCard destination={destination} onPlan={openPlanner} className="sticky top-[92px]" />
        </aside>
      </div>

      {/* The planner loads member-only data, so it only mounts for members. */}
      {isAuthenticated && (
        <TripPlanningDrawer
          destination={destination}
          open={planningOpen}
          onOpenChange={handlePlanningOpenChange}
        />
      )}
      <FeatureDetails
        feature={activeFeature}
        destinationSlug={destinationSlug}
        open={Boolean(activeFeature)}
        onOpenChange={(open) => {
          if (!open) setActiveFeature(null);
        }}
      />
    </Container>
  );
};

export default DestinationDetailsPage;
