import { Router } from "express";
import { getScores, addScore, deleteScore, adminUpdateScore } from "../controllers/scoreController";
import { requireAuth, requireActiveSubscription, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", getScores);
router.post("/", requireActiveSubscription, addScore);
router.delete("/:id", deleteScore);
router.patch("/:id/admin", requireAdmin, adminUpdateScore);

export default router;
