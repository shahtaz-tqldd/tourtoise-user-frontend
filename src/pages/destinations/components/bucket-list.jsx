import AgentMessageComposer from "@/components/shared/agent-message-composer";
import { DetailPill } from "@/components/shared/utils";
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
import { getCloudinaryPreviewUrl } from "@/lib/utils";
import { Bookmark, BookmarkX, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";

const DestinationMiniList = ({ destinations }) => {
  if (!destinations.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 border border-dashed rounded-3xl border-slate-200">
        <div className="center h-12 w-12 rounded-full bg-slate-200/80">
          <BookmarkX className="text-gray-500" />
        </div>
        <p className="mx-auto max-w-[240px] text-center text-sm leading-5 text-slate-500">
          You have no destination added to your bucket list
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {destinations.map((destination) => (
        <Link
          key={destination.slug}
          to={`/destinations/${destination.slug}`}
          className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-2 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {destination.cover_image ? (
              <img
                src={getCloudinaryPreviewUrl(destination.cover_image, 80)}
                alt={destination.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-slate-950">
              {destination.name}
            </h3>
            <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-slate-500">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">
                {[destination.region, destination.country]
                  .filter(Boolean)
                  .join(", ") || "Destination"}
              </span>
            </p>
            <DetailPill className="mt-2 block w-fit bg-primary/10 text-primary">
              {destination.destination_type}
            </DetailPill>
          </div>
        </Link>
      ))}
    </div>
  );
};

export const BucketListPanel = ({
  savedDestinations,
  isFetching,
  className = "",
}) => (
  <aside className={`min-w-0 lg:sticky lg:top-24 lg:self-start ${className}`}>
    <div className="space-y-12">
      <AgentMessageComposer
        message="Hey, nice that you're here, right now it's really great time to go to Sundarban, Nebula and so on!"
      />

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <Bookmark size={14} />
          Your bucket list
        </div>
        {isFetching ? (
          <p className="text-sm leading-5 text-slate-500">
            Loading saved destinations...
          </p>
        ) : (
          <DestinationMiniList destinations={savedDestinations} />
        )}
      </section>
    </div>
  </aside>
);

export const BucketListDrawer = ({ savedDestinations, isFetching }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-12 rounded-full border-slate-200 lg:hidden"
        aria-label="Open bucket list"
      >
        <Bookmark size={16} />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="w-[min(92vw,380px)] overflow-y-auto p-0"
      showCloseButton={false}
    >
      <SheetHeader className="border-b border-slate-100 p-4 pr-10 text-left">
        <SheetTitle>Bucket List</SheetTitle>
        <SheetDescription>Saved places and seasonal ideas.</SheetDescription>
      </SheetHeader>
      <SheetClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-3 top-3 rounded-full"
          aria-label="Close bucket list"
        >
          <X size={16} />
        </Button>
      </SheetClose>
      <div className="p-4">
        <BucketListPanel
          savedDestinations={savedDestinations}
          isFetching={isFetching}
        />
      </div>
    </SheetContent>
  </Sheet>
);
