/**
 * Digital Heroes Custom Draw Engine (Server Domain)
 * Implements pure random and algorithmic draws, prize pool distribution,
 * tie splitting, jackpot rollover logic, and unique set-intersection match calculations.
 */

import { calculatePlayerWeight, PlayerScoreSummary } from "./weighting";

export type DrawMode = "random" | "algorithmic";
export type DrawStatus = "draft" | "simulated" | "published";

export interface DrawConfig {
  drawType: DrawMode;
  activeMonthlySubscribers: number;
  activeYearlySubscribers: number;
  previousRolloverAmount: number;
  monthlyPlanPrice?: number; // default $19
  yearlyPlanPrice?: number; // default $189
  prizePoolPercentage?: number; // default 0.20 (20%)
}

export interface PrizePoolBreakdown {
  grossMonthlyRevenue: number;
  totalPrizePool: number;
  tier5Pool: number; // 40% + rollover
  tier4Pool: number; // 35%
  tier3Pool: number; // 25%
  rolloverFromPrevious: number;
}

export interface PlayerEntry {
  userId: string;
  email?: string;
  numbers: number[]; // Player's 5 stableford scores
  mostRecentScoreDate?: string;
}

export interface TierWinner {
  userId: string;
  email?: string;
  matchedCount: number;
  matchedNumbers: number[];
  userNumbers: number[];
  tier: 3 | 4 | 5;
  prizeAmount: number;
}

export interface DrawSimulationResult {
  drawType: DrawMode;
  winningNumbers: number[];
  poolBreakdown: PrizePoolBreakdown;
  winnersTier5: TierWinner[];
  winnersTier4: TierWinner[];
  winnersTier3: TierWinner[];
  totalWinnersCount: number;
  rolloverToNextMonth: number;
}

/**
 * Calculates gross monthly revenue and prize pool tiers.
 * Fixed assumption: 20% of subscription revenue feeds the monthly prize pool.
 */
export function calculatePrizePool(config: DrawConfig): PrizePoolBreakdown {
  const monthlyPrice = config.monthlyPlanPrice ?? 19;
  const yearlyPrice = config.yearlyPlanPrice ?? 189;
  const prizePoolShare = config.prizePoolPercentage ?? 0.20;

  // Monthly revenue equivalent: monthly subs * $19 + yearly subs * ($189 / 12)
  const monthlyRevenue =
    config.activeMonthlySubscribers * monthlyPrice +
    config.activeYearlySubscribers * (yearlyPrice / 12);

  const basePrizePool = Math.round(monthlyRevenue * prizePoolShare * 100) / 100;

  // Tier splits: 5-match: 40%, 4-match: 35%, 3-match: 25%
  const tier5Base = Math.round(basePrizePool * 0.40 * 100) / 100;
  const tier4Pool = Math.round(basePrizePool * 0.35 * 100) / 100;
  const tier3Pool = Math.round(basePrizePool * 0.25 * 100) / 100;

  const tier5Pool = Math.round((tier5Base + config.previousRolloverAmount) * 100) / 100;

  return {
    grossMonthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    totalPrizePool: Math.round((basePrizePool + config.previousRolloverAmount) * 100) / 100,
    tier5Pool,
    tier4Pool,
    tier3Pool,
    rolloverFromPrevious: config.previousRolloverAmount,
  };
}

/**
 * Generates 5 unique winning numbers between 1 and 45.
 */
export function generateRandomWinningNumbers(count = 5, min = 1, max = 45): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Algorithmic draw generator:
 * Samples 5 unique numbers weighted by the frequency of numbers submitted
 * by active players according to their calculated consistency weights.
 */
