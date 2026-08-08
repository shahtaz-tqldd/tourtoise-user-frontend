import React from "react";
import { ArrowLeft, History, Luggage } from "lucide-react";

import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import TripCard from "./trip-card";
import TripListLoader from "./trip-list-loader";

export const TripHistory = ({
  className = "",
  trips,
  search,
  onSearchChange,
  isFetching,
  isError,
}) => (
  <aside className={`${className} space-y-5 lg:sticky lg:top-24 lg:self-start`}>
    <SectionHeader
      icon={Luggage}
      title="Trip History"
      description="Your past completed trips"
      className="hidden md:block"
    />

    {isFetching && <TripListLoader compact />}

    {isError && !isFetching && (
      <EmptyState
        title="Could not load history"
        description="Check the trips endpoint and try again."
        compact
      />
    )}

    {!isFetching && !isError && trips.length > 0 && (
      <div className="space-y-3">
        {trips.map((trip) => (
          <TripCard key={trip.id || trip.slug} trip={trip} compact />
        ))}
      </div>
    )}

    {!isFetching && !isError && !trips.length && (
      <EmptyState
        title="No past trips"
        description={
          search
            ? "No past trips match the current search."
            : "Completed, archived, cancelled, or ended trips will collect here."
        }
        onClear={search ? () => onSearchChange("") : undefined}
        compact
      />
    )}
  </aside>
);

export const TripHistoryDrawer = ({
  trips,
  search,
  onSearchChange,
  isFetching,
  isError,
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-12 rounded-full border-slate-200 lg:hidden"
        aria-label="Open trip history"
      >
        <History size={16} />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="w-screen gap-0 overflow-y-auto p-0"
      showCloseButton={false}
    >
      <SheetHeader className="border-b border-slate-100 pr-12 text-left">
        <div className="mb-4 flex h-10 items-center gap-2">
          <SheetClose asChild>
            <button
              type="button"
              className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              aria-label="Close profile menu"
            >
              <ArrowLeft className="size-5" />
            </button>
          </SheetClose>
          <div>
            <SheetTitle>Trip History</SheetTitle>
            <SheetDescription>Your past completed trips.</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="p-4">
        <TripHistory
          trips={trips}
          search={search}
          onSearchChange={onSearchChange}
          isFetching={isFetching}
          isError={isError}
        />
      </div>
    </SheetContent>
  </Sheet>
);
