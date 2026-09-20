/**
 * Algorithmic Draw Weighting Engine
 * 
 * Defines how player participation, score count, and logging recency scale
 * player odds in Algorithmic Draw Mode.
 * 
 * FORMULA:
 * Total Weight W = BaseWeight (1.0) + (ScoreCountMultiplier * N) + RecencyBonus
 * 
 * - N = Number of valid Stableford scores logged in the rolling window (0 to 5).
 * - ScoreCountMultiplier = 0.25 (Adding 5 scores grants +1.25 weight).
 * - RecencyBonus:
 *    - Last score within 7 days: +0.50
 *    - Last score within 14 days: +0.25
 *    - Last score > 14 days or no scores: 0.00
 * 
 * Range of W: [1.00, 2.75]
 */

export interface PlayerScoreSummary {
  userId: string;
  scores: number[];
  mostRecentScoreDate?: string;
}

export function calculatePlayerWeight(
  scoreCount: number,
  mostRecentScoreDate?: string,
  referenceDate: Date = new Date()
): number {
  const baseWeight = 1.0;
  const clampedScores = Math.max(0, Math.min(scoreCount, 5));
  const scoreBonus = clampedScores * 0.25;

  let recencyBonus = 0.0;
  if (mostRecentScoreDate) {
    const scoreDate = new Date(mostRecentScoreDate);
    const diffTime = Math.abs(referenceDate.getTime() - scoreDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      recencyBonus = 0.5;
    } else if (diffDays <= 14) {
      recencyBonus = 0.25;
    }
  }

  const totalWeight = baseWeight + scoreBonus + recencyBonus;
  return Math.round(totalWeight * 100) / 100;
}
