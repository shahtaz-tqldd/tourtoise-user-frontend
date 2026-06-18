import { SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  CalendarDays,
  Camera,
  ImagePlus,
  MapPinned,
  NotebookPen,
  Plus,
  Sparkles,
} from "lucide-react";
import React from "react";

const journals = [
  {
    title: "A quiet morning by the lake",
    location: "Pokhara, Nepal",
    date: "Apr 18, 2026",
    reminder: "Send this route to Rafi",
    body: "Woke up before the cafes opened and watched the boats move through fog. I want to remember how slow this day felt before the hike started.",
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80",
    ],
  },
  {
    title: "Street food notes after landing",
    location: "Istanbul, Turkiye",
    date: "Mar 02, 2026",
    reminder: null,
    body: "First travel rule confirmed again: eat near the ferry crowd. Simit, tea, grilled fish, and one tiny dessert shop worth saving for the next visit.",
    images: [
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=500&q=80",
    ],
  },
];

const journalStats = [
  { label: "Journals", value: "12", icon: NotebookPen },
  { label: "Photos", value: "38", icon: Camera },
  { label: "Reminders", value: "4", icon: Bell },
];

const TravelDays = () => {
  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeader
          icon={NotebookPen}
          title="Travel Journal"
          description="Save trip stories, photo memories, and small reminders from places worth revisiting."
        />

        <NewJournalDialog />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-sm">
                  <Sparkles size={14} />
                  Journal idea
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">
                  Capture the feeling, not the whole itinerary
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  A tourie can add a short memory, attach a few photos, and set
                  an optional reminder like "book this cafe again" or "send this
                  place to a friend."
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 md:w-[255px]">
                {journalStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="min-w-0 rounded-2xl bg-white p-3 text-center"
                    >
                      <Icon className="mx-auto text-primary" size={18} />
                      <p className="mt-2 text-lg font-bold text-slate-950">
                        {stat.value}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {journals.map((journal) => (
              <JournalCard key={journal.title} journal={journal} />
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-primary" />
              <h3 className="text-base font-bold text-slate-950">
                Next reminder
              </h3>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Send Pokhara route to Rafi
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              June 24, 2026
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-950">
              Quick prompts
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>What moment should not get lost in the camera roll?</p>
              <p>Which place would you recommend to one specific friend?</p>
              <p>What should future-you remember before returning?</p>
            </div>
          </div>
        </aside>
      </div>
    </Card>
  );
};

const JournalCard = ({ journal }) => (
  <article className="rounded-[24px] border border-slate-200 bg-white p-4">
    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
      <div className="grid h-44 grid-cols-2 gap-2 md:h-full">
        {journal.images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt=""
            className={`h-full min-h-0 w-full rounded-2xl object-cover ${
              journal.images.length === 1 || index === 0 ? "col-span-2" : ""
            }`}
          />
        ))}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span>{journal.date}</span>
          <span className="inline-flex items-center gap-1">
            <MapPinned size={13} />
            {journal.location}
          </span>
        </div>

        <h3 className="mt-2 text-lg font-bold text-slate-950">
          {journal.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{journal.body}</p>

        {journal.reminder && (
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Bell size={14} className="shrink-0 text-primary" />
            <span className="truncate">{journal.reminder}</span>
          </div>
        )}
      </div>
    </div>
  </article>
);

const NewJournalDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="w-full md:w-auto">
        <Plus size={16} />
        New Journal
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Create travel journal</DialogTitle>
        <DialogDescription>
          Add a simple memory now. Reminders and images can stay optional.
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="journal-title"
            className="text-sm font-semibold text-slate-700"
          >
            Title
          </label>
          <Input id="journal-title" placeholder="Sunset walk in Cox's Bazar" />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="journal-body"
            className="text-sm font-semibold text-slate-700"
          >
            Body
          </label>
          <Textarea
            id="journal-body"
            rows={5}
            placeholder="Write the memory, tip, or feeling you want to keep..."
            className="min-h-32"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="journal-reminder"
              className="text-sm font-semibold text-slate-700"
            >
              Reminder date
              <span className="font-normal text-slate-400"> optional</span>
            </label>
            <Input id="journal-reminder" type="date" />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="journal-images"
              className="text-sm font-semibold text-slate-700"
            >
              Images
            </label>
            <label
              htmlFor="journal-images"
              className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 px-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
            >
              <ImagePlus size={16} />
              Upload photos
            </label>
            <Input
              id="journal-images"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="button">Save Journal</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default TravelDays;
