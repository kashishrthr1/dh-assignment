import { Request, Response } from "express";
import Stripe from "stripe";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";
const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" as any });

export async function createCheckoutSession(req: AuthRequest, res: Response) {
  try {
    const { plan, charityId, charityPercentage } = req.body;
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found." });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const isConfigured = stripeKey.startsWith("sk_test_") && stripeKey.length > 20;

    if (isConfigured) {
      const priceId =
        plan === "yearly"
          ? process.env.STRIPE_YEARLY_PRICE_ID
          : process.env.STRIPE_MONTHLY_PRICE_ID;

      const lineItems = priceId && !priceId.includes("placeholder")
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Digital Heroes ${plan === "yearly" ? "Yearly Pass" : "Monthly Flex"}`,
                  description: "Full draw access, 5-score Stableford tracker, and direct charity contribution.",
                },
                unit_amount: plan === "yearly" ? 18900 : 1900,
                recurring: { interval: (plan === "yearly" ? "year" : "month") as "year" | "month" },
              },
              quantity: 1,
            },
          ];

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: user.email,
        line_items: lineItems,
        metadata: {
          userId: user._id.toString(),
          plan: plan || "monthly",
          charityId: charityId || "",
          charityPercentage: String(charityPercentage || 10),
        },
        success_url: `${clientUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/dashboard/settings?payment=canceled`,
      });

      return res.json({ url: session.url });
    }

    // Simulation mode fallback
    const renewalDate = new Date();
    if (plan === "yearly") {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    user.subscriptionStatus = "active";
    user.subscriptionTier = plan || "monthly";
    user.currentPeriodEnd = renewalDate;
    if (charityId) user.selectedCharityId = charityId;
    if (charityPercentage) user.charityPercentage = Number(charityPercentage);
    await user.save();

    return res.json({
      url: `${clientUrl}/dashboard?payment=simulated_success`,
      simulated: true,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message || "Failed to create checkout session." });
  }
}

export async function createPortalSession(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found." });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const isConfigured = stripeKey.startsWith("sk_test_") && stripeKey.length > 20 && user.stripeCustomerId;

    if (isConfigured) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId!,
        return_url: `${clientUrl}/dashboard/settings`,
      });
      return res.json({ url: portalSession.url });
    }

    return res.json({
      url: `${clientUrl}/dashboard/settings?portal_simulated=true`,
      simulated: true,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || signature === "simulated") {
    return res.json({ received: true, simulated: true });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature as string, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "monthly" | "yearly";
        const charityId = session.metadata?.charityId;
        const charityPercentage = Number(session.metadata?.charityPercentage || 10);

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            subscriptionStatus: "active",
            subscriptionTier: plan || "monthly",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            selectedCharityId: charityId || null,
            charityPercentage,
            currentPeriodEnd: new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000),
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await User.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription },
            {
              subscriptionStatus: "active",
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await User.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription },
            { subscriptionStatus: "past_due" }
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { subscriptionStatus: "canceled" }
        );
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Webhook handler failed." });
  }
}
