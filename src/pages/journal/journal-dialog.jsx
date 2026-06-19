import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpRight } from "lucide-react";

const ReadJournalDialog = ({ journal, images }) => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="flx mt-4 gap-2 text-sm font-semibold text-primary">
        <ArrowUpRight size={14} className="shrink-0" />
        <span className="truncate">Read Full</span>
      </button>
    </DialogTrigger>
    <DialogContent className="max-h-[92vh] overflow-y-auto p-4 sm:max-w-2xl sm:p-6 rounded-3xl">
      <DialogHeader>
        <DialogTitle className="pr-7 text-xl leading-7">
          {journal.title}
        </DialogTitle>
        <DialogDescription>
          {journal.date} by {journal.author.name}
        </DialogDescription>
      </DialogHeader>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {images.slice(0, 4).map((image) => (
            <img
              key={image}
              src={image}
              alt=""
              className="aspect-square w-full rounded-xl object-cover sm:aspect-[4/3]"
            />
          ))}
        </div>
      )}

      <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
        {journal.body}
      </p>
    </DialogContent>
  </Dialog>
);

export default ReadJournalDialog;
