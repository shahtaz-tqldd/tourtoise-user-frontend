import { SectionHeader } from "@/components/shared/utils";
import Card from "@/components/ui/card";
import { BaggageClaim } from "lucide-react";
import React from "react";

const TripProfile = () => {
  return (
    <Card>
      <SectionHeader
        icon={BaggageClaim}
        title="Trip Profile"
        description="Manage Your Profile Settings"
      />
    </Card>
  );
};

export default TripProfile;
