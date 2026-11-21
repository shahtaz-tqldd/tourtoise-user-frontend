/**
 * DEMO AGENT — fakes what the socket will do later.
 *
 * Proposed event contract (server → client), one task per user action:
 *   { type: "step",  id, text }              // the agent started a sub-step
 *   { type: "step_done", id }                 // …and finished it
 *   { type: "found", item }                   // a candidate surfaced (streamed)
 *   { type: "done" }                          // task finished; result follows
 *
 * The UI only renders these events, so swapping this file for a real socket
 * keeps every animation intact.
 */

const SCRIPTS = {
  recommend: ({ destination, trip }) => [
    { id: "profile", text: `Reading your travel style — ${trip.paceLabel.toLowerCase()} pace, ${trip.interests.slice(0, 2).join(" & ") || "open to anything"}` },
    { id: "scan", text: `Scanning ${destination} for spots, activities and food`, found: true },
    { id: "weather", text: `Checking season & weather for ${trip.dateLabel}` },
    { id: "match", text: `Matching picks for a ${trip.typeLabel.toLowerCase()} trip` },
    { id: "rank", text: "Ranking by what you'll love most" },
  ],
  itinerary: ({ trip }) => [
    { id: "cluster", text: "Grouping places that are close to each other" },
    { id: "sunrise", text: "Finding the best light & opening hours" },
    { id: "pace", text: `Pacing ${trip.nights + 1} days for a ${trip.paceLabel.toLowerCase()} rhythm` },
    { id: "meals", text: "Slotting food near where you'll be" },
    { id: "polish", text: "Adding travel times between stops" },
  ],
  budget: ({ trip }) => [
    { id: "stay", text: `Pricing ${trip.stayLabel.toLowerCase()} stays for ${trip.nights} nights` },
    { id: "tickets", text: "Adding up tickets & activity fees" },
    { id: "transport", text: "Estimating buses and taxis" },
    { id: "compare", text: "Comparing with your budget" },
  ],
  packing: ({ destination }) => [
    { id: "weather", text: `Looking at ${destination}'s forecast` },
    { id: "activities", text: "Checking what your activities need" },
    { id: "docs", text: "Listing documents & permits" },
    { id: "list", text: "Building your bag" },
  ],
  adjust: ({ steps }) => steps,
};

/**
 * Starts a fake task. `onEvent` receives the events above; returns a cancel fn.
 * `found` items (if given) are drip-fed during the "found" step.
 */
export const runAgentTask = (task, ctx, onEvent, { found = [], speed = 1 } = {}) => {
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms / speed));
  const steps = SCRIPTS[task](ctx);

  let t = 250;
  steps.forEach((step) => {
    at(t, () => onEvent({ type: "step", id: step.id, text: step.text }));
    let length = 900 + (step.text.length % 5) * 120;
    if (step.found) {
      found.forEach((item, i) => at(t + 300 + i * 170, () => onEvent({ type: "found", item })));
      length = Math.max(length, 400 + found.length * 170);
    }
    t += length;
    at(t, () => onEvent({ type: "step_done", id: step.id }));
    t += 120;
  });
  at(t + 350, () => onEvent({ type: "done" }));

  return () => timers.forEach(clearTimeout);
};

/* --------------------------------------------------------------------------
   Natural-language adjustments → intents. The real agent replaces this.
   -------------------------------------------------------------------------- */

const words = (s) => s.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);

const findMentioned = (text, items) => {
  const t = text.toLowerCase();
  return items.find((item) =>
    [...words(item.name), ...words(item.type)].some(
      (w) => !["lake", "lakeside", "with", "from", "tour", "around", "fresh"].includes(w) && t.includes(w),
    ),
  );
};

/** Returns an intent the planner knows how to apply. */
export const interpretRequest = (text, { allItems, pickedIds }) => {
  const t = text.toLowerCase();
  const amount = t.match(/(\d[\d,]*)/)?.[1]?.replace(/,/g, "");
  const mentioned = findMentioned(t, allItems);

  if (/(pack|packing).*(bag|list)|what (should|do) i (bring|pack)/.test(t)) return { type: "goto", stage: "pack" };
  if (/(remove|skip|drop|no more|don'?t want|without|cancel)/.test(t) && mentioned)
    return { type: "remove", item: mentioned };
  if (/(cheap|budget|afford|reduce|lower|save|expensive|less money|under|cut)/.test(t))
    return { type: "cheaper", target: amount ? Number(amount) : null };
  if (/(relax|slow|chill|easy|lazy|less rush|rest)/.test(t)) return { type: "pace", value: "slow" };
  if (/(packed|busier|more things|fast|maximi|see more)/.test(t)) return { type: "pace", value: "fast" };
  if (/(luxur|premium|splurge|fancy|treat)/.test(t)) return { type: "stay", value: "premium" };
  if (/(hostel|guesthouse|basic stay)/.test(t)) return { type: "stay", value: "budget" };
  if (/(extra day|one more day|add a day|longer)/.test(t)) return { type: "nights", delta: 1 };
  if (/(shorter|one less day|remove a day)/.test(t)) return { type: "nights", delta: -1 };
  if (mentioned && !pickedIds.has(mentioned.id)) return { type: "add", item: mentioned };
  if (mentioned) return { type: "love", item: mentioned };
  return { type: "unknown" };
};
