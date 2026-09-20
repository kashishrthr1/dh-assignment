import mongoose, { Schema, Document } from "mongoose";

export interface IDrawEntry extends Document {
  drawId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  ticketNumbers: number[];
  weight: number;
  matchedCount: number;
  matchedNumbers: number[];
  tierWon?: 3 | 4 | 5 | null;
  createdAt: Date;
}

const DrawEntrySchema = new Schema<IDrawEntry>({
  drawId: { type: Schema.Types.ObjectId, ref: "Draw", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  userEmail: { type: String, required: true },
  ticketNumbers: [{ type: Number, min: 1, max: 45 }],
  weight: { type: Number, default: 1.0 },
  matchedCount: { type: Number, default: 0 },
  matchedNumbers: [{ type: Number }],
  tierWon: { type: Number, enum: [3, 4, 5, null], default: null },
  createdAt: { type: Date, default: Date.now },
});

// Enforce single ticket entry per user per draw
DrawEntrySchema.index({ drawId: 1, userId: 1 }, { unique: true });

export const DrawEntry = mongoose.model<IDrawEntry>("DrawEntry", DrawEntrySchema);
