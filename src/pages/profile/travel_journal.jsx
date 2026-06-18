import { SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpRight,
  ImagePlus,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import React from "react";
import JournalCard from "../journal/journal-card";

const journals = [
  {
    title: "A quiet morning by the lake",
    date: "Apr 18, 2026",
    body: "Woke up before the cafes opened and watched the boats move through fog. I want to remember how slow this day felt before the hike started.",
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
];

const TravelJournal = () => {
  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeader
          title="Travel Journal"
          description="Save trip stories, photo memories, and small reminders from places worth revisiting."
        />

        <NewJournalDialog />
      </div>

      <div className="mt-8 space-y-5">
        <div className="grid gap-4">
          {journals.map((journal) => (
            <JournalCard key={journal.title} journal={journal} />
          ))}
        </div>
      </div>
    </Card>
  );
};

const ImageUploadTiles = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <label
        key={index}
        htmlFor="journal-images"
        className="center aspect-square cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-center text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
      >
        <ImagePlus size={18} />
        Image {index + 1}
      </label>
    ))}
    <Input
      id="journal-images"
      type="file"
      multiple
      accept="image/*"
      className="sr-only"
    />
  </div>
);

const NewJournalDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="w-full md:w-auto">
        <Plus size={16} />
        New Journal
      </Button>
    </DialogTrigger>
    <DialogContent className="max-h-[92vh] overflow-y-auto p-4 sm:max-w-xl sm:p-6">
      <DialogHeader>
        <DialogTitle>Create travel journal</DialogTitle>
        <DialogDescription>
          Add the story and photos you want to keep from this trip.
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
            rows={6}
            placeholder="Write the memory, tip, or feeling you want to keep..."
            className="min-h-36"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="journal-images"
            className="text-sm font-semibold text-slate-700"
          >
            Images
          </label>
          <ImageUploadTiles />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button">Save Journal</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default TravelJournal;
