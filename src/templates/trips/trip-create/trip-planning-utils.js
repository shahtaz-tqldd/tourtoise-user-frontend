export const unwrapApiData = (response, fallback = {}) =>
  response?.data ?? response ?? fallback;

export const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

export const getTripDetailId = (trip) =>
  getTripId(trip) || trip?.slug || trip?.trip_slug;

export const getDestinationSlug = (destination) =>
  destination?.slug || destination?.destination_slug || destination?.id;

const createDefaultTripForm = () => ({
  budget_tier: "comfort",
  budget_currency: "USD",
  start_date: "",
  days: "",
  travelers_count: "1",
  traveler_type: "solo",
  accommodation_preference: "",
  start_location_address: "",
  start_location_latitude: "",
  start_location_longitude: "",
  start_location_accuracy: "",
});

const getHandoffValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== "",
  );

const normalizeHandoffDate = (value) => {
  if (typeof value !== "string") return "";

  const normalizedDate = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate) ? normalizedDate : "";
};

const normalizeHandoffChoice = (value) =>
  value
    ? String(value).trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_")
    : "";

const getHandoffLocation = (handoff) => {
  const departureLocation = handoff?.departure_location;

  if (!departureLocation || typeof departureLocation === "string") {
    return {
      address: departureLocation || "",
      latitude: getHandoffValue(handoff?.departure_latitude, handoff?.latitude),
      longitude: getHandoffValue(
        handoff?.departure_longitude,
        handoff?.longitude,
      ),
      accuracy: getHandoffValue(
        handoff?.departure_accuracy,
        handoff?.location_accuracy,
      ),
    };
  }

  return {
    address:
      departureLocation.address ||
      departureLocation.formatted_address ||
      departureLocation.name ||
      "",
    latitude: getHandoffValue(
      departureLocation.latitude,
      departureLocation.lat,
    ),
    longitude: getHandoffValue(
      departureLocation.longitude,
      departureLocation.lng,
      departureLocation.lon,
    ),
    accuracy: getHandoffValue(departureLocation.accuracy),
  };
};

export const createInitialTripForm = (handoff) => {
  if (!handoff) return createDefaultTripForm();

  const travelerType = normalizeHandoffChoice(
    getHandoffValue(handoff.traveller_type, handoff.traveler_type),
  );
  const travelerCount = getHandoffValue(
    handoff.traveller_count,
    handoff.travelers_count,
  );
  const resolvedTravelerType = travelerType || "solo";
  const location = getHandoffLocation(handoff);

  return {
    budget_tier: normalizeHandoffChoice(handoff.budget_tier) || "budget",
    budget_currency: String(handoff.budget_currency || "").toUpperCase(),
    start_date: normalizeHandoffDate(handoff.start_date),
    days: getHandoffValue(handoff.duration_days, handoff.days)?.toString() || "",
    travelers_count:
      travelerCount?.toString() ||
      (resolvedTravelerType === "solo"
        ? "1"
        : resolvedTravelerType === "couple"
          ? "2"
          : ""),
    traveler_type: resolvedTravelerType,
    accommodation_preference: normalizeHandoffChoice(
      handoff.accommodation_preference,
    ),
    start_location_address: String(location.address || ""),
    start_location_latitude: location.latitude?.toString() || "",
    start_location_longitude: location.longitude?.toString() || "",
    start_location_accuracy: location.accuracy?.toString() || "",
  };
};

const titleTemplates = [
  "{destination} travel plan",
  "{destination} getaway",
  "{destination} itinerary",
  "{destination} holiday plan",
  "{destination} trip",
  "Explore {destination}",
];

export const getTripTitle = (trip, destination) =>
  trip?.title || `${destination?.name || "Destination"} plan`;

export const getGeneratedTripTitle = (destinationName) => {
  const placeName = destinationName || "Destination";
  const template =
    titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

  return template.replace("{destination}", placeName);
};

export const getEndDate = (startDate, days) => {
  const tripDays = Number(days);
  if (!startDate || !Number.isFinite(tripDays) || tripDays < 1) return "";

  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + tripDays - 1);

  return date.toISOString().slice(0, 10);
};
