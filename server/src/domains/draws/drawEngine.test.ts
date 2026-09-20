import { describe, it, expect } from "vitest";
import {
  calculatePrizePool,
  generateRandomWinningNumbers,
  evaluatePlayerMatches,
  runDrawSimulation,
  PlayerEntry,
} from "./drawEngine";
import { calculatePlayerWeight } from "./weighting";

describe("Custom Draw Engine (Server Domain)", () => {
  describe("Duplicate Ticket Numbers & Set Intersection Matching", () => {
    const winning = [7, 14, 21, 28, 35];

    it("matches duplicate numbers on ticket only ONCE (set intersection rule)", () => {
      // Player logged 28 twice: [28, 28, 35, 40, 42]
      // Winning numbers: [7, 14, 21, 28, 35]
      // 28 should only match once, and 35 matches once -> total 2 matches
      const playerWithDuplicates = [28, 28, 35, 40, 42];
      const res = evaluatePlayerMatches(playerWithDuplicates, winning);

      expect(res.matchedCount).toBe(2);
      expect(res.matchedNumbers).toEqual([28, 35]);
    });

    it("prevents single number spamming from claiming higher match tiers", () => {
      // If a user had identical scores [28, 28, 28, 28, 28]
      const playerSpammingNumber = [28, 28, 28, 28, 28];
      const res = evaluatePlayerMatches(playerSpammingNumber, winning);

      // Must be 1 match, NOT 5 matches
      expect(res.matchedCount).toBe(1);
      expect(res.matchedNumbers).toEqual([28]);
    });

    it("evaluates genuine 5, 4, and 3 distinct matches properly", () => {
      expect(evaluatePlayerMatches([7, 14, 21, 28, 35], winning).matchedCount).toBe(5);
      expect(evaluatePlayerMatches([7, 14, 21, 28, 44], winning).matchedCount).toBe(4);
      expect(evaluatePlayerMatches([7, 14, 21, 40, 44], winning).matchedCount).toBe(3);
      expect(evaluatePlayerMatches([7, 14, 30, 40, 44], winning).matchedCount).toBe(2);
    });
  });

  describe("Prize Pool Calculation & Tier Allocation", () => {
    it("calculates 20% prize pool and correct 40/35/25 tier shares", () => {
      const pool = calculatePrizePool({
        drawType: "random",
        activeMonthlySubscribers: 100,
        activeYearlySubscribers: 120,
        previousRolloverAmount: 0,
      });

      expect(pool.grossMonthlyRevenue).toBe(3790);
      expect(pool.totalPrizePool).toBe(758);
      expect(pool.tier5Pool).toBe(303.2);
      expect(pool.tier4Pool).toBe(265.3);
      expect(pool.tier3Pool).toBe(189.5);
    });

    it("adds previous rollover amount directly to Tier 5 jackpot pool", () => {
      const pool = calculatePrizePool({
        drawType: "random",
        activeMonthlySubscribers: 100,
        activeYearlySubscribers: 0,
        previousRolloverAmount: 500,
      });

      expect(pool.tier5Pool).toBe(652);
      expect(pool.totalPrizePool).toBe(880);
    });
  });

  describe("Simulation, Tie Splitting & Jackpot Rollover", () => {
    it("splits tier prize equally when multiple winners match the tier", () => {
      const participants: PlayerEntry[] = [
        { userId: "u1", numbers: [5, 10, 15, 20, 25] },
        { userId: "u2", numbers: [5, 10, 15, 20, 25] },
        { userId: "u3", numbers: [5, 10, 15, 20, 33] },
      ];

      const sim = runDrawSimulation(
        {
          drawType: "random",
          activeMonthlySubscribers: 100,
          activeYearlySubscribers: 0,
          previousRolloverAmount: 0,
        },
        participants,
        [5, 10, 15, 20, 25]
      );

      expect(sim.winnersTier5.length).toBe(2);
      expect(sim.winnersTier5[0].prizeAmount).toBe(76);
      expect(sim.winnersTier5[1].prizeAmount).toBe(76);
      expect(sim.rolloverToNextMonth).toBe(0);
    });

    it("rolls over entire Tier 5 jackpot into next month when 0 winners match 5 numbers", () => {
      const participants: PlayerEntry[] = [
        { userId: "u1", numbers: [1, 2, 3, 4, 10] },
      ];

      const sim = runDrawSimulation(
        {
          drawType: "random",
          activeMonthlySubscribers: 100,
          activeYearlySubscribers: 0,
          previousRolloverAmount: 200,
        },
        participants,
        [5, 10, 15, 20, 25]
      );

      expect(sim.winnersTier5.length).toBe(0);
      expect(sim.rolloverToNextMonth).toBe(352);
    });
  });

  describe("Algorithmic Weighting Formula", () => {
    it("calculates correct base and enhanced weights based on score count and recency", () => {
      const now = new Date("2026-09-20");
      expect(calculatePlayerWeight(0, undefined, now)).toBe(1.0);
      expect(calculatePlayerWeight(5, undefined, now)).toBe(2.25);
      expect(calculatePlayerWeight(5, "2026-09-17", now)).toBe(2.75);
      expect(calculatePlayerWeight(3, "2026-09-10", now)).toBe(2.0);
    });
  });
});
