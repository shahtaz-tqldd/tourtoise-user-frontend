import {
	MapPin,
	Compass,
	Sparkles,
	Heart,
} from "lucide-react";
import { Feature, PopularSearch } from "./_types";

// Data
export const features: Feature[] = [
	{
		id: 1,
		icon: Compass,
		iconBgColor: "bg-orange-50",
		iconColor: "text-orange-600",
		title: "Explore Destinations",
		description:
			"Discover amazing places around the world with detailed information",
	},
	{
		id: 2,
		icon: Sparkles,
		iconBgColor: "bg-emerald-50",
		iconColor: "text-primary",
		title: "AI Trip Planner",
		description:
			"Get optimized itineraries tailored to your preferences and schedule",
	},
	{
		id: 3,
		icon: MapPin,
		iconBgColor: "bg-blue-50",
		iconColor: "text-blue-600",
		title: "Live Guidance",
		description: "Navigate with real-time assistance during your journey",
	},
	{
		id: 4,
		icon: Heart,
		iconBgColor: "bg-pink-50",
		iconColor: "text-pink-600",
		title: "Personalized Picks",
		description:
			"Find places that match your unique interests and travel style",
	},
];

export const popularSearches: PopularSearch[] = [
	{ id: 1, name: "ABC, Nepal" },
	{ id: 2, name: "Phi Phi Island" },
	{ id: 3, name: "Bali Indonesia" },
	{ id: 4, name: "Bandarban" },
];