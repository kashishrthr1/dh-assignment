import { Router } from "express";
import {
  getCharities,
  getCharityBySlug,
  updateCharityPreference,
  createOneOffDonation,
  adminCreateCharity,
  adminUpdateCharity,
  adminDeleteCharity,
} from "../controllers/charityController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/", getCharities);
router.get("/:slug", getCharityBySlug);
router.post("/donate", createOneOffDonation);

// Subscriber route
router.patch("/select", requireAuth, updateCharityPreference);

// Admin routes
router.post("/", requireAuth, requireAdmin, adminCreateCharity);
router.patch("/:id", requireAuth, requireAdmin, adminUpdateCharity);
router.delete("/:id", requireAuth, requireAdmin, adminDeleteCharity);

export default router;
