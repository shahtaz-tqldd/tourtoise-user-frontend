import { Link } from "react-router-dom";
import ImagePreview from "@/components/shared/image-slider";
import { ArrowLeft } from "lucide-react";
import Badge from "@/components/ui/badge";
import { Text, Title } from "@/components/ui/typography";

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
      <div className="relative overflow-hidden md:mx-0 -mx-2.5 -mt-5 md:mt-0 md:rounded-3xl">
        <Link
          to="/"
          className="hidden md:flex md:items-center md:justify-center absolute left-4 top-4 z-20 h-10 w-10 rounded-full bg-white/50 text-sm font-medium backdrop-blur-sm transition hover:bg-white/70"
        >
          <ArrowLeft size={16} />
        </Link>
        <ImagePreview
          images={images}
          altPrefix={destination.name || "Destination"}
          imageWidth={1200}
          className="md:[&_.swiper-slide]:rounded-[28px]"
        />
      </div>
      <div className="-mt-2">
        <Title variant="xl">{destination.name}</Title>
        <Text variant="lg" className="mt-2">
          {destination.tagline}
        </Text>
      </div>
      {!!tags.length && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index}>{tag}</Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default DestinationCover;
