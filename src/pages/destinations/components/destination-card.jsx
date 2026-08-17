import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DESTINATION_TYPE_OPTIONS } from "../constants";
import { Image } from "@/components/shared/utils";
import Badge from "@/components/ui/badge";
import { Text, Title } from "@/components/ui/typography";

const formatLabel = (value) => value?.replaceAll("_", " ") || "Destination";

const DestinationCard = ({ destination, onSavedClick, savedActionLabel }) => {
  const destinationUrl = `/destinations/${destination.slug}`;
  const typeGroup = DESTINATION_TYPE_OPTIONS.find(
    (option) => option.value === destination.destination_type,
  );

  return (
    <article className="overflow-hidden rounded-3xl bg-white relative group">
      <Link to={destinationUrl} className="block">
        <div className="relative aspect-[5/3] overflow-hidden bg-gradient-to-br from-emerald-100 via-slate-100 to-cyan-100">
          <Image
            src={destination.cover_image}
            alt={destination.name}
            width={600}
            className="transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 right-4 top-4 flx gap-2">
            {destination?.is_now_best_time && (
              <Badge variant="secondary" icon={Clock}>
                best time
              </Badge>
            )}
          </div>
        </div>
        <div className="p-5">
          <div className="flex gap-4">
            <Title className="truncate">{destination.name}</Title>
          </div>
          <Text variant="sm" className="mt-2 flex items-center gap-1.5">
            <MapPin size={14} />
            <span className="truncate">
              {destination.region}, {destination.country}
            </span>
          </Text>
          {!!destination?.tags?.length && (
            <div className="flex flex-wrap gap-1 mt-3">
              <Badge variant="primary" icon={typeGroup.icon}>
                {formatLabel(destination.destination_type)}
              </Badge>
              {destination?.tags?.slice(0, 3).map((tag, index) => (
                <Badge key={index}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
      {onSavedClick && (
        <Button
          type="button"
          variant="outline"
          className="absolute bottom-4 right-4 z-10 h-10 rounded-full border-white/60 bg-white/95 px-4 text-primary shadow-sm backdrop-blur hover:bg-white"
          onClick={onSavedClick}
          aria-label={savedActionLabel || "Save destination"}
        >
          <Bookmark size={16} className="fill-primary text-primary" />
        </Button>
      )}
    </article>
  );
};

export default DestinationCard;
