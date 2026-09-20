import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_access_key_digital_heroes_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_secret_jwt_refresh_key_digital_heroes_2026";

const isProduction = process.env.NODE_ENV === "production";

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});

function generateAccessToken(user: any): string {
  return jwt.sign(
    { _id: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(user: any): string {
  return jwt.sign(
    { _id: user._id.toString() },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, fullName, plan, charityId, charityPercentage } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role: "subscriber",
      subscriptionStatus: "active", // Activate for demo/test flow
      subscriptionTier: plan || "monthly",
      selectedCharityId: charityId || null,
      charityPercentage: Number(charityPercentage) || 10,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, getCookieOptions());

    return res.status(201).json({
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: err.message || "Failed to register user." });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, getCookieOptions());

    return res.json({
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal login failure." });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "No refresh token provided." });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { _id: string };
    const user = await User.findById(decoded._id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: "Refresh token is invalid or has been revoked." });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, getCookieOptions());

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token." });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    }
    res.clearCookie("refreshToken", getCookieOptions());
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed." });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    const user = await User.findById(req.user._id).populate("selectedCharityId");
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch user profile." });
  }
}
