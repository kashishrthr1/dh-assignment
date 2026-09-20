import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import {
  requireAuth,
  requireAdmin,
  requireActiveSubscription,
  AuthRequest,
} from "./authMiddleware";
import { User } from "../models/User";

const JWT_SECRET = "super_secret_jwt_access_key_digital_heroes_2026";

describe("Authorization Middleware Test Suite", () => {
  let req: Partial<AuthRequest>;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      statusCode: 200,
      jsonData: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.jsonData = data;
        return this;
      },
    };
    next = vi.fn();
  });

  describe("requireAuth", () => {
    it("rejects request when Authorization header is missing (401)", () => {
      requireAuth(req as AuthRequest, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.jsonData.error).toBe("unauthorized");
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects request when Authorization header lacks Bearer prefix (401)", () => {
      req.headers = { authorization: "Basic some_token" };
      requireAuth(req as AuthRequest, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects request with invalid or tampered JWT token (401)", () => {
      req.headers = { authorization: "Bearer invalid_jwt_string" };
      requireAuth(req as AuthRequest, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.jsonData.error).toBe("invalid_token");
      expect(next).not.toHaveBeenCalled();
    });

    it("attaches decoded user to req.user and calls next() on valid JWT", () => {
      const token = jwt.sign(
        { _id: "user-123", role: "subscriber", email: "player@example.com" },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
      req.headers = { authorization: `Bearer ${token}` };

      requireAuth(req as AuthRequest, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?._id).toBe("user-123");
      expect(req.user?.role).toBe("subscriber");
    });
  });

  describe("requireAdmin", () => {
    it("calls next() when user role is admin", () => {
      req.user = { _id: "admin-1", role: "admin", email: "admin@example.com" };

      requireAdmin(req as AuthRequest, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
    });

    it("blocks request with 403 Forbidden when user role is subscriber", () => {
      req.user = { _id: "user-1", role: "subscriber", email: "sub@example.com" };

      requireAdmin(req as AuthRequest, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.error).toBe("forbidden_admin");
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requireActiveSubscription", () => {
    it("allows administrators to bypass subscription checks", async () => {
      req.user = { _id: "admin-1", role: "admin", email: "admin@example.com" };

      await requireActiveSubscription(req as AuthRequest, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("blocks request if user subscriptionStatus is inactive (403)", async () => {
      req.user = { _id: "user-1", role: "subscriber", email: "sub@example.com" };

      // Mock User.findById
      vi.spyOn(User, "findById").mockReturnValue({
        select: vi.fn().mockResolvedValue({
          subscriptionStatus: "inactive",
          currentPeriodEnd: null,
        }),
      } as any);

      await requireActiveSubscription(req as AuthRequest, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.error).toBe("subscription_inactive");
      expect(next).not.toHaveBeenCalled();
    });

    it("allows request if user subscriptionStatus is active and not expired", async () => {
      req.user = { _id: "user-1", role: "subscriber", email: "sub@example.com" };

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      vi.spyOn(User, "findById").mockReturnValue({
        select: vi.fn().mockResolvedValue({
          subscriptionStatus: "active",
          currentPeriodEnd: futureDate,
        }),
      } as any);

      await requireActiveSubscription(req as AuthRequest, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("detects expired period, marks past_due, and blocks with 403", async () => {
      req.user = { _id: "user-1", role: "subscriber", email: "sub@example.com" };

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      const saveMock = vi.fn().mockResolvedValue(true);

      vi.spyOn(User, "findById").mockReturnValue({
        select: vi.fn().mockResolvedValue({
          subscriptionStatus: "active",
          currentPeriodEnd: pastDate,
          save: saveMock,
        }),
      } as any);

      await requireActiveSubscription(req as AuthRequest, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.jsonData.error).toBe("subscription_lapsed");
      expect(saveMock).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
