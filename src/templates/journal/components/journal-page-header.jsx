import React from "react";
import { useSelector } from "react-redux";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { cn } from "@/lib/utils";
import AuthorAvatar from "./author-avatar";
import { JOURNAL_SCOPES } from "../journal-utils";

const JournalPageHeader = () => (
  <div>
    <Heading level={1}>Travel Journal</Heading>
    <Text tone="subtle" className="mt-1">
      Real stories, tips and photos from travelers on the road.
    </Text>
  </div>
);

/** Compact segmented control. Members only — guests just see the community. */
export const JournalScopeTabs = ({ value, onValueChange }) => (
  <div
    role="group"
    aria-label="Show posts"
    className="inline-flex w-fit rounded-full bg-surface p-1 ring-1 ring-line-subtle"
  >
    {JOURNAL_SCOPES.map(({ value: option, label }) => {
      const isActive = option === value;
      return (
        <button
          key={option}
          type="button"
          aria-pressed={isActive}
          onClick={() => onValueChange(option)}
          className={cn(
            "h-7 rounded-full px-3 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive ? "bg-ink-900 text-white" : "text-body hover:text-heading",
          )}
        >
          {label}
        </button>
      );
    })}
  </div>
);

/** "What's on your mind" prompt for members; a join card for guests. */
export const JournalComposerPrompt = ({ onCreate, className }) => {
  const user = useSelector((state) => state.auth.user);
  const { isAuthenticated, openAuth } = useAuthGate();

  if (!isAuthenticated) {
    return (
      <div className={cn("flex flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-line-subtle sm:flex-row sm:items-center sm:justify-between sm:p-5", className)}>
        <div>
          <p className="font-display text-h4 text-heading">Been somewhere good?</p>
          <p className="text-body-sm text-subtle">
            Sign in to share your trip, like posts and join the conversation.
          </p>
        </div>
        <Button
          variant="soft"
          className="shrink-0 rounded-full"
          onClick={() => openAuth("register", "journal")}
        >
          Join free
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-card bg-surface p-3 ring-1 ring-line-subtle sm:p-4", className)}>
      <div className="flex items-center gap-3">
        <AuthorAvatar src={user?.avatar_url} name={user?.name} />
        <button
          type="button"
          onClick={onCreate}
          className="h-11 min-w-0 flex-1 truncate rounded-full bg-surface-muted px-4 text-left text-body-sm text-subtle transition hover:bg-ink-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Share a moment from your trip…
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="center size-11 shrink-0 rounded-full text-brand-text transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Add photos to a new post"
        >
          <ImagePlus className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default JournalPageHeader;
