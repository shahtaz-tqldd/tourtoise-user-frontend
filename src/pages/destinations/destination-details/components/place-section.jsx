import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";

import { Image } from "@/components/shared/utils";
import { Heading, Text } from "@/components/ui/typography";
import { cn, formatLabel } from "@/lib/utils";
import { PLACE_KINDS } from "../place-kinds";

/** Desktop shows two rows; phones scroll the full list sideways. */
const DESKTOP_LIMIT = 6;

const PlaceCard = ({ item, kind, onSelect }) => {
  const type = formatLabel(kind.getType(item));
  const meta = kind.getMeta(item).filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-card bg-surface text-left ring-1 ring-line-subtle transition hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        <Image
          src={item.cover_image || item.images?.[0]?.image_url}
          alt=""
          width={480}
          content_type={kind.contentType}
          className="transition duration-500 group-hover:scale-105"
        />
        {item.is_featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-caption font-semibold text-heading shadow-card">
            <Star className="size-3 fill-sand-400 text-sand-400" aria-hidden="true" />
            Top pick
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {type && (
          <p className="text-caption font-semibold text-brand-text first-letter:uppercase">{type}</p>
        )}
        <h3 className="mt-0.5 line-clamp-2 text-body-md font-bold leading-snug text-heading">
          {item.name}
        </h3>
        {meta && (
          <p className="mt-auto truncate pt-2 text-caption text-subtle">{meta}</p>
        )}
      </div>
    </button>
  );
};

/** Attractions, activities or food: header, card rail/grid, and "Show all". */
const PlaceSection = ({ kindKey, items = [], onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const kind = PLACE_KINDS[kindKey];
  if (!items.length) return null;

  const hiddenCount = items.length - DESKTOP_LIMIT;
  const titleId = `${kindKey}-title`;

  return (
    <section aria-labelledby={titleId} className="space-y-4">
      <div>
        <Heading level={3} as="h2" id={titleId}>
          {kind.title}
        </Heading>
        <Text size="sm" tone="subtle" className="mt-0.5">
          {kind.description}
        </Text>
      </div>

      <ul
        role="list"
        className="hidden-scrollbar -mx-2.5 flex snap-x snap-mandatory scroll-px-2.5 gap-3 overflow-x-auto px-2.5 pb-1 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-3"
      >
        {items.map((item, index) => (
          <li
            key={item.id || item.slug || item.name}
            className={cn(
              "w-[72%] shrink-0 snap-start min-[480px]:w-[46%] md:w-auto",
              !expanded && index >= DESKTOP_LIMIT && "md:hidden",
            )}
          >
            <PlaceCard item={item} kind={kind} onSelect={onSelect} />
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mx-auto hidden h-10 items-center gap-1.5 rounded-full bg-surface px-5 text-body-sm font-semibold text-heading ring-1 ring-line transition hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
        >
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      )}
    </section>
  );
};

export default PlaceSection;
