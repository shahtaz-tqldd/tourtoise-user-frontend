import { TourDestination } from "./_types";

export const DESTINATIONS: TourDestination[] = [
	{
		id: "1",
		slug: "bali-paradise-retreat",
		name: "Bali Paradise Retreat",
		location: {
			country: "Indonesia",
			region: "Bali",
			coordinates: {
				latitude: -8.3405,
				longitude: 115.0920
			}
		},
		description: "Experience the magical island of Bali with its stunning beaches, ancient temples, and vibrant culture. This tour includes visits to Ubud's rice terraces, traditional dance performances, and relaxing beach time.",
		images: {
			thumbnail: "https://www.outlooktravelmag.com/media/bali-1-1679062958.profileImage.2x-scaled-webp.webp",
			gallery: [
				"https://www.outlooktravelmag.com/media/bali-1-1679062958.profileImage.2x-scaled-webp.webp",
				"https://www.winetraveler.com/wp-content/uploads/2023/03/prettiest-swiss-mountain-villages-to-visit.jpg",
				"https://www.theultimatetravelcompany.co.uk/wp-content/uploads/2023/12/pyramids-giza-egypt-holidays.jpg",
			]
		},
		rating: 4.8,
		reviewCount: 324,
		price: {
			min: 899,
			max: 1599,
			currency: "USD"
		},
		duration: {
			minDays: 5,
			maxDays: 7
		},
		categories: ["Beach", "Cultural", "Adventure"],
		highlights: [
			"Visit Tanah Lot Temple at sunset",
			"Explore Ubud's art markets",
			"Traditional Balinese cooking class",
			"Snorkeling in Blue Lagoon",
			"Rice terrace trekking in Tegallalang"
		],
		included: [
			"Accommodation in 4-star hotels",
			"Daily breakfast",
			"Airport transfers",
			"English-speaking guide",
			"Entrance fees to attractions"
		],
		excluded: [
			"International flights",
			"Lunch and dinner",
			"Personal expenses",
			"Travel insurance"
		],
		difficulty: "Easy",
		bestSeason: ["April", "May", "June", "July", "August", "September", "October"],
		languages: ["English", "Indonesian"],
		groupSize: {
			min: 8,
			max: 20
		},
		accommodation: {
			type: "Hotel",
			rating: 4
		},
		transportation: ["Minibus", "Boat"],
		activities: [
			"Sightseeing",
			"Snorkeling",
			"Cooking Class",
			"Temple Visits",
			"Beach Relaxation"
		],
		meals: {
			included: ["Breakfast"],
			excluded: ["Lunch", "Dinner"]
		},
		guide: {
			available: true,
			languages: ["English", "Indonesian"]
		},
		cancellationPolicy: {
			freeCancellation: true,
			deadline: "7 days before departure",
			fee: "10% of tour price"
		},
		bookingInfo: {
			availability: true,
			nextAvailableDate: "2023-06-15",
			bookingUrl: "#book-bali"
		},
		tags: ["tropical", "island", "temple", "beach", "culture"],
		featured: true
	},
	{
		id: "2",
		slug: "swiss-alps-adventure",
		name: "Swiss Alps Adventure",
		location: {
			country: "Switzerland",
			region: "Alps",
			coordinates: {
				latitude: 46.8182,
				longitude: 8.2275
			}
		},
		description: "Discover the breathtaking beauty of the Swiss Alps with majestic mountain peaks, pristine lakes, and charming alpine villages. This adventure includes hiking, scenic train rides, and local culinary experiences.",
		images: {
			thumbnail: "https://www.winetraveler.com/wp-content/uploads/2023/03/prettiest-swiss-mountain-villages-to-visit.jpg",
			gallery: [
				"https://picsum.photos/seed/swiss1/800/600.jpg",
				"https://picsum.photos/seed/swiss2/800/600.jpg",
				"https://picsum.photos/seed/swiss3/800/600.jpg"
			]
		},
		rating: 4.9,
		reviewCount: 256,
		price: {
			min: 1899,
			max: 2899,
			currency: "USD"
		},
		duration: {
			minDays: 7,
			maxDays: 10
		},
		categories: ["Mountain", "Adventure", "Nature"],
		highlights: [
			"Jungfraujoch - Top of Europe experience",
			"Scenic train ride on the Glacier Express",
			"Hiking in the Matterhorn region",
			"Lake cruise on Lake Geneva",
			"Visit to traditional Swiss cheese factory"
		],
		included: [
			"Accommodation in mountain lodges",
			"All meals",
			"Swiss Travel Pass",
			"Mountain guide",
			"Equipment rental"
		],
		excluded: [
			"International flights",
			"Personal expenses",
			"Alcoholic beverages",
			"Travel insurance"
		],
		difficulty: "Moderate",
		bestSeason: ["June", "July", "August", "September"],
		languages: ["English", "German", "French"],
		groupSize: {
			min: 6,
			max: 15
		},
		accommodation: {
			type: "Mountain Lodge",
			rating: 4
		},
		transportation: ["Train", "Cable Car", "Hiking"],
		activities: [
			"Hiking",
			"Sightseeing",
			"Train Rides",
			"Photography",
			"Local Cuisine Tasting"
		],
		meals: {
			included: ["Breakfast", "Lunch", "Dinner"]
		},
		guide: {
			available: true,
			languages: ["English", "German"]
		},
		cancellationPolicy: {
			freeCancellation: true,
			deadline: "14 days before departure",
			fee: "15% of tour price"
		},
		bookingInfo: {
			availability: true,
			nextAvailableDate: "2023-07-10",
			bookingUrl: "#book-swiss"
		},
		tags: ["mountain", "hiking", "nature", "adventure", "scenic"],
		featured: true
	},
	{
		id: "3",
		slug: "cairo-egypt",
		name: "Cairo, Egypt",
		location: {
			country: "Egypt",
			region: "Cairo & Nile Valley",
			coordinates: {
				latitude: 26.8206,
				longitude: 30.8025
			}
		},
		description: "Journey back in time to explore the wonders of ancient Egypt. Visit the Great Pyramids of Giza, sail down the Nile River, and discover the treasures of the pharaohs in this historical adventure.",
		images: {
			thumbnail: "https://www.theultimatetravelcompany.co.uk/wp-content/uploads/2023/12/pyramids-giza-egypt-holidays.jpg",
			gallery: [
				"https://picsum.photos/seed/egypt1/800/600.jpg",
				"https://picsum.photos/seed/egypt2/800/600.jpg",
				"https://picsum.photos/seed/egypt3/800/600.jpg"
			]
		},
		rating: 4.7,
		reviewCount: 189,
		price: {
			min: 1299,
			max: 2199,
			currency: "USD"
		},
		duration: {
			minDays: 8,
			maxDays: 10
		},
		categories: ["Historical", "Cultural", "Adventure"],
		highlights: [
			"Visit the Great Pyramids and Sphinx",
			"Explore the Valley of the Kings",
			"Nile River cruise on a traditional dahabiya",
			"Tour the Egyptian Museum in Cairo",
			"Visit the temples of Luxor and Karnak"
		],
		included: [
			"Accommodation in 4-star hotels",
			"Nile cruise accommodation",
			"Most meals",
			"Egyptologist guide",
			"Entrance fees to all sites"
		],
		excluded: [
			"International flights",
			"Visa fees",
			"Personal expenses",
			"Travel insurance"
		],
		difficulty: "Easy",
		bestSeason: ["October", "November", "December", "January", "February", "March", "April"],
		languages: ["English", "Arabic"],
		groupSize: {
			min: 10,
			max: 25
		},
		accommodation: {
			type: "Hotel & Nile Cruise",
			rating: 4
		},
		transportation: ["Bus", "Nile Cruise", "Domestic Flight"],
		activities: [
			"Sightseeing",
			"Museum Tours",
			"Nile Cruise",
			"Camel Ride",
			"Shopping in Bazaars"
		],
		meals: {
			included: ["Breakfast", "Lunch", "Dinner"]
		},
		guide: {
			available: true,
			languages: ["English", "Arabic"]
		},
		cancellationPolicy: {
			freeCancellation: true,
			deadline: "10 days before departure",
			fee: "20% of tour price"
		},
		bookingInfo: {
			availability: true,
			nextAvailableDate: "2023-10-20",
			bookingUrl: "#book-egypt"
		},
		tags: ["history", "ancient", "pyramid", "nile", "museum"],
		featured: true
	},
	{
		id: "4",
		slug: "japanese-culture-journey",
		name: "Japanese Cultural Journey",
		location: {
			country: "Japan",
			region: "Tokyo, Kyoto & Beyond",
			coordinates: {
				latitude: 35.6762,
				longitude: 139.6503
			}
		},
		description: "Immerse yourself in the fascinating culture of Japan, from the bustling streets of Tokyo to the serene temples of Kyoto. Experience traditional tea ceremonies, stay in a ryokan, and witness the beauty of Mount Fuji.",
		images: {
			thumbnail: "https://img.pikbest.com/origin/10/04/24/48ipIkbEsTxjN.jpg!w700wp",
			gallery: [
				"https://picsum.photos/seed/japan1/800/600.jpg",
				"https://picsum.photos/seed/japan2/800/600.jpg",
				"https://picsum.photos/seed/japan3/800/600.jpg"
			]
		},
		rating: 4.9,
		reviewCount: 412,
		price: {
			min: 2499,
			max: 3799,
			currency: "USD"
		},
		duration: {
			minDays: 10,
			maxDays: 14
		},
		categories: ["Cultural", "Urban", "Nature"],
		highlights: [
			"Visit ancient temples in Kyoto",
			"Experience a traditional tea ceremony",
			"Explore Tokyo's vibrant neighborhoods",
			"View Mount Fuji from Hakone",
			"Stay overnight in a traditional ryokan"
		],
		included: [
			"Accommodation in hotels and ryokans",
			"Daily breakfast",
			"Japan Rail Pass",
			"English-speaking guide",
			"Cultural experiences"
		],
		excluded: [
			"International flights",
			"Most lunches and dinners",
			"Personal expenses",
			"Travel insurance"
		],
		difficulty: "Easy",
		bestSeason: ["March", "April", "May", "October", "November"],
		languages: ["English", "Japanese"],
		groupSize: {
			min: 8,
			max: 18
		},
		accommodation: {
			type: "Hotel & Ryokan",
			rating: 4
		},
		transportation: ["Train", "Bus", "Walking"],
		activities: [
			"Sightseeing",
			"Cultural Experiences",
			"Temple Visits",
			"Shopping",
			"Museum Tours"
		],
		meals: {
			included: ["Breakfast"],
			excluded: ["Lunch", "Dinner"]
		},
		guide: {
			available: true,
			languages: ["English", "Japanese"]
		},
		cancellationPolicy: {
			freeCancellation: true,
			deadline: "14 days before departure",
			fee: "15% of tour price"
		},
		bookingInfo: {
			availability: true,
			nextAvailableDate: "2023-04-05",
			bookingUrl: "#book-japan"
		},
		tags: ["culture", "temple", "city", "traditional", "food"],
		featured: true
	},
	{
		id: "5",
		slug: "phi-phi-isand",
		name: "Phi Phi Island",
		location: {
			country: "Thailand",
			region: "Phuket, Thailand",
			coordinates: {
				latitude: -1.2921,
				longitude: 36.8219
			}
		},
		description: "Embark on an unforgettable African safari adventure in Kenya. Witness the incredible wildlife of the Maasai Mara, including the Big Five, and experience the rich culture of the Maasai people.",
		images: {
			thumbnail: "https://simbaseatrips.com/wp-content/uploads/2023/07/phi-phi-size-featured.jpg",
			gallery: [
				"https://picsum.photos/seed/kenya1/800/600.jpg",
				"https://picsum.photos/seed/kenya2/800/600.jpg",
				"https://picsum.photos/seed/kenya3/800/600.jpg"
			]
		},
		rating: 4.8,
		reviewCount: 267,
		price: {
			min: 2799,
			max: 4299,
			currency: "USD"
		},
		duration: {
			minDays: 7,
			maxDays: 9
		},
		categories: ["Wildlife", "Adventure", "Nature"],
		highlights: [
			"Game drives in Maasai Mara",
			"Witness the Great Migration (seasonal)",
			"Visit to a Maasai village",
			"Hot air balloon safari over the savanna",
			"Lake Nakuru flamingo watching"
		],
		included: [
			"Accommodation in safari lodges",
			"All meals",
			"Game drives in 4x4 vehicles",
			"Park fees",
			"Professional safari guide"
		],
		excluded: [
			"International flights",
			"Visa fees",
			"Alcoholic beverages",
			"Travel insurance"
		],
		difficulty: "Easy",
		bestSeason: ["July", "August", "September", "October", "January", "February"],
		languages: ["English", "Swahili"],
		groupSize: {
			min: 6,
			max: 12
		},
		accommodation: {
			type: "Safari Lodge",
			rating: 4
		},
		transportation: ["4x4 Safari Vehicle", "Domestic Flight"],
		activities: [
			"Game Drives",
			"Wildlife Photography",
			"Cultural Visits",
			"Hot Air Balloon",
			"Nature Walks"
		],
		meals: {
			included: ["Breakfast", "Lunch", "Dinner"]
		},
		guide: {
			available: true,
			languages: ["English", "Swahili"]
		},
		cancellationPolicy: {
			freeCancellation: true,
			deadline: "21 days before departure",
			fee: "25% of tour price"
		},
		bookingInfo: {
			availability: true,
			nextAvailableDate: "2023-08-15",
			bookingUrl: "#book-kenya"
		},
		tags: ["safari", "wildlife", "africa", "adventure", "nature"],
		featured: true
	},
	{
		id: "6",
		slug: "greek-island-hopping",
		name: "Greek Islands Hopping",
		location: {
			country: "Greece",
			region: "Cyclades Islands",
			coordinates: {
				latitude: 37.9838,
				longitude: 23.7275
			}
		},
		description: "Discover the enchanting Greek islands with their whitewashed villages, crystal-clear waters, and ancient history. This tour takes you to the most beautiful islands including Santorini, Mykonos, and Crete.",
		images: {
			thumbnail: "https://sunsettravellers.com/wp-content/uploads/2018/08/church-2020258_1920.jpg.webp",
			gallery: [
				"https://picsum.photos/seed/greece1/800/600.jpg",
				"https://picsum.photos/seed/greece2/800/600.jpg",
				"https://picsum.photos/seed/greece3/800/600.jpg"
			]
		},
		rating: 4.7,
		reviewCount: 298,
		price: {
			min: 1999,
			max: 3299,
			currency: "USD"
		},
		duration: {
			minDays: 9,
			maxDays: 12
		},
		categories: ["Beach", "Cultural", "Island"],
		highlights: [
			"Watch the sunset in Oia, Santorini",
			"Explore the ancient ruins of Knossos in Crete",
			"Enjoy the nightlife in Mykonos",
			"Taste authentic Greek cuisine",
			"Relax on pristine beaches"
		],
		included: [
			"Accommodation in boutique hotels",
			"Daily breakfast",
			"Ferry tickets between islands",
			"Guided tours of archaeological sites",
			"Airport transfers"
		],
		excluded: [
			"International flights",
			"Most lunches and dinners",
			"Personal expenses",
			"Travel insurance"
		],
		difficulty: "Easy",
		bestSeason: ["May", "June", "September", "October"],
		languages: ["English", "Greek"],
		groupSize: {
			min: 8,
			max: 20
		},
		accommodation: {
			type: "Boutique Hotel",
			rating: 4
		},
		transportation: ["Ferry", "Bus", "Walking"],
		activities: [
			"Beach Relaxation",
			"Sightseeing",
			"Boat Trips",
			"Wine Tasting",
			"Archaeological Tours"
		],
		meals: {
			included: ["Breakfast"],
			excluded: ["Lunch", "Dinner"]
		},
		guide: {
			available: true,
			languages: ["English", "Greek"]
		},
		cancellationPolicy: {
			freeCancellation: true,
			deadline: "14 days before departure",
			fee: "15% of tour price"
		},
		bookingInfo: {
			availability: true,
			nextAvailableDate: "2023-05-20",
			bookingUrl: "#book-greece"
		},
		tags: ["island", "beach", "history", "culture", "mediterranean"],
		featured: true
	}
];