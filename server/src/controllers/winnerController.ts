import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { DrawWinner } from "../models/DrawWinner";

export async function getMyWinnings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const winners = await DrawWinner.find({ userId })
      .populate("drawId")
      .sort({ createdAt: -1 });

    const formatted = winners.map((w) => {
      const obj: any = w.toObject ? w.toObject() : w;
      return {
        ...obj,
        amountWon: obj.prizeAmount ?? obj.amountWon ?? 0,
        verificationStatus: obj.proofStatus ?? obj.verificationStatus ?? "unsubmitted",
        proofScorecardUrl: obj.proofImageUrl ?? obj.proofScorecardUrl,
      };
    });

    const totalWon = formatted.reduce((sum, w) => sum + (w.amountWon || 0), 0);

    return res.json({ winnings: formatted, totalWon });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch winnings." });
  }
}

export async function uploadWinnerProof(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const winner = await DrawWinner.findById(id);
    if (!winner) return res.status(404).json({ error: "Winner record not found." });

    // Ownership check: only the winner can upload their proof
    if (winner.userId.toString() !== userId && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: You cannot submit proof for another player." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Scorecard screenshot file is required." });
    }

    // Cloudinary file returns file.path or file.secure_url; diskStorage returns file.path
    const imageUrl = (file as any).path || (file as any).secure_url || `/uploads/${file.filename}`;

    winner.proofImageUrl = imageUrl;
    winner.proofStatus = "pending_review";
    await winner.save();

    return res.json({ success: true, winner });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to upload proof." });
  }
}

export async function adminGetAllWinners(req: AuthRequest, res: Response) {
  try {
    const filter: any = {};
    const status = req.query.verificationStatus || req.query.status || req.query.proofStatus;
    if (status) {
      filter.proofStatus = status;
    }

    const winners = await DrawWinner.find(filter)
      .populate("userId", "email fullName")
      .populate("drawId", "drawDate drawType drawNumber")
      .sort({ createdAt: -1 });

    const formatted = winners.map((w) => {
      const obj: any = w.toObject ? w.toObject() : w;
      return {
        ...obj,
        amountWon: obj.prizeAmount ?? obj.amountWon ?? 0,
        verificationStatus: obj.proofStatus ?? obj.verificationStatus ?? "unsubmitted",
        proofScorecardUrl: obj.proofImageUrl ?? obj.proofScorecardUrl,
      };
    });

    return res.json({ winners: formatted });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch winners." });
  }
}

export async function adminVerifyProof(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, verificationStatus, adminNotes, rejectionReason } = req.body;
    const targetStatus = status || verificationStatus;

    if (!["approved", "rejected", "pending_review", "unsubmitted"].includes(targetStatus)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
    }

    const winner = await DrawWinner.findByIdAndUpdate(
      id,
      {
        proofStatus: targetStatus,
        adminNotes: rejectionReason || adminNotes,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!winner) return res.status(404).json({ error: "Winner record not found." });
    return res.json({ winner });
  } catch (err) {
    return res.status(500).json({ error: "Failed to verify proof." });
  }
}

export async function adminTogglePayout(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const winner = await DrawWinner.findById(id);
    if (!winner) return res.status(404).json({ error: "Winner record not found." });

    const newPayoutStatus = winner.payoutStatus === "pending" ? "paid" : "pending";
    winner.payoutStatus = newPayoutStatus;
    if (newPayoutStatus === "paid") {
      winner.paidAt = new Date();
    }
    await winner.save();

    return res.json({ winner });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update payout status." });
  }
}
