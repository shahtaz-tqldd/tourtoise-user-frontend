"use client";

import { use } from "react";
import MainLayout from "@/layouts/main-layout";
import DestinationDetailsPage from "@/templates/destination-details";

export default function DestinationDetails({
  params,
}: {
  params: Promise<{ destination_slug: string }>;
}) {
  const { destination_slug } = use(params);

  return (
    <MainLayout>
      <DestinationDetailsPage destination_slug={destination_slug} />
    </MainLayout>
  );
}
