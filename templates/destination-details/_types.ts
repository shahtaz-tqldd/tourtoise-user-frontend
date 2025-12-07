export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
}

export interface Destination {
  id: string;
  name: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  tags: string[];
  description: string;
  images: string[];

  highlights: {
    bestTime: string;
    suitableFor: string[];
    popularFor: string[];
    costLevel: "Low" | "Medium" | "High";
    avgDuration: string;
  };

  stays: {
    types: Array<{
      category: string;
      description: string;
      priceRange: string;
    }>;
    suggested: Array<{
      name: string;
      priceRange: string;
      rating: number;
      distance: string;
    }>;
  };

  attractions: Array<{
    name: string;
    distance: string;
    description: string;
    tag: string;
    image_url: string;
  }>;

  transportation: {
    howToReach: string;
    localOptions: Array<{
      type: string;
      priceRange: string;
    }>;
  };

  cuisine: {
    signature: Array<{
      name: string;
      tags: string[];
      isRecommended: boolean;
    }>;
    mustTryPlaces: Array<{
      name: string;
      signature_dish: string[];
      rating: number;
      location: {
        area: string;
        long: number;
        lat: number;
      };
    }>;
  };

  activities: Array<{
    name: string;
    priceRange: string;
  }>;

  visitInfo: {
    weather: string;
    peakSeason: string;
    festivals: string;
  };

  practicalInfo: {
    languages: string[];
    payment: string[];
    safety: string[];
    customs: string[];
  };
}