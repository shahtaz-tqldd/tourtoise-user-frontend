import React from "react";
import Container from "@/components/ui/container";
import DestinationCard from "@/templates/destination/destination-list/destination-card";
import { Typography } from "@/components/ui/typography";
import { DESTINATIONS } from "@/templates/destination/_demo-data";

const SuggestedDestination = () => {
  return (
    <Container>
      <Typography as="h1" size="xl">
        Suggested Destination
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {DESTINATIONS.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </div>
    </Container>
  );
};

export default SuggestedDestination;
