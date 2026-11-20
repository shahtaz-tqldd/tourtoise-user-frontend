import React from "react";
import { Link } from "react-router-dom";
import { Heart, Sun } from "lucide-react";
import { toast } from "sonner";

import { Image } from "@/components/shared/utils";
import { cn } from "@/lib/utils";
import { useSaveDestinationMutation } from "@/features/destination/destinationApiSlice";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { formatBestSeason, formatStayRange, isBestTimeNow } from "../destination-utils";

const titleCase = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const SaveButton = ({ destination }) => {
  const { requireAuth, isAuthenticated } = useAuthGate();
  const [saveDestination, { isLoading }] = useSaveDestinationMutation();
  const isSaved = Boolean(isAuthenticated && destination?.is_saved);

  const toggleSave = async () => {
    try {
      await saveDestination({
        destination_slug: destination.slug,
        save: !isSaved,
      }).unwrap();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update your saved places."));
    }
  };

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove from saved destinations" : "Save destination"}
      aria-pressed={isSaved}
      disabled={isLoading}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        requireAuth(toggleSave, { reason: "save" });
      }}
      className="absolute right-3 top-3 z-10 center size-9 rounded-full bg-white/90 text-ink-900 backdrop-blur transition hover:bg-white hover:scale-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white disabled:opacity-70"
    >
      <Heart
        className={cn("size-4", isSaved && "fill-danger text-danger")}
        aria-hidden="true"
      />
    </button>
  );
};

/**
 * Image-first destination card. The link covers the whole card; the save
 * button is a sibling (not nested) so both stay valid interactive elements.
 */
const DestinationCard = ({ destination, className }) => {
  const meta = [
    destination.country,
    ...(destination.tags || []).slice(0, 2).map(titleCase),
  ]
    .filter(Boolean)
    .join(" · ");
  const season = formatBestSeason(destination.best_travel_months);
  const stay = formatStayRange(destination);
  const detailLine = [season && `Best ${season}`, stay].filter(Boolean).join(" · ");
  const inSeason = isBestTimeNow(destination);

  return (
    <article className={cn("group relative", className)}>
      <Link
        to={`/destinations/${destination.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-ink-100 outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <Image
          src={destination.cover_image}
          alt=""
          width={640}
          loading="lazy"
          className="transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.7)_0%,rgb(0_0_0/0.4)_28%,transparent_55%)]"
        />

        {inSeason && (
          <span className="absolute left-3 top-3 flx gap-1 rounded-full bg-white/90 px-2.5 py-1 text-caption font-semibold text-ink-900 backdrop-blur">
            <Sun className="size-3.5 text-sand-600" aria-hidden="true" />
            In season
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]">
          <h3 className="truncate font-display text-lg font-semibold leading-tight !text-white md:text-xl">
            {destination.name}
          </h3>
          {meta && <p className="mt-1 truncate text-[13px] text-white/85">{meta}</p>}
          {detailLine && (
            <p className="grid grid-rows-[0fr] text-[13px] text-white/85 opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:transition-none">
              <span className="overflow-hidden truncate pt-0.5">{detailLine}</span>
            </p>
          )}
        </div>
      </Link>

      <SaveButton destination={destination} />
    </article>
  );
};

export default DestinationCard;
