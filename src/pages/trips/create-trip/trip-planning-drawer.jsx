import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CheckCircle2,
  LocateFixed,
  Loader2,
  LockKeyhole,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import {
  useCreateTripMutation,
  useTripListQuery,
} from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const tripPaces = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "packed", label: "Packed" },
];

const initialForm = {
  total_budget: "",
  budget_currency: "USD",
  origin_city: "",
  origin_country: "",
  origin_latitude: "",
  origin_longitude: "",
  origin_accuracy: "",
  start_date: "",
  days: "",
  travelers_count: "1",
  trip_pace: "balanced",
};

const getDestinationId = (destination) =>
  destination?.id || destination?.destination_id || destination?.slug;

const getDestinationSlug = (destination) =>
  destination?.slug || destination?.destination_slug || destination?.id;

const unwrapList = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.results)) return data.data.results;

  return [];
};

const getTripTitle = (trip, destination) =>
  trip?.title || trip?.name || trip?.trip_name || `${destination?.name} plan`;

const getGeneratedTripTitle = (destination) => {
  const placeName = destination?.name || "Destination";
  return `${placeName} trip plan`;
};

const getEndDate = (startDate, days) => {
  const tripDays = Number(days);
  if (!startDate || !Number.isFinite(tripDays) || tripDays < 1) return "";

  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + tripDays - 1);

  return date.toISOString().slice(0, 10);
};

const getCityFromAddress = (address = {}) =>
  address.city ||
  address.town ||
  address.village ||
  address.municipality ||
  address.county ||
  address.state_district ||
  "";

