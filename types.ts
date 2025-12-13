export interface Activity {
  name: string;
  description: string;
  time: string;
  category: 'Food' | 'Sightseeing' | 'Adventure' | 'Relaxation' | 'Culture' | 'Shopping' | 'Offbeat';
  locationHint?: string;
  openingHours?: string;
  duration?: string;
  price?: string;
  packingSuggestions?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  misc: number;
  currency: string;
  totalEstimated: number;
}

export interface TripItinerary {
  tripName: string;
  destination: string;
  summary: string;
  days: DayPlan[];
  budgetBreakdown: BudgetBreakdown;
}

export interface TripPreferences {
  destination: string;
  travelMonth: string;
  duration: number;
  travelers: string;
  budget: 'Budget' | 'Moderate' | 'Luxury';
  interests: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface LanguageTip {
  phrase: string;
  pronunciation: string;
  meaning: string;
}

export interface Souvenir {
  name: string;
  description: string;
  category: 'Traditional' | 'Food' | 'Art' | 'Modern' | 'Kitsch';
  priceRange: string;
  authenticityTip: string;
}

export interface SouvenirGuide {
  items: Souvenir[];
  negotiationStyle: 'Fixed Price' | 'Casual Bargaining' | 'Aggressive Bargaining';
  negotiationTips: string[];
  restrictedItems: string[];
  collectibleStamps: {
    name: string;
    location: string;
    description: string;
  }[];
}

export interface PackingCategory {
  category: string;
  items: string[];
}

export interface Song {
  title: string;
  artist: string;
  reason: string;
}
