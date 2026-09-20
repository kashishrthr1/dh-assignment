import mongoose, { Schema, Document } from "mongoose";

export interface IDonation extends Document {
  charityId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  amount: number;
  donorName?: string;
  donorEmail: string;
  message?: string;
  stripePaymentIntentId?: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

const DonationSchema = new Schema<IDonation>({
  charityId: { type: Schema.Types.ObjectId, ref: "Charity", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  amount: { type: Number, required: true, min: 1 },
  donorName: { type: String },
  donorEmail: { type: String, required: true },
  message: { type: String },
  stripePaymentIntentId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  createdAt: { type: Date, default: Date.now },
});

export const Donation = mongoose.model<IDonation>("Donation", DonationSchema);
