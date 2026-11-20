import React from "react";
import { BellRing, CalendarClock, Shuffle } from "lucide-react";

import { Heading } from "@/components/ui/typography";

const ITEMS = [
  { icon: CalendarClock, title: "Live day plan", text: "Know what's now and what's next." },
  { icon: BellRing, title: "Timely heads-ups", text: "Leave-now reminders, weather changes." },
  { icon: Shuffle, title: "Re-plan on the go", text: "Running late? Turtle reshuffles your day." },
];

const CompanionStrip = () => (
  <section
    aria-labelledby="companion-title"
    className="rounded-sheet bg-surface px-5 py-7 ring-1 ring-line-subtle md:px-10 md:py-8"
  >
    <Heading level={2} id="companion-title">
      Turtle travels with you
    </Heading>
    <ul role="list" className="mt-5 grid gap-5 md:grid-cols-3 md:gap-8">
      {ITEMS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3.5">
          <span className="center size-10 shrink-0 rounded-xl bg-accent text-brand-text">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-h4 text-heading">{title}</h3>
            <p className="mt-0.5 text-body-sm text-subtle">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default CompanionStrip;
