import { useState } from "react";

import ListingHeader from "@/components/shared/listing-header";
import PreviewDropdown from "@/components/shared/preview-dropdown";
import { UserAvatar } from "@/components/shared/user-profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Globe2, Plus, SlidersHorizontal, UserRound } from "lucide-react";

const journalScopeOptions = [
  { value: "public", label: "Public Journal", icon: Globe2 },
  { value: "mine", label: "My Journal", icon: UserRound },
];

const JournalPageHeader = ({ onCreate, journalScope, onJournalScopeChange }) => (
  <ListingHeader
    title="Travel Journal"
    filters={
      <div className="flex w-full items-center gap-2 md:justify-end">
        <CreateJournalTrigger onCreate={onCreate} />
        <JournalScopeFilter
          value={journalScope}
          onValueChange={onJournalScopeChange}
        />
      </div>
    }
  />
);

const JournalScopeFilter = ({ value, onValueChange }) => {
  const [open, setOpen] = useState(false);

  const selectScope = (scope) => {
    if (scope !== value) onValueChange(scope);
    setOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <PreviewDropdown
        open={open}
        onOpenChange={setOpen}
        title="Filter journals"
        description="Choose public journals or journals you created."
        desktopClassName="w-[min(calc(100vw-2rem),320px)]"
        trigger={
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-slate-200"
            aria-label="Filter journals"
          >
            <SlidersHorizontal size={16} />
          </Button>
        }
      >
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-base font-bold text-slate-950">
            Filter journals
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose which journals to show.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Journal type
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Journal type"
          >
            {journalScopeOptions.map((option) => {
              const OptionIcon = option.icon;

              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={value === option.value}
                  key={option.value}
                  onClick={() => selectScope(option.value)}
                  className={cn(
                    "flex w-fit cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    value === option.value
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-primary/10",
                  )}
                >
                  <OptionIcon size={15} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </PreviewDropdown>
    </div>
  );
};

const CreateJournalTrigger = ({ onCreate }) => (
  <button
    type="button"
    className="max-w-100 flex w-full cursor-pointer gap-2"
    onClick={onCreate}
  >
    <UserAvatar className="size-10" />
    <div className="flex w-full flex-1 items-center gap-2 rounded-full border bg-white px-4 py-3 text-slate-400">
      <Plus size={15} />
      <span className="text-sm whitespace-nowrap truncate">Write Your Travel Journal</span>
    </div>
  </button>
);
export default JournalPageHeader;
