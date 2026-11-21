/**
 * Pure planning helpers. In production most of this moves to the backend; for
 * the demo it lets the UI react instantly to every pick and adjustment.
 */
import {
  FX,
  GENERIC_TIPS,
  PACE_OPTIONS,
  PACKING_CATALOGUE,
  POKHARA_CANDIDATES,
  POKHARA_FACTS,
  STAY_TIERS,
} from "./mock/mock-data";

export const KIND_KEYS = ["spots", "activities", "food"];

export const KIND_META = {
  spots: { label: "Spots", singular: "spot", apiKey: "attractions" },
  activities: { label: "Activities", singular: "activity", apiKey: "activities" },
  food: { label: "Food", singular: "dish", apiKey: "cuisines" },
};

/* ---------------------------------------------------------------- dates -- */

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const toInputDate = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const fromInputDate = (value) => {
  const [y, m, d] = String(value).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const formatDay = (date, opts = { weekday: "short", month: "short", day: "numeric" }) =>
  new Intl.DateTimeFormat("en", opts).format(date);

export const formatRange = (start, nights) => {
  const end = addDays(start, nights);
  const sameMonth = start.getMonth() === end.getMonth();
  const left = formatDay(start, { month: "short", day: "numeric" });
  const right = formatDay(end, sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" });
  return `${left} – ${right}`;
};

/* ---------------------------------------------------------------- money -- */

export const formatMoney = (usd, currency = "USD", { compact = false } = {}) => {
  const rate = FX[currency] ?? 1;
  const code = FX[currency] ? currency : "USD";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(usd * rate);
};

/* ------------------------------------------------------------ candidates -- */

const hash = (str) =>
  [...String(str)].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

const FALLBACK_HUES = [
  "from-brand-400 to-brand-700",
  "from-ocean-500 to-brand-600",
  "from-sand-400 to-sand-700",
  "from-ink-400 to-ink-700",
  "from-sand-300 to-rose-500",
];

/** Turns API places (any destination) into planner candidates with demo numbers. */
const fromApiItem = (item, kind) => {
  const h = hash(item.slug || item.name);
  const type = item.attraction_type || item.activity_type || item.cuisine_type || kind;
  return {
    id: String(item.id || item.slug || item.name),
    name: item.name,
    type: String(type).replace(/_/g, " "),
    area: item.address?.split(",")[0] || "Central",
    durationHrs: Number(item.duration_hours) || (kind === "food" ? 1 : 2),
    cost: kind === "food" ? 4 + (h % 12) : kind === "activities" ? 10 + (h % 60) : h % 8,
    slot: kind === "food" ? ["lunch", "dinner", "breakfast"][h % 3] : ["morning", "afternoon", "any"][h % 3],
    tags: [],
    blurb: item.short_description || item.description?.slice(0, 110) || "",
    intensity: 1 + (h % 2),
    hue: FALLBACK_HUES[h % FALLBACK_HUES.length],
    image: item.cover_image || item.images?.[0]?.image_url || null,
    veg: Boolean(item.is_vegetarian_friendly),
  };
};

const isPokhara = (destination) =>
  /pokhara/i.test(`${destination?.slug || ""} ${destination?.name || ""}`);

/**
 * Pokhara uses the hand-written demo catalogue (with images from the API when
 * names match); other destinations use their own places with demo numbers.
 */
export const getCatalogue = (destination) => {
  if (isPokhara(destination) || !destination) {
    const apiImages = new Map();
    Object.values(KIND_META).forEach(({ apiKey }) =>
      (destination?.[apiKey] || []).forEach((item) => {
        const img = item.cover_image || item.images?.[0]?.image_url;
        if (img) apiImages.set(item.name.toLowerCase(), img);
      }),
    );
    const withImage = (item) => {
      const key = [...apiImages.keys()].find((name) =>
        name.includes(item.name.split(" ")[0].toLowerCase()),
      );
      return { ...item, image: key ? apiImages.get(key) : null };
    };
    return Object.fromEntries(
      KIND_KEYS.map((k) => [k, POKHARA_CANDIDATES[k].map((i) => ({ ...withImage(i), kind: k }))]),
    );
  }

  return Object.fromEntries(
    KIND_KEYS.map((k) => {
      const items = (destination[KIND_META[k].apiKey] || []).slice(0, 8).map((i) => ({
        ...fromApiItem(i, k),
        kind: k,
      }));
      return [k, items.length ? items : POKHARA_CANDIDATES[k].map((i) => ({ ...i, kind: k }))];
    }),
  );
};

/** Score + one-line reason, so every card can say *why* it is there. */
export const scoreCandidate = (item, trip) => {
  const interests = trip.interests || [];
  const overlap = (item.tags || []).filter((t) => interests.includes(t));
  let score = 62 + overlap.length * 11 + (hash(item.id) % 7);

  const slow = trip.pace === "slow";
  const gentle = (trip.mobility || []).some((m) => /intense|walking|senior|kid/i.test(m));
  if ((slow || gentle) && item.intensity >= 3) score -= 18;
  if (trip.type === "couple" && /sunset|boat|dinner/i.test(item.name)) score += 6;
  if (trip.type === "family" && item.intensity >= 3) score -= 10;
  const veg = (trip.dietary || []).some((d) => /veg/i.test(d));
  if (item.kind === "food" && veg && !item.veg) score -= 25;

  const reason = overlap.length
    ? `You love ${overlap.slice(0, 2).join(" & ")}`
    : item.kind === "food"
      ? "A local favourite"
      : "Turtle's wildcard pick";
  const warning =
    item.kind === "food" && veg && !item.veg
      ? "Not vegetarian"
      : (slow || gentle) && item.intensity >= 3
        ? "Physically demanding"
        : null;

  return { ...item, match: Math.max(35, Math.min(99, score)), reason, warning };
};

export const rankCandidates = (catalogue, trip) =>
  Object.fromEntries(
    KIND_KEYS.map((k) => [
      k,
      catalogue[k].map((i) => scoreCandidate(i, trip)).sort((a, b) => b.match - a.match),
    ]),
  );

/* ------------------------------------------------------------- itinerary -- */

const SLOT_ORDER = { sunrise: 0, breakfast: 1, morning: 2, lunch: 3, any: 4, afternoon: 5, evening: 6, dinner: 7 };
const SLOT_START = { sunrise: 330, breakfast: 480, morning: 570, lunch: 780, any: 840, afternoon: 900, evening: 1050, dinner: 1170 };

const formatClock = (mins) => {
  const h24 = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60 / 15) * 15;
  const h = h24 % 12 || 12;
  return `${h}:${String(m % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
};

/** Sequential times: each stop starts at its preferred slot or after the last one ends. */
const schedule = (items) => {
  let cursor = 0;
  return items.map((item) => {
    const start = Math.max(SLOT_START[item.slot] ?? 840, cursor);
    cursor = start + item.durationHrs * 60 + 20;
    return { ...item, time: formatClock(start) };
  });
};

const ARRIVAL_SLOTS = new Set(["afternoon", "evening", "any", "dinner"]);

const DAY_THEMES = {
  Lakeside: "Lakeside & slow afternoons",
  Sarangkot: "Sunrise & the high ridge",
  "Old Bazaar": "Old town & local flavours",
  "Old Pokhara": "Old town & local flavours",
  Begnas: "The quiet lakes",
  Kande: "Into the Annapurna foothills",
  Chhorepatan: "Waterfalls & caves",
};

/**
 * Greedy planner: must-dos first, grouped by area, capped by pace.
 * Returns { days, unplaced }.
 */
export const buildItinerary = ({ trip, picks }) => {
  const dayCount = Math.max(1, Math.min(trip.nights + 1, 8));
  const perDay = PACE_OPTIONS.find((p) => p.value === trip.pace)?.perDay ?? 3;
  const capacity = (i) => (i === 0 || i === dayCount - 1 ? Math.max(1, perDay - 1) : perDay);

  const doings = picks
    .filter((p) => p.kind !== "food")
    .sort((a, b) => (b.love ? 1 : 0) - (a.love ? 1 : 0) || b.match - a.match);
  const meals = picks.filter((p) => p.kind === "food");

  const days = Array.from({ length: dayCount }, (_, i) => ({
    index: i,
    date: addDays(trip.startDate, i),
    items: [],
    areas: new Set(),
  }));

  const unplaced = [];
  doings.forEach((item) => {
    // Arrival day only takes light afternoon/evening plans.
    const eligible = days.filter(
      (d) => d.items.length < capacity(d.index) && !(d.index === 0 && dayCount > 1 && !ARRIVAL_SLOTS.has(item.slot)),
    );
    if (!eligible.length) return unplaced.push(item);
    const sameArea = eligible.find((d) => d.areas.has(item.area));
    const target = sameArea || eligible.sort((a, b) => a.items.length - b.items.length)[0];
    target.items.push(item);
    target.areas.add(item.area);
  });

  // Spread meals; one per day, matching the area when possible.
  meals.forEach((meal, i) => {
    const byArea = days.find((d) => d.areas.has(meal.area) && !d.items.some((x) => x.kind === "food"));
    (byArea || days[i % dayCount]).items.push(meal);
  });

  return {
    days: days.map((d) => {
      const items = schedule([...d.items].sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]));
      const mainArea = items.find((x) => x.kind !== "food")?.area;
      const title =
        d.index === 0
          ? "Arrive & settle in"
          : d.index === dayCount - 1
            ? "Last looks & head home"
            : DAY_THEMES[mainArea] || (mainArea ? `Around ${mainArea}` : "Free day to wander");
      return { index: d.index, date: d.date, title, items };
    }),
    unplaced,
  };
};

/* ---------------------------------------------------------------- budget -- */

export const computeBudget = ({ trip, days }) => {
  const tier = STAY_TIERS.find((t) => t.value === trip.stay) || STAY_TIERS[1];
  const travelers = trip.travelers;
  const rooms = Math.ceil(travelers / 2);
  const all = days.flatMap((d) => d.items);

  const stay = tier.perRoomNight * rooms * trip.nights;
  const food =
    tier.foodPerDay * travelers * days.length +
    all.filter((i) => i.kind === "food").reduce((s, i) => s + i.cost * travelers, 0) * 0.4;
  const experiences = all
    .filter((i) => i.kind === "activities")
    .reduce((s, i) => s + i.cost * travelers, 0);
  const entries = all.filter((i) => i.kind === "spots").reduce((s, i) => s + i.cost * travelers, 0);
  const transport = 12 * days.length * Math.max(1, rooms) + 18 * travelers; // taxis + bus from KTM
  const subtotal = stay + food + experiences + entries + transport;
  const buffer = subtotal * 0.08;
  const total = subtotal + buffer;

  const lines = [
    { key: "stay", label: "Stay", detail: `${trip.nights} nights · ${rooms} room${rooms > 1 ? "s" : ""} · ${tier.label}`, amount: stay, color: "bg-brand-600" },
    { key: "experiences", label: "Activities", detail: `${all.filter((i) => i.kind === "activities").length} booked experiences`, amount: experiences, color: "bg-sand-500" },
    { key: "food", label: "Food & drinks", detail: `${tier.label} dining, ${days.length} days`, amount: food, color: "bg-rose-500" },
    { key: "transport", label: "Getting around", detail: "Tourist bus + local taxis", amount: transport, color: "bg-ocean-600" },
    { key: "entries", label: "Entry fees", detail: "Temples, museum, boats", amount: entries, color: "bg-ink-500" },
    { key: "buffer", label: "Safety buffer", detail: "8% for tips & surprises", amount: buffer, color: "bg-ink-300" },
  ];

  return {
    lines,
    total,
    perPerson: total / travelers,
    perDay: total / days.length,
    target: trip.budgetPerPerson * travelers,
  };
};

/* --------------------------------------------------------------- packing -- */

export const buildPacking = ({ picks }) => {
  const ids = new Set(picks.map((p) => p.id));
  const adventure = picks.some((p) => (p.tags || []).includes("Adventure"));
  const hike = picks.some((p) => /hike|trek/i.test(p.type));
  const applies = (when) =>
    !when || ids.has(when) || (when === "adventure" && adventure) || (when === "hike" && hike);

  return PACKING_CATALOGUE.map((group) => ({
    ...group,
    items: group.items.filter((i) => applies(i.when)).map((i) => ({ ...i, smart: Boolean(i.when) })),
  }));
};

/* ----------------------------------------------------------------- facts -- */

export const getFacts = (destination) => {
  if (isPokhara(destination) || !destination) return POKHARA_FACTS;
  const own = [
    destination.local_languages?.length && {
      kind: "fact",
      text: `People in ${destination.name} speak ${destination.local_languages.join(", ")}. A hello in the local language goes a long way.`,
    },
    destination.currency && { kind: "stat", value: destination.currency, label: "Local currency", text: "Turtle prices everything in your currency, but carry some local cash." },
    destination.short_description && { kind: "fact", text: destination.short_description },
  ].filter(Boolean);
  return [...own, ...GENERIC_TIPS];
};
