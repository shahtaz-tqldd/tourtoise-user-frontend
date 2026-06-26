import React from "react";

import { Button } from "@/components/ui/button";

export const SessionListSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((item) => (
      <div key={item} className="flex gap-3 rounded-xl p-3">
        <div className="size-9 animate-pulse rounded-lg bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

export const MessageListSkeleton = () => (
  <div className="space-y-5">
    <div className="h-20 w-3/4 animate-pulse rounded-xl bg-slate-100" />
    <div className="ml-auto h-16 w-2/3 animate-pulse rounded-xl bg-slate-200" />
    <div className="h-24 w-4/5 animate-pulse rounded-xl bg-slate-100" />
  </div>
);

export const SessionErrorState = ({ onRetry }) => (
  <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center">
    <h3 className="text-sm font-bold text-red-950">Could not load sessions</h3>
    <p className="mt-1 text-sm leading-6 text-red-700">
      Check your connection and try again.
    </p>
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onRetry}
      className="mt-4"
    >
      Retry
    </Button>
  </div>
);

export const MessageErrorState = ({ onRetry }) => (
  <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-white p-8 text-center">
    <h3 className="text-lg font-bold text-red-950">Could not load messages</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-red-700">
      The selected chat failed to load.
    </p>
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onRetry}
      className="mt-4"
    >
      Retry
    </Button>
  </div>
);
