import { Check, FastForward, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { AgentAvatar, TypingDots } from "./planner-ui";

/** Live checklist of what the agent is doing right now. */
export const StepLog = ({ steps, compact = false }) => (
  <ol className={cn(compact ? "space-y-1.5" : "space-y-2")} aria-live="polite">
    {steps.map((step) => (
      <li key={step.id} className="pl-rise flex items-start gap-2">
        <span
          className={cn(
            "center mt-0.5 shrink-0 rounded-full transition-colors",
            compact ? "size-4" : "size-5",
            step.done ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600",
          )}
        >
          {step.done ? (
            <Check className={compact ? "size-2.5" : "size-3"} strokeWidth={3} aria-hidden="true" />
          ) : (
            <Loader2 className={cn("animate-spin", compact ? "size-2.5" : "size-3")} strokeWidth={3} aria-hidden="true" />
          )}
        </span>
        <span className={cn(compact ? "text-2xs" : "text-caption", step.done ? "text-subtle" : "font-semibold text-heading")}>
          {step.text}
        </span>
      </li>
    ))}
  </ol>
);

/** Right-panel state while a task runs: what Turtle is doing, step by step. */
const AgentVeil = ({ task, onSkip }) => (
  <section aria-busy="true" className="pl-rise rounded-card bg-surface p-4 ring-1 ring-brand-200">
    <div className="flex items-start gap-3">
      <AgentAvatar thinking />
      <div className="min-w-0 flex-1">
        <p className="text-2xs font-semibold text-brand-text">Turtle is working</p>
        <h3 className="flex items-center gap-1.5 text-body-sm font-bold text-heading">
          {task.title}
          <TypingDots className="text-brand-500" />
        </h3>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-2xs font-semibold text-subtle ring-1 ring-line hover:text-heading"
      >
        <FastForward className="size-3" aria-hidden="true" />
        Skip
      </button>
    </div>
    <div className="mt-4">
      <StepLog steps={task.steps} />
    </div>
    <p className="mt-4 text-2xs text-faint">Watch the plan on the left — sections fill in as Turtle finishes them.</p>
  </section>
);

export default AgentVeil;
