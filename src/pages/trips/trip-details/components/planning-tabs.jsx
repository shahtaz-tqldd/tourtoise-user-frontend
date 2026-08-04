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
  { value: "route", label: "Route", icon: Route },
  { value: "days", label: "Day Wise Plan", icon: CalendarDays },
  { value: "heads-up", label: "Heads-up", icon: AlertTriangle },
];

const buildStatLabel = (completed = 0, total = 0) => {
  if (!total) return null;
  return `${completed}/${total}`;
};

const TripPlanningTabs = ({ trip }) => {
  const [activeTab, setActiveTab] = useState("packing");
  const contentRef = useRef(null);
  const [localStats, setLocalStats] = useState(() => trip?.preparation_stats);

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

  const updateDocumentStats = ({ uploadedDelta = 0, totalDelta = 0 }) => {
    setLocalStats((currentStats) => {
      const currentDocumentStats = currentStats?.documents || {};
      const totalCount = Math.max(
        0,
        Number(currentDocumentStats.total_count || 0) + totalDelta,
      );
      const uploadedCount = Math.min(
        totalCount,
        Math.max(
          0,
          Number(currentDocumentStats.uploaded_count || 0) + uploadedDelta,
        ),
      );

      return {
        ...currentStats,
        documents: {
          ...currentDocumentStats,
          total_count: totalCount,
          uploaded_count: uploadedCount,
        },
      };
    });
  };

  const tabs = useMemo(() => {
    const packingStats = localStats?.packing_items || {};
    const documentStats = localStats?.documents || {};
    const packedCount = Number(packingStats.is_packed_count || 0);
    const packingTotal = Number(packingStats.total_count || 0);
    const uploadedCount = Number(documentStats.uploaded_count || 0);
    const documentTotal = Number(documentStats.total_count || 0);

    return planningTabs.map((tab) => {
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
          count: buildStatLabel(uploadedCount, documentTotal),
          isComplete: documentTotal > 0 && uploadedCount >= documentTotal,
        };
      }

      return tab;
    });
  }, [localStats]);

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) {
      return;
    }

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
            tripId={trip.id}
            onStatsChange={updatePackingStats}
          />
        )}
        {activeTab === "documents" && (
          <TripDocumentList
            tripId={trip.id}
            onStatsChange={updateDocumentStats}
          />
        )}
        {activeTab === "route" && <TripRoutePlan tripId={trip.id} />}
        {activeTab === "days" && <TripDayWisePlan tripId={trip.id} />}
        {activeTab === "heads-up" && <TripHeadsUp tripId={trip.id} />}
      </div>
    </section>
  );
};

export default TripPlanningTabs;
