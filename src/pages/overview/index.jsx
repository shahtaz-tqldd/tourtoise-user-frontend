import React from "react";
import { Text, Title } from "@/components/ui/typography";
import OverviewStats from "./components/stats";
import { OVERVIEW_STATS } from "./demo_data";

const Overview = () => {
  const overview_stats = OVERVIEW_STATS;

  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div>
        <Title variant="lg">Overview</Title>
        <Text className="mt-2">
          High-level summary of store performance, customer activity, and
          important metrics.
        </Text>
      </div>

      <OverviewStats stats={overview_stats} />
    </div>
  );
};

export default Overview;
