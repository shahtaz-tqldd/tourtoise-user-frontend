import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { cn } from "@/lib/utils";

const STEPS = [
  "Tell Turtle your vibe, dates and budget",
  "Get a day-by-day plan with places and food",
  "Turtle guides you while you travel",
];

/** The one primary action on this page: plan a trip here with Turtle. */
const PlanCard = ({ destination, onPlan, className }) => {
  const { requireAuth, isAuthenticated } = useAuthGate();

  return (
    <section
      aria-labelledby="plan-card-title"
      className={cn("rounded-card bg-surface p-5 shadow-raised ring-1 ring-line-subtle", className)}
    >
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="" className="size-10 shrink-0 object-contain" decoding="async" />
        <div className="min-w-0">
          <h2 id="plan-card-title" className="font-display text-h4 text-heading">
            Plan {destination.name} with Turtle
          </h2>
          <p className="text-caption text-subtle">Your AI travel buddy</p>
        </div>
      </div>

      <ol className="mt-4 space-y-2.5">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-2.5 text-body-sm text-body">
            <span className="center mt-0.5 size-5 shrink-0 rounded-full bg-accent text-2xs font-bold text-brand-text">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <Button
        size="xl"
        className="mt-5 w-full rounded-full"
        onClick={() => requireAuth(onPlan, { reason: "plan" })}
      >
        <Sparkles aria-hidden="true" />
        {isAuthenticated ? "Plan this trip" : "Plan this trip free"}
      </Button>
    </section>
  );
};

export default PlanCard;
