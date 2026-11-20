import React from "react";
import Link from "next/link";
import { Bookmark, PenLine, Sparkles, Share2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { JournalComposerPrompt } from "./journal-page-header";

const GUEST_PERKS = [
  { icon: PenLine, text: "Share your travel stories and photos with the community" },
  { icon: UserRound, text: "Engage with tourists on their travel stories" },
  { icon: Bookmark, text: "Save posts for your next trip" },
];

/** Desktop side panel: the composer for members, a join card for guests. */
const JournalSidebar = ({ onCreate }) => {
  const { isAuthenticated, openAuth } = useAuthGate();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[92px] space-y-4">
        {isAuthenticated ? (
          <JournalComposerPrompt onCreate={onCreate} />
        ) : (
          <section aria-labelledby="journal-join-title" className="rounded-card bg-surface p-6 ring-1 ring-line-subtle">
            <h2 id="journal-join-title" className="font-display text-h4 text-heading">
              Join the travel community
            </h2>
            <ul role="list" className="mt-3 space-y-2.5">
              {GUEST_PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-2.5 text-body-sm text-body">
                  <Icon className="mt-1 size-3.5 shrink-0 text-brand-text" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-2">
              <Button variant="soft" className="rounded-full" onClick={() => openAuth("register", "journal")}>
                Create free account
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={() => openAuth("login", "journal")}>
                Sign in
              </Button>
            </div>
          </section>
        )}

        <Link
          href="/"
          className="group flex items-start gap-3 rounded-card bg-accent p-4 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="center size-9 shrink-0 rounded-full bg-surface text-brand-text">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-body-sm font-semibold text-heading">Inspired? Plan your own</span>
            <span className="block text-caption text-body">
              Pick a destination and Turtle builds the trip.
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default JournalSidebar;
