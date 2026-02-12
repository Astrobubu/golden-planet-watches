import type { LiveFaceData } from "@/lib/watch-editor-types";
import { getSavedWatches } from "@/lib/watch-editor-storage";

export interface Watch {
  id: string;
  brand: string;
  model: string;
  reference_number: string;
  description: string;
  base_price: number;
  margin_percent: number;
  condition_rating: string;
  year: number;
  dial_color: string;
  case_material: string;
  case_size_mm: number;
  movement_type: string;
  source_image_url?: string; // original upload, NOT shown in gallery, used for editing
  original_image_url: string;
  ai_generated_images: string[];
  is_featured: boolean;
  is_hero: boolean;
  live_face_data?: LiveFaceData;
}

export const MOCK_WATCHES: Watch[] = [
  {
    id: "1",
    brand: "Rolex",
    model: "Submariner Date",
    reference_number: "126610LN",
    description: "The iconic Rolex Submariner in Oystersteel with a date complication. Black Cerachrom bezel, 41mm case.",
    base_price: 45875,
    margin_percent: 10,
    condition_rating: "A+",
    year: 2023,
    dial_color: "Black",
    case_material: "Oystersteel",
    case_size_mm: 41,
    movement_type: "Automatic",
    original_image_url: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80",
    ai_generated_images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&q=80",
      "https://images.unsplash.com/photo-1627971533804-1fab104be498?w=800&q=80",
    ],
    is_featured: true,
    is_hero: true,
  },
  {
    id: "2",
    brand: "Audemars Piguet",
    model: "Royal Oak",
    reference_number: "15500ST",
    description: "The legendary Royal Oak in stainless steel. Blue Grande Tapisserie dial, 41mm case.",
    base_price: 139460,
    margin_percent: 8,
    condition_rating: "A",
    year: 2022,
    dial_color: "Blue",
    case_material: "Stainless Steel",
    case_size_mm: 41,
    movement_type: "Automatic",
    original_image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    ai_generated_images: [
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
      "https://images.unsplash.com/photo-1639037687537-1f12e2a8e47a?w=800&q=80",
    ],
    is_featured: true,
    is_hero: true,
  },
  {
    id: "3",
    brand: "Patek Philippe",
    model: "Nautilus",
    reference_number: "5711/1A-010",
    description: "The legendary Nautilus in stainless steel with a blue gradient dial.",
    base_price: 311950,
    margin_percent: 7,
    condition_rating: "A-",
    year: 2021,
    dial_color: "Blue",
    case_material: "Stainless Steel",
    case_size_mm: 40,
    movement_type: "Automatic",
    original_image_url: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
    ai_generated_images: [
      "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=80",
      "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800&q=80",
      "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=800&q=80",
    ],
    is_featured: true,
    is_hero: true,
  },
  {
    id: "4",
    brand: "Rolex",
    model: "Daytona",
    reference_number: "116500LN",
    description: "The Rolex Cosmograph Daytona in Oystersteel with white dial and Cerachrom bezel.",
    base_price: 102760,
    margin_percent: 10,
    condition_rating: "B+",
    year: 2020,
    dial_color: "White",
    case_material: "Oystersteel",
    case_size_mm: 40,
    movement_type: "Automatic",
    original_image_url: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800&q=80",
    ai_generated_images: [
      "https://images.unsplash.com/photo-1509941943102-10c232fc1571?w=800&q=80",
      "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?w=800&q=80",
      "https://images.unsplash.com/photo-1629629775268-b64e9cee5f4e?w=800&q=80",
    ],
    is_featured: true,
    is_hero: false,
  },
  {
    id: "5",
    brand: "Omega",
    model: "Speedmaster Professional",
    reference_number: "310.30.42.50.01.001",
    description: "The Moonwatch — Omega Speedmaster Professional with hesalite crystal.",
    base_price: 22754,
    margin_percent: 12,
    condition_rating: "A",
    year: 2023,
    dial_color: "Black",
    case_material: "Stainless Steel",
    case_size_mm: 42,
    movement_type: "Manual",
    original_image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    ai_generated_images: [
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80",
      "https://images.unsplash.com/photo-1495856458515-0637185db551?w=800&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
    ],
    is_featured: false,
    is_hero: false,
  },
  {
    id: "6",
    brand: "Cartier",
    model: "Santos de Cartier",
    reference_number: "WSSA0018",
    description: "The Cartier Santos in stainless steel with a white silvered dial.",
    base_price: 27525,
    margin_percent: 10,
    condition_rating: "B",
    year: 2022,
    dial_color: "Silver",
    case_material: "Stainless Steel",
    case_size_mm: 39.8,
    movement_type: "Automatic",
    original_image_url: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?w=800&q=80",
    ai_generated_images: [
      "https://images.unsplash.com/photo-1619946794135-5bc917a27793?w=800&q=80",
      "https://images.unsplash.com/photo-1629041236498-3be573c5bfca?w=800&q=80",
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&q=80",
    ],
    is_featured: false,
    is_hero: false,
  },
];

export function getDisplayPrice(watch: Watch): number {
  return Math.round(watch.base_price * (1 + watch.margin_percent / 100));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);
}

export function getAllWatches(): Watch[] {
  const saved = getSavedWatches();
  const ids = new Set(saved.map((w) => w.id));
  return [...saved, ...MOCK_WATCHES.filter((w) => !ids.has(w.id))];
}

