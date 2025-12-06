export interface TourDestination {
	id: string;
	name: string;
	slug: string;
	location: {
		country: string;
		region: string;
		coordinates?: {
			latitude: number;
			longitude: number;
		};
	};
	description: string;
	images: {
		thumbnail: string;
		gallery: string[];
	};
	rating: number;
	reviewCount: number;
	price: {
		min: number;
		max: number;
		currency: string;
	};
	duration: {
		minDays: number;
		maxDays: number;
	};
	categories: string[];
	highlights: string[];
	included: string[];
	excluded: string[];
	difficulty: "Easy" | "Moderate" | "Challenging";
	bestSeason: string[];
	languages: string[];
	groupSize: {
		min: number;
		max: number;
	};
	ageRestriction?: {
		min?: number;
		max?: number;
	};
	accommodation: {
		type: string;
		rating?: number;
	};
	transportation: string[];
	activities: string[];
	meals: {
		included: string[];
		excluded?: string[];
	};
	guide: {
		available: boolean;
		languages: string[];
	};
	cancellationPolicy: {
		freeCancellation: boolean;
		deadline: string;
		fee: string;
	};
	bookingInfo: {
		availability: boolean;
		nextAvailableDate?: string;
		bookingUrl?: string;
	};
	tags: string[];
	featured: boolean;
}
