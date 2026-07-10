import React, { useState } from "react";
import PreviewContent from "@/components/shared/preview-content";
import { FloatingInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCreateTripShareTokenMutation,
  useUpdateTripVisibilityMutation,
} from "@/features/trips/tripApiSlice";
import { Check, Copy, Link2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const unwrapPayload = (response) => response?.data || response || {};

const getShareUrl = (payload) => payload?.share_url || "";

const ShareTripDialog = ({ trip, open, onOpenChange, onTripChange }) => {
  const tripId = getTripId(trip);

  return (
    <PreviewContent
      open={open}
      onOpenChange={onOpenChange}
      className="md:p-8 p-6 !max-w-xl h-fit"
    >
      {open && (
        <ShareTripDialogContent
          key={tripId}
          trip={trip}
          onOpenChange={onOpenChange}
          onTripChange={onTripChange}
        />
      )}
    </PreviewContent>
  );
};

const ShareTripDialogContent = ({ trip, onOpenChange, onTripChange }) => {
  const tripId = getTripId(trip);
  const [visibility, setVisibility] = useState(trip?.visibility || "private");
  const [shareUrl, setShareUrl] = useState(
    trip?.visibility === "private" ? "" : trip?.share_url || "",
  );
  const [copied, setCopied] = useState(false);
  const [createShareToken, { isLoading: isCreatingShareToken }] =
    useCreateTripShareTokenMutation();
  const [updateVisibility, { isLoading: isUpdatingVisibility }] =
    useUpdateTripVisibilityMutation();
  const isBusy = isCreatingShareToken || isUpdatingVisibility;
  const canShare = Boolean(shareUrl);

  const handleGenerateLink = async () => {
    if (!tripId || isCreatingShareToken) {
      return;
    }

    try {
      const response = await createShareToken({ trip_id: tripId }).unwrap();
      const payload = unwrapPayload(response);
      const nextShareUrl = getShareUrl(payload);

      if (nextShareUrl) {
        setShareUrl(nextShareUrl);
        const visibilityResponse = await updateVisibility({
          trip_id: tripId,
          visibility: "public",
        }).unwrap();
        const visibilityPayload = unwrapPayload(visibilityResponse);
        const nextVisibility = visibilityPayload.visibility || "public";

        setVisibility(nextVisibility);
        onTripChange?.({
          share_url: nextShareUrl,
          visibility: nextVisibility,
        });
        toast.success("Share link generated.");
        return;
      }

      toast.error("Share link was created, but no URL was returned.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not generate share link.");
    }
  };

  const makeTripPrivate = async () => {
    if (!tripId || isUpdatingVisibility) {
      return;
    }

    try {
      const response = await updateVisibility({
        trip_id: tripId,
        visibility: "private",
      }).unwrap();
      const payload = unwrapPayload(response);
      const nextVisibility = payload.visibility || "private";

      setVisibility(nextVisibility);
      setShareUrl("");
      onTripChange?.({ share_url: "", visibility: nextVisibility });
      toast.success("Trip is private.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.data?.message || "Could not update visibility.");
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied.");
    } catch {
      toast.error("Could not copy share link.");
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mt-2 md:mt-0">Share trip</h2>
      <p className="text-sm mt-1 text-slate-500">Share this trip with others</p>

      <div className="mt-6 space-y-5">
        {!shareUrl ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex gap-3">
              <div className="center size-9 shrink-0 rounded-full bg-white text-slate-500">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Your trip is currently private.
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Generate a shareable link when you are ready to let others
                  view this trip.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-6 text-slate-500">
              {visibility === "private"
                ? "Your trip is currently private. The link is saved here for when sharing is enabled again."
                : "Anyone with this link can view the shared trip."}
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-blue-50 px-4 py-3">
              <span className="text-sm text-blue-700 truncate">{shareUrl}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                disabled={!canShare || isBusy}
                onClick={copyShareUrl}
                aria-label="Copy share link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex md:flex-row flex-col w-full md:justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full md:w-auto"
        >
          Cancel
        </Button>
        {!shareUrl ? (
          <Button
            type="button"
            className="w-full md:w-auto"
            disabled={isBusy}
            onClick={handleGenerateLink}
          >
            {isCreatingShareToken ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Link2 size={16} />
            )}
            Generate link
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="destructive"
              className="w-full md:w-auto"
              disabled={isBusy}
              onClick={makeTripPrivate}
            >
              {isUpdatingVisibility ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Lock size={16} />
              )}
              Make it private
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default ShareTripDialog;
