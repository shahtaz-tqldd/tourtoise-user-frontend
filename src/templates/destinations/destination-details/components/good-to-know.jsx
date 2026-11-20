import { BusFront, Stamp } from "lucide-react";

import { Heading } from "@/components/ui/typography";

/** Practical notes: getting around and visas. Hidden when there are none. */
const GoodToKnow = ({ destination }) => {
  const notes = [
    { title: "Getting around", icon: BusFront, body: destination.getting_around },
    { title: "Visa", icon: Stamp, body: destination.visa_notes },
  ].filter((note) => note.body);

  if (!notes.length) return null;

  return (
    <section aria-labelledby="good-to-know-title" className="space-y-4">
      <Heading level={3} as="h2" id="good-to-know-title">
        Good to know
      </Heading>
      <div className="divide-y divide-line-subtle rounded-card bg-surface ring-1 ring-line-subtle">
        {notes.map(({ title, icon: Icon, body }) => (
          <div key={title} className="flex gap-4 p-5">
            <span className="center size-10 shrink-0 rounded-full bg-accent text-brand-text">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-body-md font-bold text-heading">{title}</h3>
              <p className="mt-1 whitespace-pre-line text-body-sm text-body">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GoodToKnow;
