import mongoose, { Schema, Document } from "mongoose";

export interface IDraw extends Document {
  drawNumber?: number;
  drawDate: Date;
  drawType: "random" | "algorithmic";
  status: "draft" | "simulated" | "published";
  winningNumbers: number[];
  totalActiveSubscribers: number;
  grossSubscriptionRevenue: number;
  totalPrizePool: number;
  tier5Pool: number;
  tier4Pool: number;
  tier3Pool: number;
  rolloverFromPrevious: number;
  rolloverToNext: number;
  simulationNotes?: string;
  publishedAt?: Date;
  createdAt: Date;
  prizePoolTotal?: number;
  jackpotTotal?: number;
}

const DrawSchema = new Schema<IDraw>(
  {
    drawNumber: { type: Number, default: 1 },
    drawDate: { type: Date, required: true },
    drawType: { type: String, enum: ["random", "algorithmic"], default: "random" },
    status: { type: String, enum: ["draft", "simulated", "published"], default: "draft", index: true },
    winningNumbers: [{ type: Number, min: 1, max: 45 }],
    totalActiveSubscribers: { type: Number, default: 0 },
    grossSubscriptionRevenue: { type: Number, default: 0 },
    totalPrizePool: { type: Number, default: 0 },
    tier5Pool: { type: Number, default: 0 },
    tier4Pool: { type: Number, default: 0 },
    tier3Pool: { type: Number, default: 0 },
    rolloverFromPrevious: { type: Number, default: 0 },
    rolloverToNext: { type: Number, default: 0 },
    simulationNotes: { type: String },
    publishedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for frontend field name compatibility
DrawSchema.virtual("prizePoolTotal").get(function () {
  return this.totalPrizePool ?? 0;
});

DrawSchema.virtual("jackpotTotal").get(function () {
  return this.tier5Pool ?? 0;
});

export const Draw = mongoose.model<IDraw>("Draw", DrawSchema);
