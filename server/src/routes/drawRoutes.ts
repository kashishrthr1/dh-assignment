import { Router, Request, Response, NextFunction } from "express";
import { getDraws, getDrawById, simulateDraw, publishDraw } from "../controllers/drawController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Publicly viewable published draws (optional auth to attach user entry/winnings)
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    return requireAuth(req as any, res, next);
  }
  next();
}, getDraws);

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    return requireAuth(req as any, res, next);
  }
  next();
}, getDrawById);

// Admin-only endpoints
router.post("/simulate", requireAuth, requireAdmin, simulateDraw);
router.post("/publish", requireAuth, requireAdmin, publishDraw);

export default router;