const TripPlanningDrawer = ({ destination, open, onOpenChange }) => {
  const destinationId = getDestinationId(destination);
  const destinationSlug = getDestinationSlug(destination);
  const [form, setForm] = useState(initialForm);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [message, setMessage] = useState("");
  const [threadMessages, setThreadMessages] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const { data: tripListData, isFetching: isCheckingTrips } = useTripListQuery(
    open && destinationId
      ? { destination_id: destinationId, page: 1, page_size: 1 }
      : skipToken,
  );
  const [createTrip, { isLoading: isCreatingTrip }] = useCreateTripMutation();

  const previousTrip = useMemo(() => {
    const trips = unwrapList(tripListData);
    return trips[0] || null;
  }, [tripListData]);

  const activeTrip = createdTrip || previousTrip;
  const messages = useMemo(() => {
    if (threadMessages.length) return threadMessages;
    if (!activeTrip) return [];

    if (previousTrip && !createdTrip) {
      return [
        {
          role: "agent",
          content: `I found your existing ${getTripTitle(
            previousTrip,
            destination,
          )}. We can continue refining pickup, documents, itinerary, and final plan details here.`,
        },
      ];
    }

    return [
      {
        role: "agent",
        content: `Trip planning has started for ${destination?.name}. I will first shape the route and pace, then we can work through pickup, documents, itinerary, and final locking.`,
      },
    ];
  }, [activeTrip, createdTrip, destination, previousTrip, threadMessages]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const requestCurrentLocation = async ({ silent = false } = {}) => {
    if (!navigator.geolocation) {
      if (!silent) toast.error("Current location is not available here.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Requesting browser location permission...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        setForm((current) => ({
          ...current,
          origin_latitude: String(latitude),
          origin_longitude: String(longitude),
          origin_accuracy: accuracy ? String(Math.round(accuracy)) : "",
        }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const location = await response.json();
          const address = location?.address || {};
          const city = getCityFromAddress(address);
          const country = address.country || "";

          setForm((current) => ({
            ...current,
            origin_city: city || current.origin_city,
            origin_country: country || current.origin_country,
          }));

          setLocationStatus(
            city && country
              ? `Using ${city}, ${country} from current location.`
              : "Coordinates saved. Add city and country manually.",
          );
        } catch {
          setLocationStatus("Coordinates saved. Add city and country manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus("");

        if (!silent) {
          toast.error(
            error?.code === error?.PERMISSION_DENIED
              ? "Location permission was denied. Add origin manually."
              : "Could not read current location. Add origin manually.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  useEffect(() => {
    if (!open || !navigator.permissions || !navigator.geolocation) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (permission.state === "granted") {
          requestCurrentLocation({ silent: true });
        }
      })
      .catch(() => {});
  }, [open]);

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    if (!destinationSlug) {
      toast.error("Destination slug is missing.");
      return;
    }

    if (
      !form.origin_city ||
      !form.origin_country ||
      !form.start_date ||
      !form.days ||
      !form.travelers_count
    ) {
      toast.error("Fill in the trip basics before starting the plan.");
      return;
    }

    const endDate = getEndDate(form.start_date, form.days);
    const totalBudget = Number(form.total_budget);
    const latitude = Number(form.origin_latitude);
    const longitude = Number(form.origin_longitude);
    const accuracy = Number(form.origin_accuracy);

    try {
      const response = await createTrip({
        title: getGeneratedTripTitle(destination),
        destination_slugs: [destinationSlug],
        start_date: form.start_date,
        end_date: endDate,
        travelers_count: Number(form.travelers_count),
        trip_pace: form.trip_pace,
        origin_city: form.origin_city,
        origin_country: form.origin_country,
        ...(form.total_budget
          ? {
              total_budget: totalBudget,
              budget_currency: form.budget_currency,
            }
          : {}),
        ...(form.origin_latitude && form.origin_longitude
          ? {
              agent_context: {
                origin: {
                  latitude,
                  longitude,
                  ...(Number.isFinite(accuracy)
                    ? { accuracy_meters: accuracy }
                    : {}),
                },
              },
            }
          : {}),
      }).unwrap();
      const createdTrip = response?.data || response;

      setCreatedTrip(createdTrip);
      setThreadMessages([]);
      toast.success("Trip planning started.");
    } catch (error) {
      toast.error(
        error?.data?.message || "Could not start trip planning. Try again.",
      );
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setThreadMessages((current) => [
      ...(current.length ? current : messages),
      { role: "user", content: trimmedMessage },
      {
        role: "agent",
        content:
          "Noted. I will use that when generating the next planning step.",
      },
    ]);
    setMessage("");
  };

  const showSetupForm = !isCheckingTrips && !previousTrip && !activeTrip;
  const showAgent = !!activeTrip;
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setCreatedTrip(null);
      setThreadMessages([]);
      setMessage("");
      setForm(initialForm);
      setLocationStatus("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-full overflow-hidden bg-white p-0 sm:max-w-[480px]"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-slate-200 pr-12 text-left">
            <SheetTitle className="text-xl text-slate-950">
              Plan {destination?.name}
            </SheetTitle>
            <SheetDescription>
              {destination?.region}, {destination?.country}
            </SheetDescription>
          </SheetHeader>

          {isCheckingTrips && (
            <div className="center flex-1 text-sm text-slate-500">
              <Loader2 className="mr-2 animate-spin text-primary" size={18} />
              Checking previous trip planning...
            </div>
          )}

          {showSetupForm && (
            <form
              onSubmit={handleCreateTrip}
              className="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-4"
            >
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 text-primary" size={18} />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Start a planning session
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Add the basics so the trip agent can create the first
                      planning draft for {destination?.name}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="trip-budget">Budget</Label>
                  <Input
                    id="trip-budget"
                    type="number"
                    min="0"
                    placeholder="Total budget"
                    value={form.total_budget}
                    onChange={(event) =>
                      updateField("total_budget", event.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="origin-city">Origin</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => requestCurrentLocation()}
                      disabled={isLocating}
                    >
                      {isLocating ? (
                        <Loader2 className="animate-spin" size={15} />
                      ) : (
                        <LocateFixed size={15} />
                      )}
                      Use current
                    </Button>
                  </div>
                  {locationStatus && (
                    <p className="text-xs leading-5 text-slate-500">
                      {locationStatus}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <Input
                      id="origin-city"
                      placeholder="City"
                      className="pl-9"
                      value={form.origin_city}
                      onChange={(event) =>
                        updateField("origin_city", event.target.value)
                      }
                    />
                  </div>
                  <Input
                    id="origin-country"
                    placeholder="Country"
                    value={form.origin_country}
                    onChange={(event) =>
                      updateField("origin_country", event.target.value)
                    }
                  />
                </div>

                {form.origin_latitude && form.origin_longitude && (
                  <p className="-mt-2 text-xs text-slate-500">
                    Coordinates: {Number(form.origin_latitude).toFixed(5)},{" "}
                    {Number(form.origin_longitude).toFixed(5)}
                  </p>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="trip-start-date">Start date</Label>
                  <Input
                    id="trip-start-date"
                    type="date"
                    value={form.start_date}
                    onChange={(event) =>
                      updateField("start_date", event.target.value)
                    }
                  />
                  {form.start_date && form.days && (
                    <p className="text-xs text-slate-500">
                      End date will be {getEndDate(form.start_date, form.days)}.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="trip-days">Days</Label>
                    <Input
                      id="trip-days"
                      type="number"
                      min="1"
                      placeholder="5"
                      value={form.days}
                      onChange={(event) =>
                        updateField("days", event.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="trip-travelers">Travelers</Label>
                    <Input
                      id="trip-travelers"
                      type="number"
                      min="1"
                      placeholder="2"
                      value={form.travelers_count}
                      onChange={(event) =>
                        updateField("travelers_count", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Trip pace</Label>
                  <Select
                    value={form.trip_pace}
                    onValueChange={(value) => updateField("trip_pace", value)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select trip pace" />
                    </SelectTrigger>
                    <SelectContent>
                      {tripPaces.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-full"
                disabled={isCreatingTrip}
              >
                {isCreatingTrip ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <Sparkles size={17} />
                )}
                Create trip plan
              </Button>
            </form>
          )}

          {showAgent && (
            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Active planning
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {getTripTitle(activeTrip, destination)}
                </p>
              </div>

              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    item.role === "user"
                      ? "ml-auto rounded-tr-md bg-primary text-white"
                      : "rounded-tl-md bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.content}
                </div>
              ))}

              <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
                <p className="text-sm font-semibold text-slate-900">
                  Upcoming agent steps
                </p>
                <div className="grid gap-2 text-sm text-slate-600">
                  <span>Pickup and movement plan</span>
                  <span>Required documents</span>
                  <span>Itinerary draft</span>
                  <span>Final review and lock</span>
                </div>
              </div>
            </div>
          )}

          {showAgent && (
            <>
              <div className="flex gap-2 border-t border-slate-200 px-4 py-3">
                <Button type="button" variant="outline" className="flex-1">
                  <CheckCircle2 size={17} />
                  Proceed
                </Button>
                <Button type="button" className="flex-1">
                  <LockKeyhole size={17} />
                  Lock plan
                </Button>
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 border-t border-slate-200 p-4"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ask the planning agent..."
                  className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <Button type="submit" size="icon" className="rounded-full">
                  <Send size={17} />
                </Button>
              </form>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TripPlanningDrawer;
