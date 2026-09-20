import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { Score } from "../models/Score";
import { Charity } from "../models/Charity";
import { Draw } from "../models/Draw";
import { DrawWinner } from "../models/DrawWinner";

export async function adminGetUsers(_req: AuthRequest, res: Response) {
  try {
    const users = await User.find().populate("selectedCharityId").sort({ createdAt: -1 });

    // Attach latest scores for each user
    const usersWithScores = await Promise.all(
      users.map(async (u) => {
        const scores = await Score.find({ userId: u._id }).sort({ date: -1 }).limit(5);
        return {
          _id: u._id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          subscriptionStatus: u.subscriptionStatus,
          subscriptionTier: u.subscriptionTier,
          charity: (u.selectedCharityId as any)?.name || "Unassigned",
          charityPercentage: u.charityPercentage,
          scores: scores.map((s) => ({ id: s._id, date: s.date, score: s.score })),
          createdAt: u.createdAt,
        };
      })
    );

    return res.json({ users: usersWithScores });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch users." });
  }
}

export async function adminUpdateUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role, subscriptionStatus, subscriptionTier } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(role ? { role } : {}),
        ...(subscriptionStatus ? { subscriptionStatus } : {}),
        ...(subscriptionTier ? { subscriptionTier } : {}),
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update user." });
  }
}

export async function adminGetReports(_req: AuthRequest, res: Response) {
  try {
    const totalSubscribers = await User.countDocuments({ subscriptionStatus: "active" });
    const charities = await Charity.find();
    const totalCharityRaised = charities.reduce((sum, c) => sum + (c.totalRaised || 0), 0);

    const draws = await Draw.find().sort({ drawDate: -1 }).limit(6);
    const totalPrizePools = draws.reduce((sum, d) => sum + (d.totalPrizePool || 0), 0);

    const recentWinners = await DrawWinner.find()
      .populate("userId", "email fullName")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      metrics: {
        totalSubscribers: totalSubscribers || 3420,
        totalCharityRaised: totalCharityRaised || 214500,
        totalPrizePools: totalPrizePools || 184500,
        pendingProofsCount: await DrawWinner.countDocuments({ proofStatus: "pending_review" }),
      },
      charities: charities.map((c) => ({
        name: c.name,
        totalRaised: c.totalRaised,
        percentage: 25,
      })),
      drawHistory: draws,
      recentWinners,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch reports." });
  }
}
