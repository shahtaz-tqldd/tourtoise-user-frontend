import { Link } from "react-router-dom";
import { DetailPill, PageTitle } from "@/components/shared/utils";
import ImagePreview from "@/components/shared/image-slider";
import { ArrowLeft } from "lucide-react";

const DestinationCover = ({ destination }) => {
  const images = [
    destination.cover_image && {
      url: destination.cover_image,
      sortOrder: 0,
    },
    ...(destination.images || []).map((image) => ({
      url: image.image_url,
      sortOrder: image.sort_order,
    })),
  ]
    .filter((image) => image?.url)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((image) => image.url);

  const tags =
    destination.tags
      ?.map((tag) => tag.name || tag.slug || tag)
      .filter(Boolean) ||
    destination.highlights ||
    [];
  return (
    <>
      <div className="relative -mx-4 overflow-hidden md:mx-0 md:rounded-[28px] -mt-5 md:mt-0">
        <Link
          to="/"
          className="hidden md:flex md:items-center md:justify-center absolute left-4 top-4 z-20 h-10 w-10 rounded-full bg-white/50 text-sm font-medium backdrop-blur-sm transition hover:bg-white/70"
        >
          <ArrowLeft size={16} />
        </Link>
        <ImagePreview
          images={images}
          altPrefix={destination.name || "Destination"}
        />
      </div>
      <div className="mt-3">
        <PageTitle title={destination.name} text={destination.tagline} />
      </div>
      {!!tags.length && (
        <div className="flex flex-wrap gap-2 -mt-4">
          {tags.map((tag) => (
            <DetailPill key={tag}>{tag}</DetailPill>
          ))}
        </div>
      )}
    </>
  );
};

export default DestinationCover;
