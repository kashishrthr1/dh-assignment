import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Charity } from "../models/Charity";
import { Score } from "../models/Score";
import { Draw } from "../models/Draw";

dotenv.config();

async function seed() {
  await connectDB();

  console.log("[Seed] Cleaning existing collections...");
  await User.deleteMany({});
  await Charity.deleteMany({});
  await Score.deleteMany({});
  await Draw.deleteMany({});

  console.log("[Seed] Creating Partner Charities...");
  const charities = await Charity.create([
    {
      name: "HeartGuard Foundation",
      slug: "heartguard-foundation",
      tagline: "Pioneering cardiovascular research and emergency cardiac care equipment.",
      description: "HeartGuard delivers automated external defibrillators (AEDs) to sports grounds and golf courses across the country.",
      category: "Medical & Health",
      isSpotlight: true,
      totalRaised: 48250,
      heroImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=200&q=80",
      websiteUrl: "https://heartguard.example.org",
      events: [
        {
          title: "Annual Invitational Charity Golf Classic",
          date: "Oct 15, 2026",
          location: "Pebble Point Links",
          goal: 25000,
          description: "18-hole scramble tournament with pros, dinner banquet, and benefit auction.",
        },
      ],
    },
    {
      name: "Junior Fairways Initiative",
      slug: "junior-fairways",
      tagline: "Empowering underprivileged youth through mentorship, education, and sport.",
      description: "Junior Fairways breaks economic barriers by providing full equipment grants and professional coaching.",
      category: "Youth & Education",
      isSpotlight: false,
      totalRaised: 31800,
      heroImageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=200&q=80",
      websiteUrl: "https://juniorfairways.example.org",
      events: [
        {
          title: "NextGen Pro-Am Scramble",
          date: "Nov 04, 2026",
          location: "St. Andrews Valley",
          goal: 15000,
          description: "Pairing junior golfers with amateur competitors.",
        },
      ],
    },
    {
      name: "Green Canopy Alliance",
      slug: "green-canopy",
      tagline: "Reforesting wetlands and revitalizing community ecosystem biodiversity.",
      description: "Dedicated to environmental sustainability and native tree planting on golf courses.",
      category: "Environment",
      isSpotlight: false,
      totalRaised: 22400,
      heroImageUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80",
      websiteUrl: "https://greencanopy.example.org",
      events: [
        {
          title: "Earth Day Charity Cup",
          date: "Sep 28, 2026",
          location: "Bayside Country Club",
          goal: 10000,
          description: "Sustainable tournament featuring carbon-offset play.",
        },
      ],
    },
    {
      name: "Veteran Hope Network",
      slug: "veteran-hope",
      tagline: "Comprehensive mental health, rehabilitation, and peer reintegration for veterans.",
      description: "Supporting military veterans through outdoor recreation and career transition programs.",
      category: "Veterans & Families",
      isSpotlight: false,
      totalRaised: 64100,
      heroImageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=200&q=80",
      websiteUrl: "https://veteranhope.example.org",
      events: [
        {
          title: "Honor & Valor Masters Cup",
          date: "Nov 11, 2026",
          location: "National Golf Club",
          goal: 50000,
          description: "Veterans Day headline tournament celebrating military heroes.",
        },
      ],
    },
  ]);

  console.log("[Seed] Creating Users...");
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash("AdminMasterKey2026!", adminSalt);

  await User.create({
    email: "admin@digitalheroes.io",
    passwordHash: adminHash,
    fullName: "Scottie Scheffler (Admin)",
    role: "admin",
    subscriptionStatus: "active",
    subscriptionTier: "yearly",
    selectedCharityId: charities[0]._id,
    charityPercentage: 20,
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  const subSalt = await bcrypt.genSalt(10);
  const subHash = await bcrypt.hash("SubscriberPass123!", subSalt);

  const subscriber = await User.create({
    email: "player@digitalheroes.io",
    passwordHash: subHash,
    fullName: "Jordan Spieth (Player)",
    role: "subscriber",
    subscriptionStatus: "active",
    subscriptionTier: "yearly",
    selectedCharityId: charities[0]._id,
    charityPercentage: 15,
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  console.log("[Seed] Creating 5 Stableford Scores for Player...");
  await Score.create([
    { userId: subscriber._id, date: "2026-09-18", score: 38 },
    { userId: subscriber._id, date: "2026-09-12", score: 36 },
    { userId: subscriber._id, date: "2026-09-05", score: 41 },
    { userId: subscriber._id, date: "2026-08-28", score: 35 },
    { userId: subscriber._id, date: "2026-08-20", score: 39 },
  ]);

  console.log("[Seed] Creating Sample Draw Cycle with Rollover...");
  await Draw.create({
    drawDate: new Date("2026-09-30"),
    drawType: "algorithmic",
    status: "published",
    winningNumbers: [14, 28, 36, 38, 41],
    totalActiveSubscribers: 3420,
    grossSubscriptionRevenue: 64500,
    totalPrizePool: 34500,
    tier5Pool: 22000,
    tier4Pool: 7500,
    tier3Pool: 5000,
    rolloverFromPrevious: 5000,
    rolloverToNext: 8200,
    publishedAt: new Date("2026-09-30"),
  });

  console.log("[Seed] Database successfully seeded with demo data!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
