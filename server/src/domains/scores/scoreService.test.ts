import { describe, it, expect } from "vitest";
import {
  validateStablefordScore,
  isDuplicateDate,
  sortScoresDescending,
  addScoreWithRollingWindow,
  updateScoreInList,
  deleteScoreFromList,
  ScoreValidationError,
  DuplicateScoreDateError,
  ScoreEntry,
} from "./scoreService";

describe("Score Management Service (Server Domain)", () => {
  describe("validateStablefordScore", () => {
    it("accepts valid Stableford scores between 1 and 45", () => {
      expect(validateStablefordScore(1)).toBe(true);
      expect(validateStablefordScore(36)).toBe(true);
      expect(validateStablefordScore(45)).toBe(true);
    });

    it("rejects scores below 1 or above 45", () => {
      expect(validateStablefordScore(0)).toBe(false);
      expect(validateStablefordScore(-5)).toBe(false);
      expect(validateStablefordScore(46)).toBe(false);
      expect(validateStablefordScore(100)).toBe(false);
    });

    it("rejects non-integer values", () => {
      expect(validateStablefordScore(36.5)).toBe(false);
    });
  });

  describe("Duplicate Date Rule", () => {
    const existing: ScoreEntry[] = [
      { id: "1", date: "2026-09-01", score: 36 },
      { id: "2", date: "2026-09-05", score: 38 },
    ];

    it("detects existing date as duplicate", () => {
      expect(isDuplicateDate(existing, "2026-09-01")).toBe(true);
    });

    it("permits new unique date", () => {
      expect(isDuplicateDate(existing, "2026-09-10")).toBe(false);
    });

    it("ignores self when editing an existing score by id", () => {
      expect(isDuplicateDate(existing, "2026-09-01", "1")).toBe(false);
    });

    it("throws DuplicateScoreDateError when attempting to insert duplicate date", () => {
      expect(() =>
        addScoreWithRollingWindow(existing, { date: "2026-09-01", score: 40 })
      ).toThrow(DuplicateScoreDateError);
    });
  });

  describe("Rolling Window of 5 Scores & Reverse Chronological Sorting", () => {
    it("adds scores up to 5 preserving reverse chronological order", () => {
      let scores: ScoreEntry[] = [];

      scores = addScoreWithRollingWindow(scores, { id: "1", date: "2026-09-01", score: 30 });
      scores = addScoreWithRollingWindow(scores, { id: "2", date: "2026-09-03", score: 32 });
      scores = addScoreWithRollingWindow(scores, { id: "3", date: "2026-09-02", score: 35 });

      expect(scores.length).toBe(3);
      expect(scores.map((s) => s.date)).toEqual(["2026-09-03", "2026-09-02", "2026-09-01"]);
    });

    it("drops the oldest score when a 6th score is submitted", () => {
      const fiveScores: ScoreEntry[] = [
        { id: "s5", date: "2026-09-05", score: 40 },
        { id: "s4", date: "2026-09-04", score: 38 },
        { id: "s3", date: "2026-09-03", score: 36 },
        { id: "s2", date: "2026-09-02", score: 34 },
        { id: "s1", date: "2026-09-01", score: 32 },
      ];

      const result = addScoreWithRollingWindow(fiveScores, {
        id: "s6",
        date: "2026-09-06",
        score: 42,
      });

      expect(result.length).toBe(5);
      expect(result[0].id).toBe("s6");
      expect(result.find((s) => s.id === "s1")).toBeUndefined();
      expect(result.map((s) => s.date)).toEqual([
        "2026-09-06",
        "2026-09-05",
        "2026-09-04",
        "2026-09-03",
        "2026-09-02",
      ]);
    });
  });

  describe("Update and Delete operations", () => {
    it("updates score points while enforcing validation", () => {
      const scores: ScoreEntry[] = [
        { id: "1", date: "2026-09-01", score: 30 },
        { id: "2", date: "2026-09-05", score: 35 },
      ];

      const updated = updateScoreInList(scores, { id: "1", date: "2026-09-01", score: 41 });
      expect(updated.find((s) => s.id === "1")?.score).toBe(41);

      expect(() =>
        updateScoreInList(scores, { id: "1", date: "2026-09-01", score: 55 })
      ).toThrow(ScoreValidationError);
    });

    it("deletes a score by ID", () => {
      const scores: ScoreEntry[] = [
        { id: "1", date: "2026-09-01", score: 30 },
        { id: "2", date: "2026-09-05", score: 35 },
      ];

      const afterDelete = deleteScoreFromList(scores, "1");
      expect(afterDelete.length).toBe(1);
      expect(afterDelete[0].id).toBe("2");
    });
  });
});
