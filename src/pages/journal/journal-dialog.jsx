import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpRight } from "lucide-react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import JournalComments from "./journal-comments";

const ReadJournalDialog = ({ journal, images }) => {
  const [open, setOpen] = useState(false);

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <button className="flx gap-2 text-sm font-semibold text-primary">
        <ArrowUpRight size={14} className="shrink-0" />
        <span className="truncate">Read Full</span>
      </button>
    </DialogTrigger>
    <DialogContent className="max-h-[92vh] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-xl border-none">
      <DialogHeader className="sr-only">
        <DialogTitle>Travel journal</DialogTitle>
        <DialogDescription>
          A travel journal by {journal.author.name}
        </DialogDescription>
      </DialogHeader>

      <div className="custom-scrollbar max-h-[92vh] min-h-0 overflow-y-auto">
        {images.length > 0 && (
          <Swiper
            modules={[Pagination]}
            pagination={
              images.length > 1
                ? { clickable: true, dynamicBullets: true }
                : false
            }
            className="journal-image-slider aspect-square w-full bg-slate-950 sm:aspect-[16/9]"
          >
            {images.map((image, index) => (
              <SwiperSlide key={`${image}-${index}`}>
                <img
                  src={image}
                  alt={`Journal photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img
              src={journal.author.avatar_url}
              alt={journal.author.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {journal.author.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5"> {journal.date}</p>
            </div>
          </div>

          <article className="mt-4">
            <p className="whitespace-pre-line text-base text-slate-700 leading-7">
              {journal.body}
            </p>
          </article>
          {open && (
            <div className="mt-6">
              <JournalComments journalId={journal.id} />
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
  );
};

export default ReadJournalDialog;
