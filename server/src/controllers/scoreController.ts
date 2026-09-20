import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Score } from "../models/Score";
import {
  addScoreWithRollingWindow,
  sortScoresDescending,
  validateStablefordScore,
} from "../domains/scores/scoreService";

export async function getScores(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const scores = await Score.find({ userId }).sort({ date: -1, createdAt: -1 });
    return res.json({ scores });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch scores." });
  }
}

export async function addScore(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const { date, score } = req.body;

    if (!date || score === undefined) {
      return res.status(400).json({ error: "Date and score are required." });
    }

    // Fetch existing scores for user
    const existing = await Score.find({ userId }).sort({ date: -1, createdAt: -1 });

    const formattedExisting = existing.map((s) => ({
      id: s._id.toString(),
      userId: s.userId.toString(),
      date: s.date,
      score: s.score,
      createdAt: s.createdAt,
    }));

    // Run domain logic: checks bounds, checks duplicate date, manages rolling 5
    const newEntry = { date, score: Number(score) };
    const updatedRollingSet = addScoreWithRollingWindow(formattedExisting, newEntry);

    // If rolling set drops an existing score, delete it from MongoDB
    if (formattedExisting.length >= 5) {
      const activeIds = new Set(updatedRollingSet.map((s) => s.id).filter(Boolean));
      const toDelete = formattedExisting.filter((s) => !activeIds.has(s.id));
      for (const item of toDelete) {
        await Score.findByIdAndDelete(item.id);
      }
    }

    // Persist new score
    const created = await Score.create({
      userId,
      date,
      score: Number(score),
    });

    const finalScores = await Score.find({ userId }).sort({ date: -1, createdAt: -1 });
    return res.status(201).json({ scores: finalScores });
  } catch (err: any) {
    if (err.name === "DuplicateScoreDateError" || err.name === "ScoreValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || "Failed to save score." });
  }
}

export async function deleteScore(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const score = await Score.findById(id);

    if (!score) {
      return res.status(404).json({ error: "Score not found." });
    }

    // Check ownership or admin authority
    if (score.userId.toString() !== req.user!._id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: You cannot delete another player's score." });
    }

    await Score.findByIdAndDelete(id);
    return res.json({ success: true, message: "Score deleted successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete score." });
  }
}

export async function adminUpdateScore(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { score, date } = req.body;

    if (score !== undefined && !validateStablefordScore(Number(score))) {
      return res.status(400).json({ error: "Stableford score must be between 1 and 45." });
    }

    const updated = await Score.findByIdAndUpdate(
      id,
      { ...(score !== undefined ? { score: Number(score) } : {}), ...(date ? { date } : {}) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Score not found." });
    return res.json({ score: updated });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update score." });
  }
}
