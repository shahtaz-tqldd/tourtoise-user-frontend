"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FX, PACE_OPTIONS, STAY_TIERS, TRIP_TYPES } from "./mock/mock-data";
import { interpretRequest, runAgentTask } from "./mock/mock-agent";
import {
  KIND_KEYS,
  addDays,
  buildItinerary,
  buildPacking,
  computeBudget,
  formatMoney,
  formatRange,
  getCatalogue,
  rankCandidates,
} from "./planner-engine";

export const STAGES = [
  { key: "setup", label: "Setup" },
  { key: "discover", label: "Picks" },
  { key: "itinerary", label: "Days" },
  { key: "budget", label: "Budget" },
  { key: "pack", label: "Pack" },
];

const stageIndex = (key) => STAGES.findIndex((s) => s.key === key);
const labelOf = (list, value) => list.find((o) => o.value === value)?.label || value;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const initialTrip = (profile, destination) => ({
  type: "solo",
  travelers: 1,
  startDate: addDays(startOfToday(), 21),
  nights: Math.min(Math.max(Number(destination?.min_stay_days) || 3, 2), 6),
  pace: profile.travel_pace || "moderate",
  interests: profile.travel_interests || [],
  dietary: profile.dietary_preferences || [],
  mobility: profile.mobility_constraints || [],
  stay: "comfort",
  budgetPerPerson: 350,
  currency: profile.preferred_currency || "USD",
});

