"use client";

import React, { useState } from "react";

import { MessageSquare } from "lucide-react";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import TripPlanner from "./trip-planner";
import DestinationDetailsSection from "./details";
import { useDestinationDetailsQuery } from "@/store/services/destination";

// Chat message interface

const DestinationDetailsPage = ({
  destination_slug,
}: {
  destination_slug: string;
}) => {
  const { data } = useDestinationDetailsQuery({ destination_slug });

  const destination = data?.data || {};
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <Container className="!pt-32 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Destination Details */}
        <div className="lg:col-span-3 space-y-8">
          <DestinationDetailsSection destination={destination} />
        </div>
        {/* Right Column - Chat Interface (Desktop) */}
        <TripPlanner destination={destination} />
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </Button>
      </div>

      {/* Mobile Chat Modal */}
      {isChatOpen && <TripPlanner destination={destination} />}
    </Container>
  );
};

export default DestinationDetailsPage;
