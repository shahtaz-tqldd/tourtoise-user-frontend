import React, { useMemo, useState } from "react";
import { Bookmark, BookmarkX, Search, SlidersHorizontal, X } from "lucide-react";

import AgentMessageComposer from "@/components/shared/agent-message-composer";
import ListingHeader from "@/components/shared/listing-header";
import SearchField from "@/components/shared/search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import JournalCard from "./journal-card";

const journals = [
  {
    title: "A quiet morning by the lake",
    date: "Apr 18, 2026",
    body: "Woke up before the cafes opened and watched the boats move through fog. I want to remember how slow this day felt before the hike started.",
    readCount: 1840,
    tags: ["Nature", "Slow Travel", "Photography"],
    author: {
      name: "Shahtaz Rahman",
      avatar_url:
        "https://img.magnific.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?semt=ais_hybrid&w=740&q=80",
    },
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80",
    ],
  },
  {
    date: "Mar 02, 2026",
    title: "Street food notes after landing",
    body: "First travel rule confirmed again: eat near the ferry crowd. Simit, tea, grilled fish, and one tiny dessert shop worth saving for the next visit.",
    readCount: 2310,
    tags: ["Food", "City Guide", "Budget"],
    cover_image:
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=500&q=80",
    author: {
      name: "Shahtaz Rahman",
      avatar_url:
        "https://img.magnific.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?semt=ais_hybrid&w=740&q=80",
    },
    images: [
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=700&q=80",
    ],
  },
  {
    date: "Feb 14, 2026",
    title: "Three days through old temples",
    body: "The best part was not the famous courtyard. It was the narrow lane behind the guesthouse where incense, breakfast stalls, and morning bells all mixed together.",
    readCount: 1576,
    tags: ["Culture", "History", "Slow Travel"],
    cover_image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=700&q=80",
    author: {
      name: "Maya Rahman",
      avatar_url:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
    },
    images: [
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=700&q=80",
    ],
  },
  {
    date: "Jan 26, 2026",
    title: "Rainy train ride to the hills",
    body: "Packed too lightly, bought a wool scarf at the station, and spent the whole ride watching tea gardens disappear into low clouds.",
    readCount: 1228,
    tags: ["Nature", "Transport", "Mountains"],
    cover_image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=80",
    author: {
      name: "Nadia Islam",
      avatar_url:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=320&q=80",
    },
    images: [
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80",
    ],
  },
];