/** Everything the planner page needs: state, derived data and actions. */
export default function usePlanner({ destination, profile }) {
  const [stage, setStage] = useState("setup");
  const [furthest, setFurthest] = useState(0);
  const [trip, setTrip] = useState(() => initialTrip(profile, destination));
  const [decisions, setDecisions] = useState({});
  const [plan, setPlan] = useState(null);
  const [finalized, setFinalized] = useState(false);
  const [packing, setPacking] = useState(null);
  const [checked, setChecked] = useState(() => new Set());
  const [task, setTask] = useState(null); // full-screen "agent working" state
  const [messages, setMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(null); // inline agent steps for chat
  const [completed, setCompleted] = useState(false);
  const cancelRef = useRef(null);
  const doneRef = useRef(null);
  const hydrated = useRef(false);

  // Profile arrives after first render; adopt it once, before the user edits.
  useEffect(() => {
    if (hydrated.current || !profile?.loaded) return;
    hydrated.current = true;
    setTrip((t) => ({ ...initialTrip(profile, destination), startDate: t.startDate }));
  }, [profile, destination]);

  useEffect(() => () => cancelRef.current?.(), []);

  const catalogue = useMemo(() => getCatalogue(destination), [destination]);
  const ranked = useMemo(() => rankCandidates(catalogue, trip), [catalogue, trip]);
  const allItems = useMemo(() => KIND_KEYS.flatMap((k) => ranked[k]), [ranked]);

  const picksFrom = useCallback(
    (decs) =>
      allItems
        .filter((i) => decs[i.id] === "keep" || decs[i.id] === "love")
        .map((i) => ({ ...i, love: decs[i.id] === "love" })),
    [allItems],
  );
  const picks = useMemo(() => picksFrom(decisions), [picksFrom, decisions]);

  const budget = useMemo(() => (plan ? computeBudget({ trip, days: plan.days }) : null), [plan, trip]);

  const tripLabels = useMemo(
    () => ({
      typeLabel: labelOf(TRIP_TYPES, trip.type),
      paceLabel: labelOf(PACE_OPTIONS, trip.pace),
      stayLabel: labelOf(STAY_TIERS, trip.stay),
      dateLabel: formatRange(trip.startDate, trip.nights),
    }),
    [trip],
  );

  const money = useCallback((usd, opts) => formatMoney(usd, trip.currency, opts), [trip.currency]);

  const goTo = useCallback((key) => {
    setStage(key);
    setFurthest((f) => Math.max(f, stageIndex(key)));
  }, []);

  /** Runs a full-screen agent task, then `onDone`. */
  const runTask = useCallback(
    (kind, title, onDone, found = []) => {
      cancelRef.current?.();
      setTask({ kind, title, steps: [], found: [] });
      doneRef.current = () => {
        doneRef.current = null;
        onDone();
        setTask(null);
      };
      cancelRef.current = runAgentTask(
        kind,
        { destination: destination?.name || "your destination", trip: { ...trip, ...tripLabels } },
        (ev) => {
          if (ev.type === "step")
            setTask((t) => t && { ...t, steps: [...t.steps, { id: ev.id, text: ev.text, done: false }] });
          if (ev.type === "step_done")
            setTask((t) => t && { ...t, steps: t.steps.map((s) => (s.id === ev.id ? { ...s, done: true } : s)) });
          if (ev.type === "found") setTask((t) => t && { ...t, found: [...t.found, ev.item] });
          if (ev.type === "done") doneRef.current?.();
        },
        { found },
      );
    },
    [destination, trip, tripLabels],
  );

  /** Demo helper: finish the running task immediately. */
  const skipTask = () => {
    cancelRef.current?.();
    doneRef.current?.();
  };

  /* ------------------------------------------------------- stage actions -- */

  const startDiscover = () =>
    runTask("recommend", `Finding the best of ${destination?.name || "your destination"}`, () => goTo("discover"), allItems.slice(0, 14));

  const startItinerary = () =>
    runTask("itinerary", "Designing your days", () => {
      setPlan(buildItinerary({ trip, picks }));
      setFinalized(false);
      goTo("itinerary");
    });

  const startBudget = () => runTask("budget", "Pricing your plan", () => goTo("budget"));

  const startPacking = () => {
    setFinalized(true);
    runTask("packing", "Packing your bag", () => {
      setPacking(buildPacking({ picks }));
      goTo("pack");
    });
  };

  /* -------------------------------------------------------- pick actions -- */

  const decide = (id, value) => setDecisions((d) => ({ ...d, [id]: value }));

  const autoPick = (kind) =>
    setDecisions((d) => {
      const next = { ...d };
      ranked[kind].forEach((i) => {
        if (!next[i.id]) next[i.id] = i.match >= 75 && !i.warning ? "keep" : "skip";
      });
      return next;
    });

  /* ---------------------------------------------------- itinerary edits -- */

  const moveItem = (itemId, toDay) =>
    setPlan((p) => {
      const item = p.days.flatMap((d) => d.items).find((i) => i.id === itemId) || p.unplaced.find((i) => i.id === itemId);
      if (!item) return p;
      return {
        unplaced: p.unplaced.filter((i) => i.id !== itemId),
        days: p.days.map((d) => ({
          ...d,
          items:
            d.index === toDay
              ? [...d.items.filter((i) => i.id !== itemId), { ...item, time: item.time || "Flexible" }]
              : d.items.filter((i) => i.id !== itemId),
        })),
      };
    });

  const removeItem = (itemId) => {
    decide(itemId, "skip");
    setPlan((p) => ({
      unplaced: p.unplaced.filter((i) => i.id !== itemId),
      days: p.days.map((d) => ({ ...d, items: d.items.filter((i) => i.id !== itemId) })),
    }));
  };

  const addDay = () => {
    const nextTrip = { ...trip, nights: trip.nights + 1 };
    setTrip(nextTrip);
    setPlan(buildItinerary({ trip: nextTrip, picks }));
  };

  const updateTrip = (patch) => setTrip((t) => ({ ...t, ...patch }));

  /** Trip change that also re-flows the itinerary (pace, length). */
  const replan = (patch) => {
    const nextTrip = { ...trip, ...patch };
    setTrip(nextTrip);
    if (plan) setPlan(buildItinerary({ trip: nextTrip, picks }));
  };

  const toggleChecked = (id) =>
    setChecked((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* ------------------------------------------------------- agent chat -- */

  /** Applies an intent to a draft and returns { trip, decisions, changes }. */
  const applyIntent = (intent) => {
    let draftTrip = { ...trip };
    let draftDec = { ...decisions };
    const changes = [];
    const evaluate = () => {
      const p = buildItinerary({ trip: draftTrip, picks: picksFrom(draftDec) });
      return { p, b: computeBudget({ trip: draftTrip, days: p.days }) };
    };

    switch (intent.type) {
      case "pace": {
        draftTrip.pace = intent.value;
        changes.push({ tone: "info", text: `Pace set to ${labelOf(PACE_OPTIONS, intent.value)} for this trip` });
        break;
      }
      case "stay": {
        draftTrip.stay = intent.value;
        changes.push({ tone: "info", text: `Stay switched to ${labelOf(STAY_TIERS, intent.value)}` });
        break;
      }
      case "nights": {
        draftTrip.nights = Math.max(1, draftTrip.nights + intent.delta);
        changes.push({ tone: intent.delta > 0 ? "add" : "remove", text: `Trip is now ${draftTrip.nights + 1} days` });
        break;
      }
      case "remove": {
        draftDec[intent.item.id] = "skip";
        changes.push({ tone: "remove", text: `Removed ${intent.item.name}` });
        break;
      }
      case "add": {
        draftDec[intent.item.id] = "keep";
        changes.push({ tone: "add", text: `Added ${intent.item.name}` });
        break;
      }
      case "love": {
        draftDec[intent.item.id] = "love";
        changes.push({ tone: "add", text: `${intent.item.name} marked must-do — it gets the best slot` });
        break;
      }
      case "cheaper": {
        const rate = FX[draftTrip.currency] || 1;
        if (intent.target) {
          draftTrip.budgetPerPerson = intent.target / rate;
          changes.push({ tone: "info", text: `Budget set to ${formatMoney(draftTrip.budgetPerPerson, draftTrip.currency)} per person` });
        }
        const target = intent.target ? draftTrip.budgetPerPerson : evaluate().b.perPerson * 0.8;
        const tiers = STAY_TIERS.map((s) => s.value);
        for (let guard = 0; guard < 10 && evaluate().b.perPerson > target; guard += 1) {
          const tierIdx = tiers.indexOf(draftTrip.stay);
          if (tierIdx > 0) {
            draftTrip.stay = tiers[tierIdx - 1];
            changes.push({ tone: "swap", text: `Stay downgraded to ${labelOf(STAY_TIERS, draftTrip.stay)}` });
            continue;
          }
          const priciest = picksFrom(draftDec)
            .filter((i) => i.kind === "activities")
            .sort((a, b) => (a.love ? 1 : 0) - (b.love ? 1 : 0) || b.cost - a.cost)[0];
          if (!priciest || priciest.cost < 15) break;
          draftDec[priciest.id] = "skip";
          changes.push({
            tone: "remove",
            text: `Dropped ${priciest.name} (−${formatMoney(priciest.cost, draftTrip.currency)} pp)`,
          });
        }
        if (!intent.target) draftTrip.budgetPerPerson = Math.min(draftTrip.budgetPerPerson, Math.ceil(target));
        break;
      }
      default:
        break;
    }

    const before = plan ? computeBudget({ trip, days: plan.days }).perPerson : null;
    const { p, b } = evaluate();
    if (plan && before !== null && Math.abs(before - b.perPerson) > 1) {
      changes.push({
        tone: b.perPerson < before ? "save" : "info",
        text: `Now ${formatMoney(b.perPerson, draftTrip.currency)} per person (${b.perPerson < before ? "−" : "+"}${formatMoney(Math.abs(before - b.perPerson), draftTrip.currency)})`,
      });
    }
    return { draftTrip, draftDec, newPlan: p, changes };
  };

  const REPLIES = {
    pace: "Done — I re-balanced your days.",
    stay: "Updated where you'll sleep.",
    nights: "Changed the trip length and re-spread your days.",
    remove: "Gone. I filled the gap so the day still flows.",
    add: "Added it and found it a good slot.",
    love: "Noted as a must-do.",
    cheaper: "Here's how I trimmed it without losing the highlights:",
  };

  const STEP_TEXT = {
    pace: ["Re-reading your days", "Moving things to keep it comfortable"],
    stay: ["Comparing stays nearby", "Updating the budget"],
    nights: ["Re-spreading your days", "Checking the new dates"],
    remove: ["Taking it out", "Re-flowing the day"],
    add: ["Finding the best slot", "Checking travel time"],
    love: ["Prioritising it"],
    cheaper: ["Looking for savings", "Swapping pricier picks", "Re-checking the total"],
  };

  const ask = (text) => {
    const clean = text.trim();
    if (!clean || chatBusy) return;
    setMessages((m) => [...m, { role: "user", text: clean, id: Date.now() }]);

    const intent = interpretRequest(clean, {
      allItems,
      pickedIds: new Set(picks.map((p) => p.id)),
    });

    if (intent.type === "goto") {
      setMessages((m) => [
        ...m,
        budget
          ? { role: "agent", text: "Let's pack! Writing your bag list…", id: Date.now() + 1 }
          : { role: "agent", text: "Let's lock the plan first — finalize the budget and I'll pack for you.", id: Date.now() + 1 },
      ]);
      if (budget) startPacking();
      return;
    }

    if (intent.type === "unknown") {
      setChatBusy({ steps: [{ id: "think", text: "Thinking…", done: false }] });
      setTimeout(() => {
        setChatBusy(null);
        setMessages((m) => [
          ...m,
          {
            role: "agent",
            id: Date.now(),
            text: "I'll keep that in mind. (Demo: try “make it cheaper”, “more relaxed”, “add paragliding”, “remove the zipline” or “add a day”.)",
          },
        ]);
      }, 1100);
      return;
    }

    const steps = (STEP_TEXT[intent.type] || ["Working on it"]).map((t, i) => ({ id: `s${i}`, text: t }));
    setChatBusy({ steps: [] });
    runAgentTask(
      "adjust",
      { steps },
      (ev) => {
        if (ev.type === "step") setChatBusy((c) => ({ steps: [...(c?.steps || []), { id: ev.id, text: ev.text, done: false }] }));
        if (ev.type === "step_done")
          setChatBusy((c) => ({ steps: (c?.steps || []).map((s) => (s.id === ev.id ? { ...s, done: true } : s)) }));
        if (ev.type === "done") {
          const { draftTrip, draftDec, newPlan, changes } = applyIntent(intent);
          setTrip(draftTrip);
          setDecisions(draftDec);
          if (plan) setPlan(newPlan);
          setChatBusy(null);
          setMessages((m) => [...m, { role: "agent", text: REPLIES[intent.type], changes, id: Date.now() }]);
        }
      },
      { speed: 1.6 },
    );
  };

  return {
    stage,
    furthest,
    stageIndex: stageIndex(stage),
    goTo,
    trip,
    tripLabels,
    updateTrip,
    replan,
    money,
    ranked,
    decisions,
    decide,
    autoPick,
    picks,
    plan,
    moveItem,
    removeItem,
    addDay,
    budget,
    finalized,
    setFinalized,
    packing,
    checked,
    toggleChecked,
    task,
    skipTask,
    completed,
    setCompleted,
    messages,
    chatBusy,
    ask,
    startDiscover,
    startItinerary,
    startBudget,
    startPacking,
  };
}
