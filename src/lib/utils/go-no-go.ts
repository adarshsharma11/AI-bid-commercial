import type { AiRecommendation } from "@/types/domain";

export type WeightedScore = {
  score: number;
  weight: number;
};

export const GO_THRESHOLD = 70;
export const REVIEW_THRESHOLD = 45;

export function scoreGoNoGo(criteria: WeightedScore[]): number {
  const weight = criteria.reduce((sum, item) => sum + item.weight, 0);
  if (weight <= 0) return 0;
  const total = criteria.reduce((sum, item) => sum + item.score * item.weight, 0);
  return Math.round(total / weight);
}

export function recommendFromScore(score: number): AiRecommendation {
  if (score >= GO_THRESHOLD) return "go";
  if (score >= REVIEW_THRESHOLD) return "review";
  return "no_go";
}
