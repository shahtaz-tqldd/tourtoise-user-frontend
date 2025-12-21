// types.ts
export interface ImageDetails {
  image_url: string;
  alt_text: string;
}

export interface TourDestinationBase {
  id: string;
  name: string;
  description: string;
  tags: string[];
  images: ImageDetails[];
  best_time: string;
  cost_level: string;
  avg_duration: string;
  country: string;
  region: string;
  slug: string;
  featured?: boolean;
}

export interface DestinationDetails {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  best_time: string;
  cost_level: string;
  avg_duration: string;
  suitable_for: string[];
  popular_for: string[];
  country: string;
  region: string;
  longitude: string;
  latitude: string;
  timezone: string;
  weather: string;
  peak_season: string;
  festivals: string;
  languages: string[];
  payment_methods: string[];
  safety_tips: string;
  customs: string;
  how_to_reach: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime;

  images: ImageDetails[];
  attractions: Attraction[];
  transportation_options: TransportationOption[];
  signature_dishes: SignatureDish[];
  accommodation_types: AccommodationType[];
  accommodations: Accommodation[];
  activities: Activity[];
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  tag: string;
  entry_fee: string;
  opening_hours: string;
  is_recommended: boolean;
  region: string;
  best_time_to_visit: string;
  available_transports: string[];
  longitude: string;
  latitude: string;
  images: ImageDetails[];
}
export interface TransportationOption {
  id: string;
  price_range: string;
  availability: string;
  description: string;
  transport_ref: TransportRef;
}

export interface TransportRef {
  id: string;
  name: string;
  description: string;
}

export interface SignatureDish {
  id: string;
  name: string;
  tags: string[];
  dietary_info: string[];
  price_range: string;
  is_recommended: boolean;
  local_notes: string;
}
export interface AccommodationType {
  id: string;
  price_range: string;
  availability: string;
  description: string;
  type_ref: AccommodationTypeRef;
}

export interface AccommodationTypeRef {
  id: string;
  name: string;
  description: string;
}
export interface Accommodation {
  id: string;
  name: string;
  price_range: string;
  rating: string;
  distance: string;
  region: string;
  longitude: string;
  latitude: string;
  phone: string;
  email: string;
  website: string;
  accommodation_type: AccommodationType;
}
export interface Activity {
  id: string;
  price_range: string;
  duration: string;
  best_season: string;
  booking_required: boolean;
  is_popular: boolean;
  description: string;
  activity_ref: ActivityRef;
}

export interface ActivityRef {
  id: string;
  name: string;
  description: string;
  category: string | null;
}

