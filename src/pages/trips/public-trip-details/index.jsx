import { usePublicTripDetailsQuery } from "@/features/trips/tripApiSlice";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import TripOverview from "../trip-details/components/overview";
import TripPlanningTabs from "../trip-details/components/planning-tabs";

const PublicTripDetailsPage = () => {
  const { tripToken } = useParams();
  const { data, isLoading, isFetching, isError } = usePublicTripDetailsQuery({
    tripToken,
  });
  const trip = useMemo(() => data?.data, [data]);

  return (
    <div>
      Public Trip Details
      <div className="space-y-5">
        {/* <TripOverview trip={trip} /> */}
        {/* <TripPlanningTabs trip={trip} /> */}
      </div>
    </div>
  );
};

export default PublicTripDetailsPage;
