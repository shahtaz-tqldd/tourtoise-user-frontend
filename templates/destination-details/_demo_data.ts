import { Destination } from "./_types";

// Demo Data
export const DEMO_DESTINATION: Destination = {
  id: "cox-bazar-001",
  name: "Cox's Bazar",
  location: {
    city: "Cox's Bazar",
    region: "Chittagong Division",
    country: "Bangladesh",
  },
  tags: ["Beach", "Nature", "Seafood", "Budget-Friendly", "Family"],
  description:
    "Home to the world's longest natural sea beach stretching 120km. Perfect for beach lovers seeking relaxation, stunning sunsets, and fresh seafood. Ideal for families, couples, and solo travelers looking for an affordable coastal getaway.",
  images: [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/e2/f8/43/longest-sea-beach-in.jpg?w=1100&h=1100&s=1",
    "https://www.outlooktravelmag.com/media/bali-1-1679062958.profileImage.2x-scaled-webp.webp",
    "https://www.winetraveler.com/wp-content/uploads/2023/03/prettiest-swiss-mountain-villages-to-visit.jpg",
    "https://www.theultimatetravelcompany.co.uk/wp-content/uploads/2023/12/pyramids-giza-egypt-holidays.jpg",
  ],

  highlights: {
    bestTime: "November to March (cool & dry)",
    suitableFor: ["Families", "Couples", "Solo Travelers", "Groups"],
    popularFor: [
      "Beaches",
      "Sunsets",
      "Seafood",
      "Water Sports",
      "Photography",
    ],
    costLevel: "Low",
    avgDuration: "2-3 days",
  },

  stays: {
    types: [
      {
        category: "Hotels",
        description: "Beachfront & city center options",
        priceRange: "1,500 - 8,000 BDT/night",
      },
      {
        category: "Resorts",
        description: "Luxury beachside properties",
        priceRange: "5,000 - 20,000 BDT/night",
      },
      {
        category: "Guesthouses",
        description: "Budget-friendly local stays",
        priceRange: "800 - 2,500 BDT/night",
      },
    ],
    suggested: [
      {
        name: "Ocean Paradise Hotel & Resort",
        priceRange: "8,000 - 15,000 BDT",
        rating: 4.5,
        distance: "2 km from beach",
      },
      {
        name: "Long Beach Hotel",
        priceRange: "3,500 - 6,000 BDT",
        rating: 4.2,
        distance: "Beachfront",
      },
      {
        name: "Sea Pearl Beach Resort",
        priceRange: "12,000 - 25,000 BDT",
        rating: 4.7,
        distance: "Beachfront",
      },
      {
        name: "Hotel The Cox Today",
        priceRange: "2,000 - 4,000 BDT",
        rating: 4.0,
        distance: "1 km from beach",
      },
    ],
  },

  attractions: [
    {
      name: "Inani Beach",
      distance: "32 km",
      description: "Crystal clear water & coral stones",
      tag: "Nature",
      image_url:
        "https://www.outlooktravelmag.com/media/bali-1-1679062958.profileImage.2x-scaled-webp.webp",
    },
    {
      name: "Himchari National Park",
      distance: "18 km",
      description: "Waterfall & lush green hills",
      tag: "Nature",
      image_url:
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/e2/f8/43/longest-sea-beach-in.jpg?w=1100&h=1100&s=1",
    },
    {
      name: "Marine Drive",
      distance: "5 km",
      description: "Scenic coastal road with ocean views",
      tag: "Photo Spot",
      image_url:
        "https://www.theultimatetravelcompany.co.uk/wp-content/uploads/2023/12/pyramids-giza-egypt-holidays.jpg",
    },
  ],

  transportation: {
    howToReach:
      "Fly to Cox's Bazar Airport (1h from Dhaka) or take bus/train to Chittagong then bus (4h)",
    localOptions: [
      { type: "CNG/Auto-rickshaw", priceRange: "100 - 300 BDT" },
      { type: "Taxi/Ride-share", priceRange: "300 - 800 BDT" },
      { type: "Motorcycle rental", priceRange: "500 - 1,000 BDT/day" },
      { type: "Private car rental", priceRange: "2,500 - 4,000 BDT/day" },
    ],
  },

  cuisine: {
    signature: [
      {
        name: "Shutki (dried fish)",
        tags: ["seafood", "nonveg"],
        isRecommended: true,
      },
      {
        name: "Fried Pomfret",
        tags: ["seafood", "nonveg", "halal"],
        isRecommended: false,
      },
      {
        name: "Prawn Curry",
        tags: ["seafood", "nonveg", "halal"],
        isRecommended: false,
      },
      {
        name: "Lobster BBQ",
        tags: ["seafood", "nonveg", "halal"],
        isRecommended: false,
      },
      {
        name: "Chitol Fish",
        tags: ["seafood", "nonveg", "halal"],
        isRecommended: false,
      },
    ],

    mustTryPlaces: [
      {
        name: "Jhawban Restaurant",
        signature_dish: ["Shutki Bhorta", "Chingri Malai Curry", "Hilsha Fry"],
        rating: 4.5,
        location: {
          area: "Cox's Bazar Main Road",
          long: 92.0051,
          lat: 21.4272,
        },
      },
      {
        name: "Poushee Restaurant",
        signature_dish: ["Fried Pomfret", "Prawn Curry", "Lobster BBQ"],
        rating: 4.6,
        location: {
          area: "Laboni Beach Point",
          long: 92.0103,
          lat: 21.4281,
        },
      },
      {
        name: "EFC (Excellent Fried Chicken)",
        signature_dish: [
          "Fried Chicken",
          "Crispy Prawn Roll",
          "Grilled Fish Platter",
        ],
        rating: 4.2,
        location: {
          area: "Hotel Motel Zone",
          long: 92.0127,
          lat: 21.4304,
        },
      },
      {
        name: "Sea Stone Cafe",
        signature_dish: [
          "Seafood Platter",
          "Crab Masala",
          "Lemon Grilled Fish",
        ],
        rating: 4.4,
        location: {
          area: "Sugandha Beach Point",
          long: 92.0148,
          lat: 21.4321,
        },
      },
    ],
  },

  activities: [
    { name: "Surfing lessons", priceRange: "500 - 1,500 BDT" },
    { name: "Beach bike riding", priceRange: "200 - 400 BDT/hour" },
    { name: "Boat trip to islands", priceRange: "1,000 - 3,000 BDT" },
    { name: "Paragliding", priceRange: "2,000 - 4,000 BDT" },
  ],

  visitInfo: {
    weather:
      "Tropical climate. Hot & humid in summer (Apr-Sep), pleasant in winter (Nov-Mar)",
    peakSeason: "November to February (crowded, higher prices)",
    festivals: "Pohela Boishakh (Bengali New Year - April)",
  },

  practicalInfo: {
    languages: ["Bengali", "English (tourist areas)", "Chittagonian dialect"],
    payment: ["Cash (primary)", "bKash/Nagad", "Cards (major hotels only)"],
    safety: [
      "Safe for tourists",
      "Watch belongings on crowded beaches",
      "Avoid swimming during high tide",
    ],
    customs: [
      "Modest dress appreciated",
      "Remove shoes at religious sites",
      "Ask before photographing locals",
    ],
  },
};