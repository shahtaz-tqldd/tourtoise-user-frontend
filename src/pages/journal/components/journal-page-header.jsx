import { useState } from "react";

import ListingHeader from "@/components/shared/listing-header";
import PreviewDropdown from "@/components/shared/preview-dropdown";
import { UserAvatar } from "@/components/shared/user-profile";
import { cn } from "@/lib/utils";
import { Globe2, Plus, UserRound } from "lucide-react";

const journalScopeOptions = [
  { value: "public", label: "Public Journal", icon: Globe2 },
  { value: "mine", label: "My Journal", icon: UserRound },
];

const JournalPageHeader = ({ onCreate }) => (
  <ListingHeader
    title="Travel Journal"
    filters={
      <div className="flex w-full items-center gap-2 md:justify-end">
        <CreateJournalTrigger onCreate={onCreate} />
      </div>
    }
  />
);

export const JournalScopeFilter = ({ value, onValueChange }) => {
  const [open, setOpen] = useState(false);
  const activeOption =
    journalScopeOptions.find((option) => option.value === value) ??
    journalScopeOptions[0];
  const ActiveIcon = activeOption.icon;

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
        align="start"
        trigger={
          <button
            type="button"
            className="flx w-fit cursor-pointer gap-1 rounded-full bg-primary/10 py-1.5 pr-3 pl-2 text-xs font-semibold text-primary ring ring-primary/30 transition hover:bg-primary/15"
            aria-label={`${activeOption.label}. Change journal type`}
          >
            <ActiveIcon size={12} />
            <span>
              {activeOption.value === "mine"
                ? "My journals"
                : "Public journals"}
            </span>
          </button>
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
          <div
            className="flex flex-wrap gap-2 mt-2 pb-4"
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
                    "flex flex-1 md:flex-none justify-center cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
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
      <span className="text-sm whitespace-nowrap truncate">
        Write Your Travel Journal
      </span>
    </div>
  </button>
);
export default JournalPageHeader;
