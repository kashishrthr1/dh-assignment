import mongoose, { Schema, Document } from "mongoose";

export interface IDrawWinner extends Document {
  drawId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tier: 3 | 4 | 5;
  matchedCount: 3 | 4 | 5;
  userNumbers: number[];
  matchedNumbers: number[];
  prizeAmount: number;
  proofImageUrl?: string;
  proofStatus: "unsubmitted" | "pending_review" | "approved" | "rejected";
  payoutStatus: "pending" | "paid";
  adminNotes?: string;
  reviewedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
}

const DrawWinnerSchema = new Schema<IDrawWinner>({
  drawId: { type: Schema.Types.ObjectId, ref: "Draw", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tier: { type: Number, enum: [3, 4, 5], required: true },
  matchedCount: { type: Number, enum: [3, 4, 5], required: true },
  userNumbers: [{ type: Number, required: true }],
  matchedNumbers: [{ type: Number, required: true }],
  prizeAmount: { type: Number, required: true },
  proofImageUrl: { type: String, default: null },
  proofStatus: {
    type: String,
    enum: ["unsubmitted", "pending_review", "approved", "rejected"],
    default: "unsubmitted",
    index: true,
  },
  payoutStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
    index: true,
  },
  adminNotes: { type: String },
  reviewedAt: { type: Date },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const DrawWinner = mongoose.model<IDrawWinner>("DrawWinner", DrawWinnerSchema);
