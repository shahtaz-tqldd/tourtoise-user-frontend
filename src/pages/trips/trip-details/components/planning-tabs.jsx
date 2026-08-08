import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Backpack,
  CalendarDays,
  FileCheck2,
  Route,
} from "lucide-react";

import TabMenu from "@/components/ui/tab";

import TripHeadsUp from "./heads-up";
import TripPackingItems from "./packing-items";
import TripRoutePlan from "./route-plan";
import TripDocumentList from "./documents";
import TripDayWisePlan from "./day-wise-plan";

const planningTabs = [
  { value: "packing", label: "Packing", icon: Backpack },
  { value: "documents", label: "Documents", icon: FileCheck2 },
  { value: "heads-up", label: "Heads-up", icon: AlertTriangle },
  { value: "route", label: "Route", icon: Route },
  { value: "days", label: "Day Wise Plan", icon: CalendarDays },
];
const beforeTripStatuses = new Set(["draft", "planning", "ready"]);
const terminalTripStatuses = new Set([
  "completed",
  "cancelled",
  "archived",
]);
const inProgressTabOrder = [
  "days",
  "route",
  "heads-up",
  "documents",
  "packing",
];

const sortPlanningTabs = (tabs, status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "in_progress") {
    const orderByValue = new Map(
      inProgressTabOrder.map((value, index) => [value, index]),
    );

    return [...tabs].sort(
      (a, b) => orderByValue.get(a.value) - orderByValue.get(b.value),
    );
  }

  if (terminalTripStatuses.has(normalizedStatus)) return tabs;

  if (beforeTripStatuses.has(normalizedStatus)) {
    const isCompletedPreparationTab = (tab) =>
      ["packing", "documents"].includes(tab.value) && tab.isComplete;

    return [
      ...tabs.filter((tab) => !isCompletedPreparationTab(tab)),
      ...tabs.filter(isCompletedPreparationTab),
    ];
  }

  return tabs;
};

const buildStatLabel = (completed = 0, total = 0) => {
  if (!total) return null;
  return `${completed}/${total}`;
};

const TripPlanningTabs = ({ trip }) => {
  const [localStats, setLocalStats] = useState(() => trip?.preparation_stats);
  const [documentStatsOverride, setDocumentStatsOverride] = useState(null);

  const updatePackingStats = ({ packedDelta = 0, totalDelta = 0 }) => {
    setLocalStats((currentStats) => {
      const currentPackingStats = currentStats?.packing_items || {};
      const totalCount = Math.max(
        0,
        Number(currentPackingStats.total_count || 0) + totalDelta,
      );
      const packedCount = Math.min(
        totalCount,
        Math.max(
          0,
          Number(currentPackingStats.is_packed_count || 0) + packedDelta,
        ),
      );

      return {
        ...currentStats,
        packing_items: {
          ...currentPackingStats,
          total_count: totalCount,
          is_packed_count: packedCount,
        },
      };
    });
  };

  const updateDocumentStats = ({ packedDelta = 0, totalDelta = 0 }) => {
    setDocumentStatsOverride((currentStats) => {
      const initialDocumentStats = localStats?.documents || {};
      const totalCount = Math.max(
        0,
        Number(
          currentStats?.total_count ??
            initialDocumentStats.total_count ??
            0,
        ) + totalDelta,
      );
      const packedCount = Math.min(
        totalCount,
        Math.max(
          0,
          Number(
            currentStats?.is_packed_count ??
              initialDocumentStats.is_packed_count ??
              0,
          ) + packedDelta,
        ),
      );

      return {
        total_count: totalCount,
        is_packed_count: packedCount,
      };
    });
  };

  const normalizedTripStatus = String(trip?.status || "").toLowerCase();
  const tabs = useMemo(() => {
    const packingStats = localStats?.packing_items || {};
    const documentStats =
      documentStatsOverride || localStats?.documents || {};
    const packedCount = Number(packingStats.is_packed_count || 0);
    const packingTotal = Number(packingStats.total_count || 0);
    const packedDocumentCount = Number(documentStats.is_packed_count || 0);
    const documentTotal = Number(documentStats.total_count || 0);

    const tabsWithStats = planningTabs.map((tab) => {
      if (tab.value === "packing") {
        return {
          ...tab,
          count: buildStatLabel(packedCount, packingTotal),
          isComplete: packingTotal > 0 && packedCount >= packingTotal,
        };
      }

      if (tab.value === "documents") {
        return {
          ...tab,
          count: buildStatLabel(packedDocumentCount, documentTotal),
          isComplete: documentTotal > 0 && packedDocumentCount >= documentTotal,
        };
      }

      return tab;
    });

    return sortPlanningTabs(tabsWithStats, normalizedTripStatus);
  }, [documentStatsOverride, localStats, normalizedTripStatus]);

  return (
    <PlanningTabView
      key={`${trip?.id}-${normalizedTripStatus}`}
      tabs={tabs}
      tripId={trip.id}
      onPackingStatsChange={updatePackingStats}
      onDocumentStatsChange={updateDocumentStats}
    />
  );
};

const PlanningTabView = ({
  tabs,
  tripId,
  onPackingStatsChange,
  onDocumentStatsChange,
}) => {
  const [activeTab, setActiveTab] = useState(
    () => tabs[0]?.value || "packing",
  );
  const contentRef = useRef(null);

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;

    setActiveTab(nextTab);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <section>
      <TabMenu
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        scrollable
        className="sticky top-[106px] z-20 -mx-4 bg-white/90 px-4 pt-2 backdrop-blur-xl md:top-16 md:mx-0 md:px-0"
      />

      <div ref={contentRef} className="scroll-mt-[168px] md:scroll-mt-28">
        {activeTab === "packing" && (
          <TripPackingItems
            tripId={tripId}
            onStatsChange={onPackingStatsChange}
          />
        )}
        {activeTab === "documents" && (
          <TripDocumentList
            tripId={tripId}
            onStatsChange={onDocumentStatsChange}
          />
        )}
        {activeTab === "route" && <TripRoutePlan tripId={tripId} />}
        {activeTab === "days" && <TripDayWisePlan tripId={tripId} />}
        {activeTab === "heads-up" && <TripHeadsUp tripId={tripId} />}
      </div>
    </section>
  );
};

export default TripPlanningTabs;
