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
    region: string;
    country: string;
    long: number;
    lat: number;
  };
  tags: string[];
  description: string;
  images: string[];

  highlights: {
    best_time: string;
    suitable_for: string[];
    popular_for: string[];
    cost_level: "Low" | "Medium" | "High";
    avg_duration: string;
  };

  stays: {
    types: Array<{
      category: string;
      description: string;
      price_range: string;
    }>;
    suggested: Array<{
      name: string;
      price_range: string;
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
    how_to_reach: string;
    local_options: Array<{
      type: string;
      price_range: string;
    }>;
  };

  cuisine: {
    signature: Array<{
      name: string;
      tags: string[];
      is_recommended: boolean;
    }>;
    restaurants: Array<{
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
    price_range: string;
  }>;

  visit_info: {
    weather: string;
    peak_season: string;
    festivals: string;
  };

  practical_info: {
    languages: string[];
    payment: string[];
    safety: string[];
    customs: string[];
  };
}