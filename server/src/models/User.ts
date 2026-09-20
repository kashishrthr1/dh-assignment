import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  role: "subscriber" | "admin";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: "active" | "inactive" | "past_due" | "canceled";
  subscriptionTier?: "monthly" | "yearly" | null;
  currentPeriodEnd?: Date;
  selectedCharityId?: mongoose.Types.ObjectId;
  charityPercentage: number;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["subscriber", "admin"],
      default: "subscriber",
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
      unique: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
      unique: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "past_due", "canceled"],
      default: "inactive",
      index: true,
    },
    subscriptionTier: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
    },
    selectedCharityId: {
      type: Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },
    charityPercentage: {
      type: Number,
      default: 10,
      min: 10,
      max: 100,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
