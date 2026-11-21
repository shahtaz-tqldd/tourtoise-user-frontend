import { useEffect, useState } from "react";
import { Lightbulb, Sparkles, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const FACT_MS = 5200;

/** Rotating "Did you know?" card shown while a section is being written. */
const FactCard = ({ facts, destinationName, className }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (facts.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % facts.length), FACT_MS);
    return () => clearInterval(id);
  }, [facts.length]);

  const fact = facts[index];
  if (!fact) return null;
  const heading = { stat: "By the numbers", tip: "Turtle's tip", fact: "Did you know?" }[fact.kind];
  const Icon = { stat: TrendingUp, tip: Lightbulb, fact: Sparkles }[fact.kind];

  return (
    <figure className={cn("rounded-card bg-sand-50 p-4 ring-1 ring-sand-200", className)}>
      <figcaption className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-caption font-bold text-sand-700">
          <Icon className="size-3.5" aria-hidden="true" />
          {heading}
        </span>
        <span className="text-2xs text-faint">
          {destinationName} · {index + 1}/{facts.length}
        </span>
      </figcaption>

      <div key={index} className="pl-rise mt-2 min-h-14">
        {fact.kind === "stat" && (
          <p className="text-h4 font-bold text-heading">
            {fact.value}
            <span className="ml-2 text-caption font-semibold text-subtle">{fact.label}</span>
          </p>
        )}
        <p className="text-body-sm text-body">{fact.text}</p>
      </div>

      <div className="mt-3 flex gap-1" aria-hidden="true">
        {facts.map((_, i) => (
          <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-sand-200">
            {i < index && <span className="block h-full bg-sand-400" />}
            {i === index && (
              <span key={`t-${index}`} className="pl-timer block h-full bg-sand-500" style={{ "--pl-duration": `${FACT_MS}ms` }} />
            )}
          </span>
        ))}
      </div>
    </figure>
  );
};

export default FactCard;
