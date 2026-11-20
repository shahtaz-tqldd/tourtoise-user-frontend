import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Heart, MapPin, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Display, Text } from "@/components/ui/typography";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { useSaveDestinationMutation } from "@/features/destination/destinationApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import { getTagLabel } from "../detail-utils";

const SaveButton = ({ destination }) => {
  const [saveDestination, { isLoading }] = useSaveDestinationMutation();
  const { requireAuth, isAuthenticated } = useAuthGate();
  const isSaved = Boolean(isAuthenticated && destination?.is_saved);

  const toggleSave = async () => {
    if (!destination?.slug) return;
    try {
      await saveDestination({
        destination_slug: destination.slug,
        save: !isSaved,
      }).unwrap();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isSaved ? "Could not remove this place." : "Could not save this place.",
        ),
      );
    }
  };

  return (
    <Button
      variant="outline"
      className="rounded-full"
      disabled={isLoading}
      aria-pressed={isSaved}
      onClick={() => requireAuth(toggleSave, { reason: "save" })}
    >
      <Heart
        aria-hidden="true"
        className={cn(isSaved && "fill-danger text-danger")}
      />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
};

const ShareButton = ({ name }) => {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on tourtoise`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch (error) {
      if (error?.name !== "AbortError") toast.error("Could not share this place.");
    }
  };

  return (
    <Button variant="outline" className="rounded-full" onClick={share}>
      <Share2 aria-hidden="true" />
      Share
    </Button>
  );
};

/** Name, one-line pitch, where it is, and the save/share actions. */
const DestinationHeader = ({ destination, className }) => {
  const tags = (destination.tags || []).map(getTagLabel).filter(Boolean).slice(0, 4);

  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <Link
        to="/"
        className="hidden w-fit items-center gap-1.5 rounded-full text-body-sm font-semibold text-subtle transition hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All destinations
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Display as="h1" size="md" className="text-balance">
            {destination.name}
          </Display>
          {destination.tagline && (
            <Text size="lg" tone="body" className="mt-1.5 max-w-2xl text-pretty">
              {destination.tagline}
            </Text>
          )}
          {(destination.country || tags.length > 0) && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-subtle">
              {destination.country && (
                <span className="inline-flex items-center gap-1 font-semibold text-heading">
                  <MapPin className="size-4 text-brand-text" aria-hidden="true" />
                  {destination.country}
                </span>
              )}
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-faint">·</span>
                  {tag}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <SaveButton destination={destination} />
          <ShareButton name={destination.name} />
        </div>
      </div>
    </header>
  );
};

export default DestinationHeader;
