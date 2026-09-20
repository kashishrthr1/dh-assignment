import { Router } from "express";
import {
  getMyWinnings,
  uploadWinnerProof,
  adminGetAllWinners,
  adminVerifyProof,
  adminTogglePayout,
} from "../controllers/winnerController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";
import { uploadProof } from "../config/cloudinary";

const router = Router();

router.use(requireAuth);

// Subscriber routes (supports both /me and /my-winnings)
router.get("/me", getMyWinnings);
router.get("/my-winnings", getMyWinnings);
router.post("/:id/proof", uploadProof.single("proof"), uploadWinnerProof);

// Admin routes (supports /all, /, and /admin for full compatibility)
router.get("/all", requireAdmin, adminGetAllWinners);
router.get("/", requireAdmin, adminGetAllWinners);
router.get("/admin", requireAdmin, adminGetAllWinners);

// Proof verification (supports PUT and PATCH)
router.put("/:id/verify", requireAdmin, adminVerifyProof);
router.patch("/:id/verify", requireAdmin, adminVerifyProof);

// Payout toggling (supports PUT and PATCH)
router.put("/:id/payout", requireAdmin, adminTogglePayout);
router.patch("/:id/payout", requireAdmin, adminTogglePayout);

export default router;
