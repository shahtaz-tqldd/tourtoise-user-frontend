import { LucideIcon } from "lucide-react";

export interface Feature {
	id: number;
	icon: LucideIcon;
	iconBgColor: string;
	iconColor: string;
	title: string;
	description: string;
}

export interface PopularSearch {
	id: number;
	name: string;
}