const JournalTagFilter = ({ tags, value, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draftTag, setDraftTag] = useState(value);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setDraftTag(value);
    setOpen(nextOpen);
  };

  const applyFilter = () => {
    onApply(draftTag);
    setOpen(false);
  };

  const cancelFilter = () => {
    setDraftTag(value);
    setOpen(false);
  };

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-slate-200"
            aria-label="Open journal filters"
          >
            <SlidersHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(calc(100vw-2rem),340px)] rounded-2xl border-slate-200 bg-white p-0 shadow-xl"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-base font-bold text-slate-950">
              Filter journals
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a journal tag to show.
            </p>
          </div>

          <div className="max-h-[52vh] space-y-2 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Tag
            </p>
            {tags.map((tag) => (
              <label
                key={tag}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition",
                  draftTag === tag
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="journal-tag-filter"
                  value={tag}
                  checked={draftTag === tag}
                  onChange={(event) => setDraftTag(event.target.value)}
                  className="size-4 accent-primary"
                />
                {tag}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
            <Button type="button" variant="outline" onClick={cancelFilter}>
              Cancel
            </Button>
            <Button type="button" onClick={applyFilter}>
              Apply
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {value !== "All" && (
        <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary" />
      )}
    </div>
  );
};

const getJournalCover = (journal) =>
  journal.images?.[0] || journal.cover_image || null;

const SavedJournalList = ({ journals: savedJournals, onSaveToggle }) => {
  if (!savedJournals.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="center size-12 rounded-full bg-slate-200/80">
          <BookmarkX className="text-slate-500" />
        </div>
        <p className="max-w-[240px] text-sm leading-5 text-slate-500">
          You have no saved journals yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedJournals.map((journal) => {
        const coverImage = getJournalCover(journal);

        return (
          <article
            key={journal.title}
            className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-2"
          >
            <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {coverImage && (
                <img
                  src={coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-bold text-slate-950">
                {journal.title}
              </h3>
              <p className="mt-1 truncate text-xs text-slate-500">
                {journal.author.name}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {journal.date}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-primary"
              onClick={() => onSaveToggle(journal)}
              aria-label={`Remove ${journal.title} from saved journals`}
            >
              <Bookmark size={16} className="fill-current" />
            </Button>
          </article>
        );
      })}
    </div>
  );
};

const SavedJournalsPanel = ({ journals: savedJournals, onSaveToggle }) => (
  <aside className="hidden space-y-10 lg:sticky lg:top-24 lg:block lg:self-start">
    <AgentMessageComposer
      message="Found a travel story you like? I can help turn its ideas into your own trip plan."
      placeholder="Ask about a journal or travel idea"
    />
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        <Bookmark size={14} />
        Saved journals
      </div>
      <SavedJournalList
        journals={savedJournals}
        onSaveToggle={onSaveToggle}
      />
    </div>
  </aside>
);

const SavedJournalsDrawer = ({ journals: savedJournals, onSaveToggle }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-12 rounded-full border-slate-200 lg:hidden"
        aria-label="Open saved journals"
      >
        <Bookmark size={16} />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="w-[min(92vw,400px)] gap-0 overflow-y-auto p-0"
      showCloseButton={false}
    >
      <SheetHeader className="border-b border-slate-100 pr-12 text-left">
        <SheetTitle>Saved Journals</SheetTitle>
        <SheetDescription>Your bookmarked travel stories.</SheetDescription>
      </SheetHeader>
      <SheetClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-3 top-3 rounded-full"
          aria-label="Close saved journals"
        >
          <X size={16} />
        </Button>
      </SheetClose>
      <div className="space-y-8 p-4">
        <AgentMessageComposer
          message="Found a travel story you like? I can help turn its ideas into your own trip plan."
          placeholder="Ask about a journal or travel idea"
        />
        <SavedJournalList
          journals={savedJournals}
          onSaveToggle={onSaveToggle}
        />
      </div>
    </SheetContent>
  </Sheet>
);

const TravelJournalPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [savedJournalTitles, setSavedJournalTitles] = useState(() => new Set());

  const tags = useMemo(
    () => ["All", ...new Set(journals.flatMap((journal) => journal.tags))],
    [],
  );

  const filteredJournals = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return journals.filter((journal) => {
      const matchesTag =
        activeTag === "All" || journal.tags.includes(activeTag);
      const matchesSearch =
        !normalizedSearch ||
        [journal.title, journal.body, journal.author.name, ...journal.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesTag && matchesSearch;
    });
  }, [activeTag, searchQuery]);

  const savedJournals = useMemo(
    () =>
      journals.filter((journal) => savedJournalTitles.has(journal.title)),
    [savedJournalTitles],
  );

  const toggleSavedJournal = (journal) => {
    setSavedJournalTitles((currentTitles) => {
      const nextTitles = new Set(currentTitles);

      if (nextTitles.has(journal.title)) nextTitles.delete(journal.title);
      else nextTitles.add(journal.title);

      return nextTitles;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTag("All");
  };

  const hasFilters = searchQuery || activeTag !== "All";

  return (
    <section className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div className="min-w-0 space-y-5">
        <ListingHeader
          title="Travel Journal"
          description={`Showing ${filteredJournals.length} of ${journals.length} journals`}
          filters={
            <div className="flex w-full gap-3 md:justify-end">
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Search journals..."
                className="max-w-sm flex-1"
              />
              <JournalTagFilter
                tags={tags}
                value={activeTag}
                onApply={setActiveTag}
              />
              <SavedJournalsDrawer
                journals={savedJournals}
                onSaveToggle={toggleSavedJournal}
              />
            </div>
          }
        />

        {filteredJournals.length > 0 ? (
          <div className="space-y-12 md:space-y-4">
            {filteredJournals.map((journal) => (
              <JournalCard
                key={journal.title}
                journal={journal}
                isSaved={savedJournalTitles.has(journal.title)}
                onSaveToggle={toggleSavedJournal}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search size={24} />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-950">
              No journals found
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Adjust the search or tag filter to browse more travel stories.
            </p>
            {hasFilters && (
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      <SavedJournalsPanel
        journals={savedJournals}
        onSaveToggle={toggleSavedJournal}
      />
    </section>
  );
};

export default TravelJournalPage;
