"use client";

import React, { useState } from "react";
import Container from "@/components/ui/container";
import DestinationCard from "@/templates/destination/destination-list/destination-card";
import { Typography } from "@/components/ui/typography";
import { useDestinationListQuery } from "@/store/services/destination";
import { TourDestinationBase } from "@/templates/destination/_types";

const SuggestedDestination = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const { data } = useDestinationListQuery({ page, page_size: pageSize });

  console.log(data);
  return (
    <Container>
      <Typography as="h1" size="xl">
        Suggested Destination
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {data?.data?.map((destination: TourDestinationBase) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </div>
    </Container>
  );
};

export default SuggestedDestination;
