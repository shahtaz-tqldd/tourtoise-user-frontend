import { useState } from "react";
import { Check } from "lucide-react";

import { Heading } from "@/components/ui/typography";

const LONG_DESCRIPTION = 360;

/** What the place feels like, and why people pick it. */
const About = ({ destination }) => {
  const [expanded, setExpanded] = useState(false);
  const description = destination.description || "";
  const reasons = destination.picking_reasons || [];
  const isLong = description.length > LONG_DESCRIPTION;

  if (!description && !reasons.length) return null;

  return (
    <section aria-labelledby="about-title" className="space-y-5">
      <Heading level={3} as="h2" id="about-title">
        About {destination.name}
      </Heading>

      {description && (
        <div>
          <p
            className={`max-w-prose whitespace-pre-line text-body-md text-body ${
              isLong && !expanded ? "line-clamp-4" : ""
            }`}
          >
            {description}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="mt-1.5 rounded text-body-sm font-semibold text-heading underline underline-offset-4 hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {reasons.length > 0 && (
        <div className="rounded-card bg-accent p-5">
          <h3 className="text-body-sm font-bold text-heading">Why travelers pick it</h3>
          <ul className="mt-3 grid gap-x-6 gap-y-2.5 md:grid-cols-2">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-2 text-body-sm text-body">
                <span className="center mt-1 size-3.5 shrink-0 rounded-full bg-primary text-white">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default About;
