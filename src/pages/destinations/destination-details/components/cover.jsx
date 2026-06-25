import { Link } from "react-router-dom";
import { PageTitle } from "@/components/shared/utils";
import { ArrowLeft } from "lucide-react";

const DestinationCover = ({ destination }) => {
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
        <div className="aspect-[16/9]">
          <img
            src={destination.cover_image}
            alt={destination.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
        <div className="hidden md:block absolute bottom-0 left-0 right-0 p-4 text-white md:p-8">
          <PageTitle
            title={destination.name}
            text={destination.tagline}
            variant="light"
          />
        </div>
      </div>
      <div className="block md:hidden mt-3">
        <PageTitle title={destination.name} text={destination.tagline} />
      </div>
      {!!tags.length && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default DestinationCover;
