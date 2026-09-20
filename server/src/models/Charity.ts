import mongoose, { Schema, Document } from "mongoose";

export interface ICharityEvent {
  title: string;
  date: string;
  location: string;
  goal: number;
  description?: string;
}

export interface ICharity extends Document {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  heroImageUrl?: string;
  websiteUrl?: string;
  category: string;
  isSpotlight: boolean;
  totalRaised: number;
  events: ICharityEvent[];
  createdAt: Date;
}

const CharityEventSchema = new Schema<ICharityEvent>({
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  goal: { type: Number, required: true },
  description: { type: String },
});

const CharitySchema = new Schema<ICharity>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  logoUrl: { type: String },
  heroImageUrl: { type: String },
  websiteUrl: { type: String },
  category: { type: String, default: "Health & Wellness" },
  isSpotlight: { type: Boolean, default: false, index: true },
  totalRaised: { type: Number, default: 0, min: 0 },
  events: [CharityEventSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Charity = mongoose.model<ICharity>("Charity", CharitySchema);
