import { useMemo, useState } from "react";

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
import { getCloudinaryPreviewUrl } from "@/lib/utils";

const Gallery = ({ destination }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const images = useMemo(() => {
    const galleryImages =
      destination.images?.map((image) => ({
        url: image.image_url,
        previewUrl: getCloudinaryPreviewUrl(image.image_url),
        caption: image.caption,
        sortOrder: image.sort_order,
      })) || [];

    return [
      destination.cover_image && {
        url: destination.cover_image,
        previewUrl: getCloudinaryPreviewUrl(destination.cover_image),
        caption: `${destination.name} cover`,
        sortOrder: 0,
      },
      ...galleryImages,
    ]
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [destination]);

  if (!images.length) return null;

  const activeImage = activeIndex === null ? null : images[activeIndex];
  const visibleImages = images.slice(0, 6);
  const goToPrevious = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  };
  const goToNext = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <>
      <Card className="md:p-4">
        <div className="flbx">
          <h2 className="font-bold">Gallery Highlights</h2>
          <button
            onClick={() => setActiveIndex(0)}
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
              onClick={() => setActiveIndex(index)}
              className="group relative aspect-[1] overflow-hidden rounded-xl bg-slate-100 text-left outline-none ring-primary/30 focus-visible:ring-2"
            >
              <img
                src={getCloudinaryPreviewUrl(image.previewUrl, 96)}
                alt={
                  image.caption || `${destination.name} gallery ${index + 1}`
                }
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </Card>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => setActiveIndex(open ? activeIndex : null)}
      >
        <DialogContent
          className="h-[100dvh] w-screen max-w-none overflow-hidden rounded-none border-0 bg-black p-0 text-white sm:h-auto sm:w-fit sm:max-w-[calc(100vw-4rem)] sm:rounded-2xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {activeImage?.caption || `${destination.name} gallery image`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Gallery viewer for {destination.name}
          </DialogDescription>

          {activeImage && (
            <div className="relative flex h-full w-full items-center justify-center sm:h-auto sm:w-fit">
              <img
                src={activeImage.url}
                alt={
                  activeImage.caption ||
                  `${destination.name} gallery ${activeIndex + 1}`
                }
                className="block h-auto w-auto max-h-[100dvh] max-w-full object-contain sm:max-h-[calc(100dvh-4rem)] sm:max-w-[calc(100vw-4rem)]"
              />

              <div className="absolute left-0 right-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/80 to-transparent p-4">
                <p className="text-sm font-semibold">
                  {activeIndex + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
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
                    className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {activeImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
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
