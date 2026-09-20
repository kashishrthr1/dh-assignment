import { Router } from "express";
import express from "express";
import {
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhook,
} from "../controllers/paymentController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/checkout", requireAuth, createCheckoutSession);
router.post("/portal", requireAuth, createPortalSession);

// Stripe webhook requires raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
