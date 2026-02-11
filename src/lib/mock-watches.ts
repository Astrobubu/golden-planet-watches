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
  original_image_url: string;
  ai_generated_images: string[];
  is_featured: boolean;
  is_hero: boolean;
}

export const MOCK_WATCHES: Watch[] = [
  {
    id: "1",
    brand: "Rolex",
    model: "Submariner Date",
    reference_number: "126610LN",
    description: "The iconic Rolex Submariner in Oystersteel with a date complication. Black Cerachrom bezel, 41mm case.",
    base_price: 12500,
    margin_percent: 10,
    condition_rating: "A+",
    year: 2023,
    dial_color: "Black",
    case_material: "Oystersteel",
    case_size_mm: 41,
    movement_type: "Automatic",
    original_image_url: "",
    ai_generated_images: [],
    is_featured: true,
    is_hero: true,
  },
  {
    id: "2",
    brand: "Audemars Piguet",
    model: "Royal Oak",
    reference_number: "15500ST",
    description: "The legendary Royal Oak in stainless steel. Blue Grande Tapisserie dial, 41mm case.",
    base_price: 38000,
    margin_percent: 8,
    condition_rating: "A",
    year: 2022,
    dial_color: "Blue",
    case_material: "Stainless Steel",
    case_size_mm: 41,
    movement_type: "Automatic",
    original_image_url: "",
    ai_generated_images: [],
    is_featured: true,
    is_hero: false,
  },
  {
    id: "3",
    brand: "Patek Philippe",
    model: "Nautilus",
    reference_number: "5711/1A-010",
    description: "The legendary Nautilus in stainless steel with a blue gradient dial.",
    base_price: 85000,
    margin_percent: 7,
    condition_rating: "A-",
    year: 2021,
    dial_color: "Blue",
    case_material: "Stainless Steel",
    case_size_mm: 40,
    movement_type: "Automatic",
    original_image_url: "",
    ai_generated_images: [],
    is_featured: true,
    is_hero: false,
  },
  {
    id: "4",
    brand: "Rolex",
    model: "Daytona",
    reference_number: "116500LN",
    description: "The Rolex Cosmograph Daytona in Oystersteel with white dial and Cerachrom bezel.",
    base_price: 28000,
    margin_percent: 10,
    condition_rating: "B+",
    year: 2020,
    dial_color: "White",
    case_material: "Oystersteel",
    case_size_mm: 40,
    movement_type: "Automatic",
    original_image_url: "",
    ai_generated_images: [],
    is_featured: true,
    is_hero: false,
  },
  {
    id: "5",
    brand: "Omega",
    model: "Speedmaster Professional",
    reference_number: "310.30.42.50.01.001",
    description: "The Moonwatch — Omega Speedmaster Professional with hesalite crystal.",
    base_price: 6200,
    margin_percent: 12,
    condition_rating: "A",
    year: 2023,
    dial_color: "Black",
    case_material: "Stainless Steel",
    case_size_mm: 42,
    movement_type: "Manual",
    original_image_url: "",
    ai_generated_images: [],
    is_featured: false,
    is_hero: false,
  },
  {
    id: "6",
    brand: "Cartier",
    model: "Santos de Cartier",
    reference_number: "WSSA0018",
    description: "The Cartier Santos in stainless steel with a white silvered dial.",
    base_price: 7500,
    margin_percent: 10,
    condition_rating: "B",
    year: 2022,
    dial_color: "Silver",
    case_material: "Stainless Steel",
    case_size_mm: 39.8,
    movement_type: "Automatic",
    original_image_url: "",
    ai_generated_images: [],
    is_featured: false,
    is_hero: false,
  },
];

export function getDisplayPrice(watch: Watch): number {
  return Math.round(watch.base_price * (1 + watch.margin_percent / 100));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}
