"use client";

import React from "react";
import { MapPin } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { TourDestination } from "../_types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DestinationCardProps {
  destination: TourDestination;
  role?: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  role = "listitems",
}) => {
  const router = useRouter();

  const handleDestinationCardClick = (slug: string) => {
    router.push(`destinations/${slug}`);
  };
  return (
    <div
      onClick={() => handleDestinationCardClick(destination.slug)}
      role={role}
      className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative h-80 w-full overflow-hidden">
        <Image
          src={destination.images.thumbnail}
          alt={destination.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          height={500}
          width={500}
        />

        {/* Black overlay for bottom half of image */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

        {destination.featured && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
            Best Time
          </span>
        )}

        <div className="flex flex-col absolute bottom-4 left-4">
          <div className="space-y-1">
            <Typography
              as="h3"
              size="base"
              className="font-semibold text-white truncate"
            >
              {destination.name}
            </Typography>
            <div className="flex items-center text-sm text-gray-200">
              <MapPin size={14} className="mr-1" />
              <span>{destination.location.country}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
