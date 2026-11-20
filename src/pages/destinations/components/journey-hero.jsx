import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { setHeroInView } from "@/hooks/useHeroInView";

const Dot = () => (
  <span aria-hidden="true" className="px-1 text-faint">
    ·
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

/** Identity band: one quiet line of what tourtoise is, then the destinations
 *  below take over. Guests get the primary CTA here; signed-in users get the
 *  mark and the line only, so nothing competes with the grid. */
const JourneyHero = () => {
  const sectionRef = useRef(null);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { requireAuth } = useAuthGate();
  useReportHeroVisibility(sectionRef);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="journey-hero-title"
      className="rounded-sheet bg-surface px-5 py-4 ring-1 ring-line-subtle sm:px-8 sm:py-5 xl:px-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <img
            src="/logo.png"
            alt=""
            className="size-10 shrink-0 object-contain"
            decoding="async"
          />
          <div className="min-w-0">
            <Heading as="h1" level={3} id="journey-hero-title">
              Your personal travel buddy
            </Heading>
            <Text size="sm" tone="subtle" className="mt-0.5 text-pretty">
              Knows your taste
              <Dot />
              plans your trip
              <Dot />
              travels with you
            </Text>
          </div>
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
            Plan a trip free
          </Button>
        )}
      </div>
    </section>
  );
};

export default JourneyHero;
