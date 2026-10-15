export type TabKey = "people" | "products" | "meetups";

export interface SocialLinks {
  x?: string;
  github?: string;
  website?: string;
  linkedin?: string;
}

export interface Maker {
  id: string;
  name: string;
  username: string;
  role: string;
  bio: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  skills: string[];
  interests: string[];
  category: string;
  socials: SocialLinks;
  joinedAt: string;
  followers: number;
  building: string[];
  activity: { text: string; when: string }[];
  trending?: boolean;
  color: string;
}

export interface Business {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  founderId: string;
  website: string;
  socials: SocialLinks;
  mrr: string;
  users: string;
  color: string;
  sponsored?: SponsoredTier | null;
}

export type SponsoredTier = "pin" | "boat" | "ship" | "yacht" | "landmark";

export interface SponsoredPlacement {
  id: string;
  businessId: string;
  tier: SponsoredTier;
  lat: number;
  lng: number;
  label: string;
}

export interface Meetup {
  id: string;
  title: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string;
  attendees: number;
  host: string;
  tags: string[];
}

export interface CityIndex {
  name: string;
  country: string;
  lat: number;
  lng: number;
  zoom: number;
  aliases: string[];
}

export interface PromotionPlan {
  tier: SponsoredTier;
  name: string;
  price: number;
  blurb: string;
  perks: string[];
  scale: number;
}
