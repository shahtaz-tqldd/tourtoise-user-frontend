import React from "react";
import { useSelector } from "react-redux";
import { Globe2, ImagePlus, Lock, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { useAuthGate } from "@/features/auth/auth-gate-context";
import { cn } from "@/lib/utils";
import AuthorAvatar from "./author-avatar";

const SCOPE_OPTIONS = [
  { value: "public", label: "Community", icon: Globe2 },
  { value: "mine", label: "My journal", icon: UserRound },
];

const JournalPageHeader = () => (
  <div>
    <Heading level={1}>Travel Journal</Heading>
    <Text tone="subtle" className="mt-1">
      Real stories, tips and photos from travelers on the road.
    </Text>
  </div>
);

/** Community / My journal. "My journal" asks guests to sign in. */
export const JournalScopeTabs = ({ value, onValueChange }) => {
  const { isAuthenticated } = useAuthGate();

  return (
    <div role="group" aria-label="Show journals" className="flex gap-2">
      {SCOPE_OPTIONS.map(({ value: option, label, icon: Icon }) => {
        const isActive = option === value;
        const isLocked = option === "mine" && !isAuthenticated;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onValueChange(option)}
            className={cn(
              "flx h-9 gap-1.5 rounded-full px-4 text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive
                ? "bg-ink-900 text-white"
                : "bg-surface text-body ring-1 ring-line hover:bg-surface-muted hover:text-heading",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
            {isLocked && <Lock className="size-3 text-faint" aria-label="Sign in required" />}
          </button>
        );
      })}
    </div>
  );
};

/** "What's on your mind" prompt for members; a join card for guests. */
export const JournalComposerPrompt = ({ onCreate }) => {
  const user = useSelector((state) => state.auth.user);
  const { isAuthenticated, openAuth } = useAuthGate();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-3 rounded-card bg-surface p-4 ring-1 ring-line-subtle sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:hidden">
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
    <div className="rounded-card bg-surface p-3 ring-1 ring-line-subtle sm:p-4">
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
