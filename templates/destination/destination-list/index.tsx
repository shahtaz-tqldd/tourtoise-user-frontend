import React from "react";
import Container from "@/components/ui/container";
import DestinationCard from "./destination-card";
import { TourDestination } from "../_types";

// Use the interface you defined
interface DestinationListProps {
  data: TourDestination[];
}

const DestinationList: React.FC<DestinationListProps> = ({ data }) => {
  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-gray-500">No destinations found.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="!pt-12">
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        role="list"
        aria-label="Destinations grid"
      >
        {data.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            role="listitem"
          />
        ))}
      </div>
    </Container>
  );
};

export default React.memo(DestinationList);
