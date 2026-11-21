import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/ui/container";

export const EmptyDestination = () => {
  return (
    <Container>
      <div className="rounded-card bg-surface p-8 text-center ring-1 ring-line-subtle">
        <h1 className="font-display text-h3 text-heading">
          Destination not found
        </h1>
        <p className="mt-1 text-body-sm text-subtle">
          The selected destination could not be loaded.
        </p>
      </div>
    </Container>
  );
};

const Block = ({ className }) => (
  <div className={`animate-pulse rounded-card bg-ink-200/70 ${className}`} />
);

/** Mirrors the page layout so nothing jumps when data arrives. */
export const DestinationLoader = () => {
  return (
    <Container>
      <div
        role="status"
        aria-label="Loading destination"
        className="flex flex-col gap-6"
      >
        <div className="order-2 space-y-3 md:order-1">
          <Block className="hidden h-4 w-32 md:block" />
          <Block className="h-10 w-2/3 max-w-md" />
          <Block className="h-5 w-1/2 max-w-sm" />
        </div>
        <Block className="order-1 -mx-2.5 -mt-5 aspect-[4/3] !rounded-none md:order-2 md:mx-0 md:mt-0 md:aspect-auto md:h-[360px] md:!rounded-sheet lg:h-[440px]" />
        <div className="order-3 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Block className="h-24" />
            <Block className="h-40" />
          </div>
          <Block className="hidden h-72 lg:block" />
        </div>
      </div>
    </Container>
  );
};
