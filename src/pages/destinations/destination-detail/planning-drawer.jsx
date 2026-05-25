import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Send } from "lucide-react";

const PlanningDrawer = ({ destination, open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-full overflow-hidden bg-white p-0 sm:max-w-[480px]"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-slate-200 pr-12 text-left">
            <SheetTitle className="text-xl text-slate-950">
              Plan {destination.name}
            </SheetTitle>
            <SheetDescription>
              {destination.region}, {destination.country}
            </SheetDescription>
          </SheetHeader>

          <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
              Tell me your travel dates, group size, budget, and preferred pace.
              I will use {destination.name} as the trip context.
            </div>
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm leading-6 text-white">
              I want a relaxed itinerary with local food and scenic places.
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
              Good starting point. I can build a plan around the best travel
              months, stay length, movement notes, and nearby highlights.
            </div>
          </div>

          <form className="flex items-center gap-2 border-t border-slate-200 p-4">
            <input
              type="text"
              placeholder="Ask the planning agent..."
              className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <Button type="button" size="icon" className="rounded-full">
              <Send size={17} />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PlanningDrawer;
