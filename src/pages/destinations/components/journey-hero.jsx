import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Compass, Navigation, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Display, Text } from "@/components/ui/typography";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { setHeroInView } from "@/hooks/useHeroInView";

const STEPS = [
  { icon: Compass, title: "Find your vibe", text: "Your pace, tastes and style" },
  { icon: Sparkles, title: "Get an AI plan", text: "Day by day, built around you" },
  { icon: Navigation, title: "Travel with a guide", text: "Live nudges and re-plans" },
];

/** Lightweight underline accent for a word in the headline. */
const Underline = ({ children }) => (
  <span className="relative inline-block">
    {children}
    <svg
      aria-hidden="true"
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      className="absolute -bottom-1 left-0 h-2 w-full text-sand-400"
    >
      <path
        d="M2 8 Q 13 2 25 7 T 49 7 T 73 7 T 97 7 T 118 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

/** Reports whether the hero is on screen so the header can hide its CTA. */
const useReportHeroVisibility = (ref) => {
  useLayoutEffect(() => {
    setHeroInView(true);
    return () => setHeroInView(false);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      // Ignore the part hidden behind the sticky header.
      { rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
};

/** Compact intro band: the destinations below are the main event. */
const JourneyHero = ({ exploreId = "explore" }) => {
  const sectionRef = useRef(null);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { requireAuth } = useAuthGate();
  useReportHeroVisibility(sectionRef);

  const scrollToExplore = () =>
    document
      .getElementById(exploreId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="journey-hero-title"
      className="rounded-sheet bg-surface px-5 py-6 ring-1 ring-line-subtle sm:px-8 xl:px-10"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <Display id="journey-hero-title" size="md" className="text-balance">
            Tell Turtle{" "}
            <span className="whitespace-nowrap">
              <Underline>your vibe</Underline>.
            </span>{" "}
            Pack your bags.
          </Display>
          <Text tone="subtle" className="mt-2 max-w-xl">
            Turtle learns how you travel, plans your trip with AI, and guides
            you on the road.
          </Text>

          <Button
            size="lg"
            className="mt-4 rounded-full"
            onClick={() =>
              isAuthenticated
                ? scrollToExplore()
                : requireAuth(null, { reason: "plan", view: "register" })
            }
          >
            <Sparkles aria-hidden="true" />
            {isAuthenticated ? "Find a place to plan" : "Plan a trip free"}
          </Button>
        </div>

        <ol
          aria-label="How Turtle works"
          className="hidden shrink-0 gap-3 rounded-card bg-accent p-4 lg:grid"
        >
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="center size-9 shrink-0 rounded-full bg-surface text-brand-text ring-1 ring-brand-100">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-body-sm font-semibold text-heading">{title}</span>
                <span className="block text-caption text-subtle">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default JourneyHero;
