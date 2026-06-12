import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const getCloudinaryPreviewUrl = (url, width = 300) => {
  if (!url?.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const uploadPath = "/image/upload/";
  const [baseUrl, imagePath] = url.split(uploadPath);

  if (!baseUrl || !imagePath) return url;
  if (imagePath.startsWith("c_scale,")) return url;

  return `${baseUrl}${uploadPath}c_scale,w_${width}/${imagePath}`;
};

const DestinationGallery = ({ destination }) => {
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
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-950">Gallery</h2>
          <p className="text-sm text-slate-500">{images.length} images</p>
        </div>

        <div className="grid gap-3 grid-cols-3">
          {visibleImages.map((image, index) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              onClick={() => setActiveIndex(index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 text-left outline-none ring-primary/30 focus-visible:ring-2"
            >
              <img
                src={image.previewUrl}
                alt={
                  image.caption || `${destination.name} gallery ${index + 1}`
                }
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </section>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => setActiveIndex(open ? activeIndex : null)}
      >
        <DialogContent
          className="h-[90vh] rounded-3xl overflow-hidden border-0 bg-slate-950 p-0 text-white sm:max-w-5xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {activeImage?.caption || `${destination.name} gallery image`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Gallery viewer for {destination.name}
          </DialogDescription>

          {activeImage && (
            <div className="relative h-[90vh] w-full">
              <img
                src={activeImage.url}
                alt={
                  activeImage.caption ||
                  `${destination.name} gallery ${activeIndex + 1}`
                }
                className="h-full w-full object-cover"
              />

              <div className="absolute left-0 right-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/80 to-transparent p-4">
                <p className="text-sm font-semibold">
                  {activeIndex + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Close
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

export default DestinationGallery;
