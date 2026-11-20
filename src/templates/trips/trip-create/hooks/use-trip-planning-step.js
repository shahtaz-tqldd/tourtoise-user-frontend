import { useTripPlanningQuery } from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo } from "react";
import { unwrapApiData } from "../trip-planning-utils";

/**
 * Loads one server-owned planning step and reports its flow metadata to the
 * drawer. Keeping this in one place prevents each screen from interpreting the
 * API wrapper and sequential flow differently.
 */
export const useTripPlanningStep = ({ tripId, step, onPlanningStateChange }) => {
  const query = useTripPlanningQuery(
    tripId ? { trip_id: tripId, step } : skipToken,
  );
  const payload = useMemo(() => unwrapApiData(query.data), [query.data]);

  useEffect(() => {
    if (!query.data) return;
    onPlanningStateChange?.(payload);
  }, [onPlanningStateChange, payload, query.data]);

  return { ...query, payload };
};