export function generateAlgorithmicWinningNumbers(
  entries: PlayerEntry[],
  count = 5,
  min = 1,
  max = 45
): number[] {
  if (entries.length === 0) {
    return generateRandomWinningNumbers(count, min, max);
  }

  const frequencyMap = new Map<number, number>();
  for (let i = min; i <= max; i++) {
    frequencyMap.set(i, 1);
  }

  for (const entry of entries) {
    const weight = calculatePlayerWeight(
      entry.numbers.length,
      entry.mostRecentScoreDate
    );
    for (const num of entry.numbers) {
      if (num >= min && num <= max) {
        frequencyMap.set(num, (frequencyMap.get(num) || 1) + weight);
      }
    }
  }

  const selected = new Set<number>();
  while (selected.size < count) {
    let totalWeight = 0;
    for (const [num, weight] of frequencyMap.entries()) {
      if (!selected.has(num)) {
        totalWeight += weight;
      }
    }

    let randomThreshold = Math.random() * totalWeight;
    for (const [num, weight] of frequencyMap.entries()) {
      if (selected.has(num)) continue;
      randomThreshold -= weight;
      if (randomThreshold <= 0) {
        selected.add(num);
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Evaluates a player's numbers against the winning draw numbers.
 * 
 * DUPLICATE NUMBER RESOLUTION:
 * A player can log duplicate scores within a cycle (e.g., two rounds scoring 28).
 * In the official draw, each drawn winning number can only be matched ONCE (unique set intersection).
 * Therefore, duplicate occurrences of the same number in a player's ticket do NOT grant multiple matches.
 * Formally: matchedNumbers = Array.from(new Set(playerNumbers)).filter(n => winningSet.has(n))
 */
export function evaluatePlayerMatches(
  playerNumbers: number[],
  winningNumbers: number[]
): { matchedCount: number; matchedNumbers: number[] } {
  const winningSet = new Set(winningNumbers);
  // De-duplicate player numbers to enforce unique set intersection rule
  const uniquePlayerNumbers = Array.from(new Set(playerNumbers));
  const matchedNumbers = uniquePlayerNumbers.filter((n) => winningSet.has(n));
  return {
    matchedCount: matchedNumbers.length,
    matchedNumbers,
  };
}

/**
 * Executes a full draw simulation:
 * - Calculates prize pool & tiers
 * - Generates winning numbers according to draw mode
 * - Matches all participant numbers (with duplicate set-intersection guard)
 * - Splits tier prizes equally among tier winners
 * - Calculates rollover into next month for Tier 5
 */
export function runDrawSimulation(
  config: DrawConfig,
  participants: PlayerEntry[],
  forcedWinningNumbers?: number[]
): DrawSimulationResult {
  const pool = calculatePrizePool(config);

  const winningNumbers =
    forcedWinningNumbers ??
    (config.drawType === "algorithmic"
      ? generateAlgorithmicWinningNumbers(participants)
      : generateRandomWinningNumbers());

  const tier5Candidates: { entry: PlayerEntry; matched: number[] }[] = [];
  const tier4Candidates: { entry: PlayerEntry; matched: number[] }[] = [];
  const tier3Candidates: { entry: PlayerEntry; matched: number[] }[] = [];

  for (const player of participants) {
    const { matchedCount, matchedNumbers } = evaluatePlayerMatches(
      player.numbers,
      winningNumbers
    );

    if (matchedCount === 5) {
      tier5Candidates.push({ entry: player, matched: matchedNumbers });
    } else if (matchedCount === 4) {
      tier4Candidates.push({ entry: player, matched: matchedNumbers });
    } else if (matchedCount === 3) {
      tier3Candidates.push({ entry: player, matched: matchedNumbers });
    }
  }

  // Equal tie-splitting per tier
  const tier5Share =
    tier5Candidates.length > 0
      ? Math.round((pool.tier5Pool / tier5Candidates.length) * 100) / 100
      : 0;

  const tier4Share =
    tier4Candidates.length > 0
      ? Math.round((pool.tier4Pool / tier4Candidates.length) * 100) / 100
      : 0;

  const tier3Share =
    tier3Candidates.length > 0
      ? Math.round((pool.tier3Pool / tier3Candidates.length) * 100) / 100
      : 0;

  const winnersTier5: TierWinner[] = tier5Candidates.map(({ entry, matched }) => ({
    userId: entry.userId,
    email: entry.email,
    matchedCount: 5,
    matchedNumbers: matched,
    userNumbers: entry.numbers,
    tier: 5,
    prizeAmount: tier5Share,
  }));

  const winnersTier4: TierWinner[] = tier4Candidates.map(({ entry, matched }) => ({
    userId: entry.userId,
    email: entry.email,
    matchedCount: 4,
    matchedNumbers: matched,
    userNumbers: entry.numbers,
    tier: 4,
    prizeAmount: tier4Share,
  }));

  const winnersTier3: TierWinner[] = tier3Candidates.map(({ entry, matched }) => ({
    userId: entry.userId,
    email: entry.email,
    matchedCount: 3,
    matchedNumbers: matched,
    userNumbers: entry.numbers,
    tier: 3,
    prizeAmount: tier3Share,
  }));

  // Rollover logic: if 0 winners in 5-number tier, roll entire tier 5 pool to next month
  const rolloverToNextMonth =
    tier5Candidates.length === 0 ? pool.tier5Pool : 0;

  return {
    drawType: config.drawType,
    winningNumbers,
    poolBreakdown: pool,
    winnersTier5,
    winnersTier4,
    winnersTier3,
    totalWinnersCount:
      winnersTier5.length + winnersTier4.length + winnersTier3.length,
    rolloverToNextMonth,
  };
}
