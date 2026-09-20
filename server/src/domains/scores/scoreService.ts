/**
 * Score Management Service
 * Domain logic for Stableford golf scores with rolling window and duplicate-date validation.
 */

export interface ScoreEntry {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  score: number; // Stableford points: 1 to 45
  createdAt?: string | Date;
}

export class ScoreValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoreValidationError";
  }
}

export class DuplicateScoreDateError extends Error {
  constructor(date: string) {
    super(
      `A score for date ${date} already exists. You may edit or delete that entry, but cannot submit duplicates for the same date.`
    );
    this.name = "DuplicateScoreDateError";
  }
}

/**
 * Validates that a Stableford score is an integer between 1 and 45 inclusive.
 */
export function validateStablefordScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 45;
}

/**
 * Checks if a given date string already has an entry in the user's score list.
 */
export function isDuplicateDate(
  existingScores: ScoreEntry[],
  date: string,
  excludeId?: string
): boolean {
  return existingScores.some(
    (entry) => entry.date === date && (!excludeId || entry.id !== excludeId)
  );
}

/**
 * Sorts scores strictly in reverse chronological order (most recent date first).
 */
export function sortScoresDescending(scores: ScoreEntry[]): ScoreEntry[] {
  return [...scores].sort((a, b) => {
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
}

/**
 * Core business rule:
 * - Checks score bounds (1-45)
 * - Checks duplicate date
 * - Appends new score
 * - Sorts reverse chronologically (most recent first)
 * - If count exceeds 5, drops the oldest entry (rolling window of exactly 5)
 */
export function addScoreWithRollingWindow(
  existingScores: ScoreEntry[],
  newScore: ScoreEntry,
  maxWindow = 5
): ScoreEntry[] {
  // 1. Validate score range
  if (!validateStablefordScore(newScore.score)) {
    throw new ScoreValidationError(
      `Score ${newScore.score} is invalid. Stableford scores must be integers between 1 and 45.`
    );
  }

  // 2. Validate date format
  if (!newScore.date || isNaN(new Date(newScore.date).getTime())) {
    throw new ScoreValidationError("A valid round date is required.");
  }

  // 3. Check duplicate date rule
  if (isDuplicateDate(existingScores, newScore.date, newScore.id)) {
    throw new DuplicateScoreDateError(newScore.date);
  }

  // 4. Combine and sort reverse chronological
  const combined = [...existingScores, newScore];
  const sorted = sortScoresDescending(combined);

  // 5. Enforce rolling window: keep only the newest `maxWindow` entries
  return sorted.slice(0, maxWindow);
}

/**
 * Updates an existing score by ID, verifying date uniqueness.
 */
export function updateScoreInList(
  existingScores: ScoreEntry[],
  updatedScore: ScoreEntry
): ScoreEntry[] {
  if (!validateStablefordScore(updatedScore.score)) {
    throw new ScoreValidationError(
      `Score ${updatedScore.score} is invalid. Stableford scores must be integers between 1 and 45.`
    );
  }

  if (isDuplicateDate(existingScores, updatedScore.date, updatedScore.id)) {
    throw new DuplicateScoreDateError(updatedScore.date);
  }

  const updatedList = existingScores.map((item) =>
    item.id === updatedScore.id ? { ...item, ...updatedScore } : item
  );

  return sortScoresDescending(updatedList);
}

/**
 * Removes a score entry by ID.
 */
export function deleteScoreFromList(
  existingScores: ScoreEntry[],
  scoreId: string
): ScoreEntry[] {
  return existingScores.filter((entry) => entry.id !== scoreId);
}
