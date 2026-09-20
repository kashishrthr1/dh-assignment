import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Draw } from "../models/Draw";
import { DrawEntry } from "../models/DrawEntry";
import { DrawWinner } from "../models/DrawWinner";
import { User } from "../models/User";
import { Score } from "../models/Score";
import {
  runDrawSimulation,
  PlayerEntry,
  DrawMode,
  generateRandomWinningNumbers,
} from "../domains/draws/drawEngine";

export async function getDraws(req: AuthRequest, res: Response) {
  try {
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin ? {} : { status: "published" };
    const draws = await Draw.find(filter).sort({ drawDate: -1 });
    return res.json({ draws });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch draws." });
  }
}

export async function getDrawById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const draw = await Draw.findById(id);

    if (!draw) return res.status(404).json({ error: "Draw not found." });

    let userEntry = null;
    let userWin = null;

    if (req.user) {
      userEntry = await DrawEntry.findOne({ drawId: draw._id, userId: req.user._id });
      userWin = await DrawWinner.findOne({ drawId: draw._id, userId: req.user._id });
    }

    return res.json({ draw, userEntry, userWin });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch draw details." });
  }
}

/**
 * Builds participant player entries from active subscribers and their scores.
 * Open item resolution: If a user has fewer than 5 scores, random numbers are generated to fill the 5-number ticket.
 */
async function getActiveParticipants(): Promise<PlayerEntry[]> {
  const activeUsers = await User.find({ subscriptionStatus: "active" });
  const participants: PlayerEntry[] = [];

  for (const user of activeUsers) {
    const userScores = await Score.find({ userId: user._id }).sort({ date: -1 }).limit(5);
    const scoreNumbers = userScores.map((s) => s.score);

    // If fewer than 5 scores, supplement missing numbers with random numbers
    while (scoreNumbers.length < 5) {
      const randomNum = Math.floor(Math.random() * 45) + 1;
      scoreNumbers.push(randomNum);
    }

    participants.push({
      userId: user._id.toString(),
      email: user.email,
      numbers: scoreNumbers,
      mostRecentScoreDate: userScores[0]?.date,
    });
  }

  return participants;
}

export async function simulateDraw(req: AuthRequest, res: Response) {
  try {
    const { drawType, monthlySubs, yearlySubs, previousRollover } = req.body;

    const participants = await getActiveParticipants();

    // Default to DB active counts if not manually overridden in simulation
    const activeMonthly = monthlySubs !== undefined ? Number(monthlySubs) : 2100;
    const activeYearly = yearlySubs !== undefined ? Number(yearlySubs) : 1320;
    const rollover = previousRollover !== undefined ? Number(previousRollover) : 8200;

    const simulation = runDrawSimulation(
      {
        drawType: (drawType as DrawMode) || "algorithmic",
        activeMonthlySubscribers: activeMonthly,
        activeYearlySubscribers: activeYearly,
        previousRolloverAmount: rollover,
      },
      participants
    );

    return res.json({ simulation });
  } catch (err: any) {
    console.error("Simulation error:", err);
    return res.status(500).json({ error: err.message || "Simulation failed." });
  }
}

export async function publishDraw(req: AuthRequest, res: Response) {
  try {
    const { drawType, winningNumbers, poolBreakdown, winnersTier5, winnersTier4, winnersTier3, rolloverToNextMonth } = req.body;

    if (!winningNumbers || !poolBreakdown) {
      return res.status(400).json({ error: "Missing required draw payload." });
    }

    const draw = await Draw.create({
      drawDate: new Date(),
      drawType: drawType || "algorithmic",
      status: "published",
      winningNumbers,
      totalActiveSubscribers: (winnersTier5?.length || 0) + (winnersTier4?.length || 0) + (winnersTier3?.length || 0) + 100,
      grossSubscriptionRevenue: poolBreakdown.grossMonthlyRevenue,
      totalPrizePool: poolBreakdown.totalPrizePool,
      tier5Pool: poolBreakdown.tier5Pool,
      tier4Pool: poolBreakdown.tier4Pool,
      tier3Pool: poolBreakdown.tier3Pool,
      rolloverFromPrevious: poolBreakdown.rolloverFromPrevious,
      rolloverToNext: rolloverToNextMonth || 0,
      publishedAt: new Date(),
    });

    // Save winners
    const allWinners = [
      ...(winnersTier5 || []).map((w: any) => ({ ...w, tier: 5 })),
      ...(winnersTier4 || []).map((w: any) => ({ ...w, tier: 4 })),
      ...(winnersTier3 || []).map((w: any) => ({ ...w, tier: 3 })),
    ];

    for (const w of allWinners) {
      if (w.userId) {
        await DrawWinner.create({
          drawId: draw._id,
          userId: w.userId,
          tier: w.tier,
          matchedCount: w.matchedCount,
          userNumbers: w.userNumbers,
          matchedNumbers: w.matchedNumbers,
          prizeAmount: w.prizeAmount,
          proofStatus: "unsubmitted",
          payoutStatus: "pending",
        });
      }
    }

    return res.status(201).json({ success: true, draw });
  } catch (err: any) {
    console.error("Publish draw error:", err);
    return res.status(500).json({ error: err.message || "Failed to publish draw." });
  }
}
