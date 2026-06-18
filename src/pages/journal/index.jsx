import React, { useMemo, useState } from "react";
import { Flame, Hash, Search, Sparkles } from "lucide-react";

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

const TravelJournalPage = () => {
  const [activeTag, setActiveTag] = useState("All");

  const tags = useMemo(
    () => ["All", ...new Set(journals.flatMap((journal) => journal.tags))],
    [],
  );

  const filteredJournals = useMemo(() => {
    if (activeTag === "All") return journals;

    return journals.filter((journal) => journal.tags.includes(activeTag));
  }, [activeTag]);

  const topReadJournals = useMemo(
    () =>
      [...filteredJournals]
        .sort((current, next) => next.readCount - current.readCount)
        .slice(0, 4),
    [filteredJournals],
  );

  return (
    <section className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div className="min-w-0 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">
            Travel Journal
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Stories, notes, and photo memories from travelers worth reading
            before planning the next route.
          </p>
        </div>

        {filteredJournals.length > 0 ? (
          <div className="space-y-4">
            {filteredJournals.map((journal) => (
              <JournalCard key={journal.title} journal={journal} />
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
              Pick another tag to browse more travel stories.
            </p>
          </div>
        )}
      </div>

      <aside className="space-y-10 md:space-y-12 lg:sticky lg:top-24">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Hash size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Tags</h2>
              <p className="text-sm text-slate-500">Filter journal columns.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold transition",
                  activeTag === tag
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Flame size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Top Read Journal
              </h2>
              <p className="text-sm text-slate-500">
                Most-read stories in this filter.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {topReadJournals.length > 0 ? (
              topReadJournals.map((journal, index) => (
                <article
                  key={journal.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950">
                        {journal.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {journal.readCount.toLocaleString()} reads
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <Sparkles className="mx-auto text-primary" size={22} />
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Top reads will appear when journals match this tag.
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </section>
  );
};

export default TravelJournalPage;
