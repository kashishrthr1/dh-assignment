import mongoose, { Schema, Document } from "mongoose";

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  score: number;
  createdAt: Date;
}

const ScoreSchema = new Schema<IScore>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 45,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce single score per date per user at DB level
ScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Score = mongoose.model<IScore>("Score", ScoreSchema);
