import { useMemo, useRef, useState } from "react";
import { Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Card from "@/components/ui/card";

// icons
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// lib
import { Image } from "@/components/shared/utils";

const Gallery = ({ destination }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const swiperRef = useRef(null);
  const images = useMemo(() => {
    const galleryImages =
      destination.images?.map((image) => ({
        url: image.image_url,
        caption: image.caption,
        sortOrder: image.sort_order,
      })) || [];

    return [
      destination.cover_image && {
        url: destination.cover_image,
        caption: `${destination.name} cover`,
        sortOrder: 0,
      },
      ...galleryImages,
    ]
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [destination]);

  if (!images.length) return null;

  const activeImage = images[activeIndex];
  const visibleImages = images.slice(0, 6);
  const openPreview = (index) => {
    setActiveIndex(index);
    setIsPreviewOpen(true);
  };
  const goToPrevious = () => swiperRef.current?.slidePrev();
  const goToNext = () => swiperRef.current?.slideNext();

  return (
    <>
      <Card className="md:p-4">
        <div className="flbx">
          <h2 className="font-bold">Gallery Highlights</h2>
          <button
            onClick={() => openPreview(0)}
            className="text-xs text-slate-500 font-bold"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {visibleImages.map((image, index) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              onClick={() => openPreview(index)}
              className="group relative aspect-[1] overflow-hidden rounded-xl bg-slate-100 text-left outline-none ring-primary/30 focus-visible:ring-2"
            >
              <Image
                src={image?.url}
                width={200}
                alt={image.caption}
                className="transition duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </Card>

      <Dialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      >
        <DialogContent
          className="h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-0 bg-black p-0 text-white sm:max-w-none md:h-[min(90dvh,40.5rem)] md:w-[min(90vw,72rem)] md:rounded-2xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {activeImage?.caption || `${destination.name} gallery image`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Gallery viewer for {destination.name}
          </DialogDescription>

          {activeImage && (
            <div className="relative h-full w-full overflow-hidden">
              <Swiper
                modules={[Keyboard]}
                initialSlide={activeIndex}
                loop={images.length > 1}
                allowTouchMove={images.length > 1}
                grabCursor={images.length > 1}
                keyboard={{
                  enabled: images.length > 1,
                  onlyInViewport: false,
                  pageUpDown: false,
                }}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                onBeforeDestroy={() => {
                  swiperRef.current = null;
                }}
                className="h-full w-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide
                    key={`${image.url}-${index}`}
                    className="!h-full !w-full"
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <Image
                        src={image.url}
                        alt={
                          image.caption ||
                          `${destination.name} gallery image ${index + 1}`
                        }
                        width={1200}
                        draggable={false}
                        className="block h-auto w-auto max-h-[100dvh] max-w-full select-none object-contain md:h-full md:w-full md:max-h-none md:max-w-none md:object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/80 to-transparent p-4">
                <p className="text-sm font-semibold">
                  {activeIndex + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Close image preview"
                  title="Close image preview"
                >
                  <X size={20} />
                </button>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {activeImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
                  <p className="text-sm font-medium">{activeImage.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;
