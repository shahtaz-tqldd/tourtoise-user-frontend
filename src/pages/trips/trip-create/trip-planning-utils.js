export const unwrapApiData = (response, fallback = {}) =>
  response?.data ?? response ?? fallback;

export const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

export const getTripDetailId = (trip) =>
  getTripId(trip) || trip?.slug || trip?.trip_slug;

export const getDestinationSlug = (destination) =>
  destination?.slug || destination?.destination_slug || destination?.id;

export const createInitialTripForm = () => ({
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
