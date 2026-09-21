import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: "subscriber" | "admin";
    email: string;
    [key: string]: any;
  } | any;
  file?: any;
  files?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_access_key_digital_heroes_2026";

/**
 * Validates JWT access token in Authorization: Bearer <token>
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Authorization header with Bearer token is required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      _id: string;
      role: "subscriber" | "admin";
      email: string;
    };
    req.user = decoded;
    return next();
  } catch (err: any) {
    return res.status(401).json({
      error: "invalid_token",
      message: "Token is invalid or has expired.",
    });
  }
}

/**
 * Enforces admin authority
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: "forbidden_admin",
      message: "Administrator privilege required.",
    });
  }
  return next();
}

/**
 * Real-time subscription verification middleware.
 * Queries current status in MongoDB and enforces active status & date validity.
 */
export async function requireActiveSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // Administrators bypass subscription lock
  if (req.user.role === "admin") {
    return next();
  }

  try {
    const user = await User.findById(req.user._id).select(
      "subscriptionStatus currentPeriodEnd"
    );

    if (!user || user.subscriptionStatus !== "active") {
      return res.status(403).json({
        error: "subscription_inactive",
        message: "An active subscription is required to access this feature.",
        status: user?.subscriptionStatus || "inactive",
      });
    }

    // Real-time period expiration check
    if (user.currentPeriodEnd && new Date() > new Date(user.currentPeriodEnd)) {
      user.subscriptionStatus = "past_due";
      await user.save();
      return res.status(403).json({
        error: "subscription_lapsed",
        message: "Your subscription period has expired. Please reactivate.",
        status: "past_due",
      });
    }

    return next();
  } catch (err: any) {
    return res.status(500).json({ error: "subscription_check_failed" });
  }
}
