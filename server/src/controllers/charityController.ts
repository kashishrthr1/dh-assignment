import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Charity } from "../models/Charity";
import { User } from "../models/User";
import { Donation } from "../models/Donation";

export async function getCharities(_req: Request, res: Response) {
  try {
    const charities = await Charity.find().sort({ totalRaised: -1 });
    return res.json({ charities });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch charities." });
  }
}

export async function getCharityBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const charity = await Charity.findOne({ slug });
    if (!charity) return res.status(404).json({ error: "Charity not found." });
    return res.json({ charity });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch charity profile." });
  }
}

export async function updateCharityPreference(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const { charityId, percentage } = req.body;

    const numPercentage = Number(percentage);
    if (numPercentage < 10 || numPercentage > 100) {
      return res.status(400).json({ error: "Charity percentage must be between 10% and 100%." });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...(charityId ? { selectedCharityId: charityId } : {}),
        charityPercentage: numPercentage,
      },
      { new: true }
    );

    return res.json({
      success: true,
      selectedCharityId: updated?.selectedCharityId,
      charityPercentage: updated?.charityPercentage,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update charity preference." });
  }
}

export async function createOneOffDonation(req: Request, res: Response) {
  try {
    const { charityId, amount, donorName, donorEmail, message } = req.body;

    if (!charityId || !amount || Number(amount) <= 0 || !donorEmail) {
      return res.status(400).json({ error: "Charity, valid amount, and donor email are required." });
    }

    const donation = await Donation.create({
      charityId,
      amount: Number(amount),
      donorName,
      donorEmail,
      message,
      status: "completed",
    });

    // Increment charity total raised
    await Charity.findByIdAndUpdate(charityId, { $inc: { totalRaised: Number(amount) } });

    return res.status(201).json({ success: true, donation });
  } catch (err) {
    return res.status(500).json({ error: "Failed to record donation." });
  }
}

export async function adminCreateCharity(req: AuthRequest, res: Response) {
  try {
    const { name, tagline, description, category, isSpotlight, heroImageUrl, logoUrl } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const charity = await Charity.create({
      name,
      slug,
      tagline,
      description,
      category: category || "Health & Wellness",
      isSpotlight: Boolean(isSpotlight),
      heroImageUrl,
      logoUrl,
      totalRaised: 0,
      events: [],
    });

    return res.status(201).json({ charity });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create charity." });
  }
}

export async function adminUpdateCharity(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const charity = await Charity.findByIdAndUpdate(id, req.body, { new: true });
    if (!charity) return res.status(404).json({ error: "Charity not found." });
    return res.json({ charity });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update charity." });
  }
}

export async function adminDeleteCharity(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await Charity.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete charity." });
  }
}
