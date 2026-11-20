import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Images } from "lucide-react";

import { Image } from "@/components/shared/utils";
import { cn } from "@/lib/utils";
import PhotoLightbox from "./photo-lightbox";

/** Grid placement per tile, keyed by how many tiles are shown (max 5). */
const MOSAIC_TILES = {
  1: ["col-span-4 row-span-2"],
  2: ["col-span-2 row-span-2", "col-span-2 row-span-2"],
  3: ["col-span-2 row-span-2", "col-span-2", "col-span-2"],
  4: ["col-span-2 row-span-2", "col-span-2", "col-span-1", "col-span-1"],
  5: ["col-span-2 row-span-2", "", "", "", ""],
};

const TILE_BUTTON =
  "group relative overflow-hidden bg-ink-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white";

/**
 * Photos shown once: a swipeable strip on phones, a mosaic on larger screens.
 * Any photo opens the full-screen viewer.
 */
const PhotoHero = ({ photos, name, className }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  if (!photos.length) {
    return (
      <div className={cn("aspect-[16/9] overflow-hidden rounded-sheet bg-ink-100 md:aspect-[21/8]", className)}>
        <Image src="" alt="" />
      </div>
    );
  }

  const mosaic = photos.slice(0, 5);
  const tiles = MOSAIC_TILES[mosaic.length];
  const open = (index) => setLightboxIndex(index);

  return (
    <div className={className}>
      {/* Phones: full-bleed swipe strip. */}
      <div className="relative -mx-2.5 -mt-5 md:hidden">
        <Swiper
          onSlideChange={(swiper) => setMobileIndex(swiper.activeIndex)}
          className="aspect-[4/3] w-full"
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={photo.url}>
              <button
                type="button"
                onClick={() => open(index)}
                className="block size-full bg-ink-100"
                aria-label={`Open photo ${index + 1} of ${photos.length}`}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || `${name} photo ${index + 1}`}
                  width={800}
                 
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        {photos.length > 1 && (
          <span
            className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-caption font-semibold tabular-nums text-white backdrop-blur"
            aria-hidden="true"
          >
            {mobileIndex + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Tablet and up: mosaic. */}
      <div className="relative hidden h-[360px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-sheet md:grid lg:h-[440px]">
        {mosaic.map((photo, index) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => open(index)}
            className={cn(TILE_BUTTON, tiles[index])}
            aria-label={`Open photo ${index + 1} of ${photos.length}`}
          >
            <Image
              src={photo.url}
              alt={photo.caption || `${name} photo ${index + 1}`}
              width={index === 0 ? 1200 : 600}
             
              className="transition duration-500 group-hover:scale-[1.03] group-hover:brightness-95"
            />
          </button>
        ))}

        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => open(0)}
            className="absolute bottom-4 right-4 inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-body-sm font-semibold text-heading shadow-raised transition hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Images className="size-4" aria-hidden="true" />
            Show all {photos.length} photos
          </button>
        )}
      </div>

      <PhotoLightbox
        key={lightboxIndex ?? "closed"}
        photos={photos}
        name={name}
        open={lightboxIndex !== null}
        startIndex={lightboxIndex ?? 0}
        onOpenChange={(next) => !next && setLightboxIndex(null)}
      />
    </div>
  );
};

export default PhotoHero;
