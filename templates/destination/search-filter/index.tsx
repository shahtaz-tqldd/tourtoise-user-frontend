"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Hotel,
  Camera,
  Umbrella,
  Snowflake,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  TreePalm,
  Settings2,
} from "lucide-react";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

const SearchFilters = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "location",
    "activities",
  ]);
  const [selectedFilters, setSelectedFilters] = useState({
    location: [],
    activities: [],
    priceRange: [0, 5000],
    rating: 0,
    duration: "",
    season: [],
    accommodation: [],
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleFilterChange = (category: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleMultiSelect = (category: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      location: [],
      activities: [],
      priceRange: [0, 5000],
      rating: 0,
      duration: "",
      season: [],
      accommodation: [],
    });
  };

  const countActiveFilters = () => {
    let count = 0;
    if (selectedFilters.location.length > 0) count++;
    if (selectedFilters.activities.length > 0) count++;
    if (
      selectedFilters.priceRange[0] > 0 ||
      selectedFilters.priceRange[1] < 5000
    )
      count++;
    if (selectedFilters.rating > 0) count++;
    if (selectedFilters.duration) count++;
    if (selectedFilters.season.length > 0) count++;
    if (selectedFilters.accommodation.length > 0) count++;
    return count;
  };

  const continents = [
    "Asia",
    "Europe",
    "Africa",
    "North America",
    "South America",
    "Oceania",
    "Antarctica",
  ];
  const activities = [
    { id: "adventure", name: "Adventure", icon: TreePalm },
    { id: "cultural", name: "Cultural", icon: Camera },
    { id: "relaxation", name: "Relaxation", icon: Umbrella },
    { id: "winter", name: "Winter Sports", icon: Snowflake },
  ];
  const seasons = ["Spring", "Summer", "Fall", "Winter"];
  const accommodations = [
    "Hotel",
    "Resort",
    "Vacation Rental",
    "Hostel",
    "Camping",
  ];
  const durations = [
    { value: "weekend", label: "Weekend (2-3 days)" },
    { value: "week", label: "One Week" },
    { value: "twoweeks", label: "Two Weeks" },
    { value: "month", label: "A Month or More" },
  ];

  const [showFilter, setShowFilter] = useState(false);
  return (
    <Container className="!pt-32 !pb-0">
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <SlidersHorizontal size={16} className="text-primary" />
            <Typography as="h2" size="base" className="font-semibold">
              Search Filters
            </Typography>
            {countActiveFilters() > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {countActiveFilters()} active
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-primary"
          >
            Clear All
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flx gap-2 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary"
              placeholder="Search destinations..."
            />
          </div>
          <Button variant="ghost" onClick={() => setShowFilter(!showFilter)}>
            <Settings2 />
          </Button>
        </div>
        {showFilter && (
          <div>
            {/* Location Filter */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => toggleSection("location")}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  <Typography as="h3" size="sm" className="font-medium">
                    Location
                  </Typography>
                </div>
                {expandedSections.includes("location") ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections.includes("location") && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pl-7">
                  {continents.map((continent) => (
                    <button
                      key={continent}
                      onClick={() => handleMultiSelect("location", continent)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFilters.location.includes(continent)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {continent}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activities Filter */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => toggleSection("activities")}
              >
                <div className="flex items-center gap-2">
                  <Camera size={20} className="text-primary" />
                  <Typography as="h3" size="sm" className="font-medium">
                    Activities
                  </Typography>
                </div>
                {expandedSections.includes("activities") ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections.includes("activities") && (
                <div className="grid grid-cols-2 gap-2 mt-3 pl-7">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <button
                        key={activity.id}
                        onClick={() =>
                          handleMultiSelect("activities", activity.id)
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedFilters.activities.includes(activity.id)
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Icon size={16} />
                        {activity.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => toggleSection("price")}
              >
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-primary" />
                  <Typography as="h3" size="sm" className="font-medium">
                    Price Range
                  </Typography>
                </div>
                {expandedSections.includes("price") ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections.includes("price") && (
                <div className="mt-3 pl-7">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      ${selectedFilters.priceRange[0]}
                    </span>
                    <span className="text-sm text-gray-500">
                      ${selectedFilters.priceRange[1]}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div
                      className="absolute h-2 bg-primary rounded-full"
                      style={{
                        left: `${
                          (selectedFilters.priceRange[0] / 5000) * 100
                        }%`,
                        right: `${
                          100 - (selectedFilters.priceRange[1] / 5000) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={selectedFilters.priceRange[0]}
                      onChange={(e) =>
                        handleFilterChange("priceRange", [
                          parseInt(e.target.value),
                          selectedFilters.priceRange[1],
                        ])
                      }
                      className="w-5/12 -mt-6 relative z-10 opacity-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={selectedFilters.priceRange[1]}
                      onChange={(e) =>
                        handleFilterChange("priceRange", [
                          selectedFilters.priceRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-5/12 -mt-6 relative z-10 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => toggleSection("rating")}
              >
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-primary" />
                  <Typography as="h3" size="sm" className="font-medium">
                    Minimum Rating
                  </Typography>
                </div>
                {expandedSections.includes("rating") ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections.includes("rating") && (
                <div className="flex gap-2 mt-3 pl-7">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange("rating", rating)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedFilters.rating >= rating
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < rating ? "currentColor" : "none"}
                            className={
                              i < rating ? "text-current" : "text-current"
                            }
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Duration Filter */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => toggleSection("duration")}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  <Typography as="h3" size="sm" className="font-medium">
                    Trip Duration
                  </Typography>
                </div>
                {expandedSections.includes("duration") ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections.includes("duration") && (
                <div className="space-y-2 mt-3 pl-7">
                  {durations.map((duration) => (
                    <label
                      key={duration.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="duration"
                        checked={selectedFilters.duration === duration.value}
                        onChange={() =>
                          handleFilterChange("duration", duration.value)
                        }
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-700">
                        {duration.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Season Filter */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => toggleSection("season")}
              >
                <div className="flex items-center gap-2">
                  <Snowflake size={20} className="text-primary" />
                  <Typography as="h3" size="sm" className="font-medium">
                    Best Season
                  </Typography>
                </div>
                {expandedSections.includes("season") ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections.includes("season") && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pl-7">
                  {seasons.map((season) => (
                    <button
                      key={season}
                      onClick={() => handleMultiSelect("season", season)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFilters.season.includes(season)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accommodation Filter */}
            <div className="mb-6">
              <button
                className="flex items-center justify-between w-full py-3 text-left"
                onClick={() => toggleSection("accommodation")}
              >
                <div className="flex items-center gap-2">
                  <Hotel size={20} className="text-primary" />
                  <Typography as="h3" size="sm" className="font-medium">
                    Accommodation Type
                  </Typography>
                </div>
                {expandedSections.includes("accommodation") ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections.includes("accommodation") && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 pl-7">
                  {accommodations.map((accommodation) => (
                    <button
                      key={accommodation}
                      onClick={() =>
                        handleMultiSelect("accommodation", accommodation)
                      }
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFilters.accommodation.includes(accommodation)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {accommodation}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Filters Button */}
            <div className="flex gap-3 mt-6">
              <Button className="flex-1">Apply Filters</Button>
              <Button variant="outline" onClick={clearAllFilters}>
                <X size={18} className="mr-1" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default SearchFilters;
