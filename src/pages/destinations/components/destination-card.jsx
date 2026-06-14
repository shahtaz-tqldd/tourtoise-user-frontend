import { MapPin } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const formatLabel = (value) => value?.replaceAll("_", " ") || "Destination";

const DestinationCard = ({ destination }) => {
  const destinationUrl = `/destinations/${destination.slug}`;

  return (
    <article className="overflow-hidden rounded-[28px] bg-white">
      <Link to={destinationUrl} className="block">
        <div className="relative aspect-[1/1] overflow-hidden bg-slate-100">
          <img
            src={destination.cover_image}
            alt={destination.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-slate-900 shadow-sm backdrop-blur">
              {formatLabel(destination.destination_type)}
            </span>
          </div>
          {destination?.is_now_best_time && (
            <div className="absolute right-4 top-4 flex items-start justify-between gap-3">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-slate-900 shadow-sm backdrop-blur">
                best time
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-2xl font-bold leading-tight truncate">
              {destination.name}
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
              <MapPin size={15} />
              <span className="truncate">
                {destination.region}, {destination.country}
              </span>
            </p>
            {!!destination?.tags?.length && (
              <div className="flex flex-wrap gap-1 mt-3">
                {destination?.tags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default DestinationCard;
