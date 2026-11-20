import { useRef, useState } from "react";
import { Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image } from "@/components/shared/utils";

const NAV_BUTTON =
  "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-900 shadow-raised transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-0 md:grid";

/** Full-screen photo viewer. Swipe on touch, arrows or keys on desktop. */
const PhotoLightbox = ({ photos, name, open, onOpenChange, startIndex = 0 }) => {
  const swiperRef = useRef(null);
  // The parent remounts this per opening, so the start index is read once.
  const [activeIndex, setActiveIndex] = useState(startIndex);

  const activePhoto = photos[activeIndex];
  const hasMany = photos.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100dvh] w-screen max-w-none gap-0 overflow-hidden rounded-none border-0 bg-ink-950 p-0 text-white sm:max-w-none">
        <DialogTitle className="sr-only">{name} photos</DialogTitle>
        <DialogDescription className="sr-only">
          Photo {activeIndex + 1} of {photos.length}
        </DialogDescription>

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <p className="text-body-sm font-semibold tabular-nums" aria-hidden="true">
              {activeIndex + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="center size-10 rounded-full text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Close photos"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <Swiper
              modules={[Keyboard]}
              initialSlide={startIndex}
              keyboard={{ enabled: true, onlyInViewport: false }}
              spaceBetween={16}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="h-full w-full"
            >
              {photos.map((photo, index) => (
                <SwiperSlide key={photo.url} className="!h-full">
                  <div className="center h-full w-full px-0 md:px-20">
                    <Image
                      src={photo.url}
                      alt={photo.caption || `${name} photo ${index + 1}`}
                      width={1600}
                      draggable={false}
                      className="!h-auto !w-auto max-h-full max-w-full select-none object-contain md:rounded-xl"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {hasMany && (
              <>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  disabled={activeIndex === 0}
                  className={`${NAV_BUTTON} left-5`}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  disabled={activeIndex === photos.length - 1}
                  className={`${NAV_BUTTON} right-5`}
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <p className="min-h-12 px-4 py-3 text-center text-body-sm text-white/80 md:px-6">
            {activePhoto?.caption}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoLightbox;
