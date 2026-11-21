import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Dot, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { setHeroInView } from "@/hooks/useHeroInView";

/** Dotted journey line with waypoints, sweeping behind the band. */
const RouteBackdrop = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1200 220"
    preserveAspectRatio="xMaxYMid slice"
    className="pointer-events-none absolute inset-0 h-full w-full text-brand-300 opacity-40"
  >
    <g
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      className="text-brand-100"
    >
      <circle cx="1100" cy="60" r="26" />
      <circle cx="1100" cy="60" r="46" />
    </g>

    <path
      d="M -30 150 C 120 160, 200 70, 360 86 C 520 102, 560 168, 720 150 C 880 132, 940 48, 1100 60 C 1160 65, 1210 48, 1260 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeDasharray="0.5 11"
    />

    <g fill="#ffffff" stroke="currentColor" strokeWidth="2.5">
      <circle cx="360" cy="86" r="6" />
      <circle cx="720" cy="150" r="6" />
    </g>
    <circle
      cx="1100"
      cy="60"
      r="7"
      fill="var(--color-sand-300)"
      stroke="var(--color-sand-600)"
      strokeWidth="2.5"
    />
  </svg>
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

/** Identity band: one quiet line of what tourtoise is, then the destinations
 *  below take over. Guests get the primary CTA here; signed-in users get the
 *  line only, so nothing competes with the grid. */
const JourneyHero = () => {
  const sectionRef = useRef(null);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { requireAuth } = useAuthGate();
  useReportHeroVisibility(sectionRef);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="journey-hero-title"
      className="relative w-full overflow-hidden border-b border-line-subtle bg-gradient-to-br from-brand-50 via-surface to-sand-50 px-2.5 py-4 sm:py-5 md:px-4"
    >
      <RouteBackdrop />

      <div className="relative mx-auto flex w-full max-w-page flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={12} className="text-brand-500" aria-hidden="true" />
            <Text size="xs" tone="subtle">
             Welcome to tourtoise
            </Text>
          </div>

          <Heading as="h1" level={3} id="journey-hero-title">
            Your personal AI travel companion
          </Heading>
          <Text size="sm" tone="subtle" className="mt-1 text-pretty flx">
            Understands your travel style
            <Dot />
            Makes smart planning
            <Dot />
            Guides through your tour
          </Text>
        </div>

        {!isAuthenticated && (
          <Button
            size="lg"
            className="shrink-0 self-start rounded-full sm:self-auto"
            onClick={() =>
              requireAuth(null, { reason: "plan", view: "register" })
            }
          >
            <Sparkles aria-hidden="true" />
            Let&apos;s Plan a Trip
          </Button>
        )}
      </div>
    </section>
  );
};

export default JourneyHero;
