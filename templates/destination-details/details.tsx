import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Car,
  Utensils,
  Compass,
  AlertCircle,
  Info,
  ChevronRight,
  Hotel,
  CupSoda,
} from "lucide-react";
import ImageSlider from "./image-gallery";
import { Typography } from "@/components/ui/typography";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { DEMO_DESTINATION } from "./_demo_data";
import { Destination } from "./_types";

// Component
const DestinationDetailsSection: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const destination = DEMO_DESTINATION;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getCostColor = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-600 bg-green-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "High":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative">
        <ImageSlider images={destination.images} title={destination.name} />

        <div className="pointer-events-none absolute bottom-0 z-10 pt-28 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
          <Typography as="h1" size="xl" className="!text-white font-bold mb-1">
            {destination.name}
          </Typography>
          <div className="flex items-center gap-2 text-lg mb-3 opacity-80">
            <MapPin size={16} />
            <span>
              {destination.location.region}, {destination.location.country}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {destination.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Typography as="p" size="sm">
          {destination.description}
        </Typography>
      </div>

      {/* Key Highlights */}
      <div className="border-b py-8">
        <Typography as="h2" size="base">
          Quick Facts
        </Typography>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-start gap-3 bg-white rounded-xl p-4">
            <Calendar className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <Typography as="h3" size="sm">
                Best Time
              </Typography>
              <Typography as="p" size="xs">
                {destination.highlights.best_time}
              </Typography>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white rounded-xl p-4">
            <Clock className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <Typography as="h3" size="sm">
                Duration
              </Typography>
              <Typography as="p" size="xs">
                {destination.highlights.avg_duration}
              </Typography>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white rounded-xl p-4">
            <Users className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <Typography as="h3" size="sm">
                Perfect For
              </Typography>
              <Typography as="p" size="xs">
                {destination.highlights.suitable_for.join(", ")}
              </Typography>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white rounded-xl p-4">
            <DollarSign className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <Typography as="h3" size="xs">
                Budget
              </Typography>
              <span
                className={`text-sm px-2 py-1 rounded ${getCostColor(
                  destination.highlights.cost_level
                )}`}
              >
                {destination.highlights.cost_level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Must-See Spots */}
      <div className="border-b py-8">
        <Typography as="h2" size="base" className="flx gap-3">
          <Compass className="text-primary" size={20} />
          Must-See Spots
        </Typography>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gird-cols-1 gap-4 mt-8">
          {destination.attractions.map((spot, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              {/* Top-left Tag */}
              <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-md">
                {spot.tag}
              </span>

              {/* Image */}
              <Image
                src={spot.image_url}
                className="h-64 w-full object-cover"
                height={400}
                width={400}
                alt={spot.name}
              />

              {/* Bottom Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent h-1/2 pt-12">
                <Typography as="h3" size="sm" className="!text-white">
                  {spot.name}
                </Typography>
                <Typography as="p" size="xs" className="!text-gray-100">
                  {spot.description}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stay Options */}
      <div className="py-8 border-b">
        <Typography as="h2" size="base" className="flx gap-3">
          Where to Stay
        </Typography>

        {/* Types */}
        <div className="mb-4 grid grid-cols-3 gap-3 mt-4">
          {destination.stays.types.map((type, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl flex flex-col justify-between gap-4"
            >
              <div>
                <Typography as="h3" size="sm">
                  {type.category}
                </Typography>
                <Typography as="p" size="xs">
                  {type.description}
                </Typography>
              </div>
              <div className="text-sm font-medium text-primary">
                {type.price_range}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Stays */}

        <StayOverRecommendation
          destination={destination}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        />
      </div>

      {/* Transportation */}
      <div className="py-8 border-b">
        <Typography as="h2" size="base" className="flx gap-3">
          <Car className="text-primary" size={20} />
          Getting Around
        </Typography>
        <div className="p-5 bg-primary/10 rounded-xl space-y-1 mt-6">
          <Typography as="h3" size="sm">
            How to Reach
          </Typography>
          <Typography as="p" size="sm" className="!text-gray-600">
            {destination.transportation.how_to_reach}
          </Typography>
        </div>
        <div className="mt-6">
          <Typography as="h3" size="sm">
            Local Transport
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {destination.transportation.local_options.map((option, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-white rounded-lg"
              >
                <Typography as="h3" size="sm">
                  {option.type}
                </Typography>

                <Typography as="p" size="xs">
                  {option.price_range}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cuisine */}
      <div className="py-8 border-b">
        <Typography as="h2" size="base" className="flx gap-3">
          <Utensils className="text-primary" size={20} />
          Local Flavors
        </Typography>

        {/* Dish Name */}
        <div className="mt-6">
          <Typography as="h3" size="sm">
            Must-Try Dishes
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {destination.cuisine.signature.map((dish, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg">
                <div className="flbx">
                  <Typography as="h3" size="sm">
                    {dish.name}
                  </Typography>
                  {dish.is_recommended && <Badge>Recommended</Badge>}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dish.tags?.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurnat Recommendation */}
        <RestaurantRecommendation
          toggleSection={toggleSection}
          destination={destination}
          expandedSections={expandedSections}
        />
      </div>

      {/* Activities */}
      <div className="py-6">
        <Typography as="h2" size="base">
          Things to Do
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {destination.activities.map((ativity, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-4 bg-white rounded-lg"
            >
              <Typography as="h3" size="sm">
                {ativity.name}
              </Typography>

              <Typography as="p" size="xs">
                {ativity.price_range}
              </Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Visit Info */}
      <div className="p-6 mt-6 bg-primary/10 rounded-xl">
        <Typography as="h2" size="base" className="flx gap-3">
          <Calendar className="text-primary" size={20} />
          When to Visit
        </Typography>
        <div className="space-y-2 text-base mt-4">
          <div>
            <span className="font-semibold">Weather:</span>{" "}
            {destination.visit_info.weather}
          </div>
          <div>
            <span className="font-semibold">Peak Season:</span>{" "}
            {destination.visit_info.peak_season}
          </div>
          <div>
            <span className="font-semibold">Festivals:</span>{" "}
            {destination.visit_info.festivals}
          </div>
        </div>
      </div>

      {/* Practical Info */}
      <div className="mt-12">
        <Typography as="h2" size="base" className="flx gap-3">
          <Info className="text-primary" size={24} />
          Good to Know
        </Typography>

        <div className="space-y-6 mt-6">
          <div className="space-y-1.5">
            <Typography as="h3" size="sm">
              Languages
            </Typography>
            <Typography as="p" size="sm">
              {destination.practical_info.languages.join(", ")}
            </Typography>
          </div>
          <div className="space-y-1.5">
            <Typography as="h3" size="sm">
              Payment Methods
            </Typography>
            <Typography as="p" size="sm">
              {destination.practical_info.payment.join(", ")}
            </Typography>
          </div>

          <div className="space-y-1.5">
            <Typography as="h3" size="sm" className="flx gap-2">
              <AlertCircle size={16} /> Safety Tips
            </Typography>
            <ul className="text-sm space-y-1 ml-5">
              {destination.practical_info.safety.map((tip, idx) => (
                <li key={idx} className="list-disc">
                  <Typography as="p" size="sm">
                    {tip}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <Typography as="h3" size="sm">
              Local Customs
            </Typography>
            <ul className="text-sm space-y-1 ml-5">
              {destination.practical_info.customs.map((custom, idx) => (
                <li key={idx} className="list-disc">
                  <Typography as="p" size="sm">
                    {custom}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailsSection;

interface ExpandableComponentProps {
  toggleSection: (section: string) => void;
  destination: Destination;
  expandedSections: Set<string>;
}

const StayOverRecommendation = ({
  toggleSection,
  destination,
  expandedSections,
}: ExpandableComponentProps) => {
  return (
    <>
      <motion.button
        onClick={() => toggleSection("stays")}
        className="w-full font-medium text-primary mt-6 mb-4 flbx"
        // whileTap={{ scale: 0.98 }}
      >
        <Typography as="h3" size="sm" className="flx gap-2">
          <Hotel size={18} />
          Recommended Stays ({destination.stays.suggested.length})
        </Typography>
        <motion.div
          animate={{ rotate: expandedSections.has("stays") ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {expandedSections.has("stays") && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              {destination.stays.suggested.map((stay, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="p-4 bg-white rounded-xl"
                >
                  <div className="flex justify-between items-start mb-1">
                    <Typography as="h3" size="sm">
                      {stay.name}
                    </Typography>

                    <span className="text-yellow-500 text-sm">
                      ★ {stay.rating}
                    </span>
                  </div>
                  <div className="space-y-3 mt-1">
                    <Typography as="p" size="sm" className="!text-primary">
                      {stay.price_range}
                    </Typography>
                    <Typography as="p" size="xs">
                      {stay.distance}
                    </Typography>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const RestaurantRecommendation = ({
  toggleSection,
  destination,
  expandedSections,
}: ExpandableComponentProps) => {
  return (
    <>
      <motion.button
        onClick={() => toggleSection("restaurant")}
        className="w-full font-medium text-primary mt-6 mb-4 flbx"
      >
        <Typography as="h3" size="sm" className="flx gap-2">
          <CupSoda size={18} />
          Recommended Restaurnat ({destination.stays.suggested.length})
        </Typography>
        <motion.div
          animate={{ rotate: expandedSections.has("restaurant") ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {expandedSections.has("restaurant") && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              {destination.cuisine.restaurants.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="p-4 bg-white rounded-2xl tr flex flex-col justify-between"
                >
                  {/* Top Section (Name + Rating) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start mb-1">
                      <Typography
                        as="h3"
                        size="sm"
                        className="font-semibold text-gray-800"
                      >
                        {item.name}
                      </Typography>

                      <span className="text-yellow-500 text-sm font-medium">
                        ★ {item.rating}
                      </span>
                    </div>

                    {/* Signature Dishes */}
                    <div>
                      <Typography
                        as="p"
                        size="xs"
                        className="text-gray-600 font-medium"
                      >
                        Signature Dishes
                      </Typography>

                      <ul className="mt-2 flex flex-wrap gap-2">
                        {item.signature_dish.slice(0, 3).map((dish, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-100"
                          >
                            {dish}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="space-y-1 mt-3 pt-2 border-t border-gray-100 flbx">
                    <Typography
                      as="p"
                      size="xs"
                      className="text-primary font-medium flx gap-2"
                    >
                      <MapPin size={14} /> {item.location.area}
                    </Typography>

                    {/* Optional Distance — you can calculate it or replace with static */}
                    {item.location.long && item.location.lat && (
                      <Typography as="p" size="xs" className="text-gray-500">
                        See Map
                      </Typography>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
