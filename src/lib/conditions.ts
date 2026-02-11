export const CONDITIONS = {
  "A+": { label: "Pristine", description: "Like new, no marks whatsoever", color: "text-emerald-400" },
  "A":  { label: "Excellent", description: "Minimal signs of wear", color: "text-emerald-300" },
  "A-": { label: "Very Good", description: "Light surface marks", color: "text-green-300" },
  "B+": { label: "Good", description: "Minor visible wear", color: "text-yellow-300" },
  "B":  { label: "Fair", description: "Visible scratches", color: "text-yellow-400" },
  "B-": { label: "Below Average", description: "Noticeable damage", color: "text-orange-400" },
  "C":  { label: "Needs Service", description: "Requires repair", color: "text-red-400" },
} as const;

export type ConditionRating = keyof typeof CONDITIONS;
