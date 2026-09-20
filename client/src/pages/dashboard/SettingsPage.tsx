import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  CreditCard,
  User,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export function SettingsPage() {
  const { user } = useAuth();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState("");

  const handleOpenStripePortal = async () => {
    setLoadingPortal(true);
    setPortalError("");
    try {
      const res = await api.post("/payments/portal");
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setPortalError(
        err.response?.data?.message ||
          "Stripe Customer Portal is unavailable in local sandbox without an active Stripe subscription ID."
      );
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Account & Billing Settings
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage your profile, Stripe billing preferences, and platform membership.
          </p>
        </div>
      </FadeIn>

      {/* Subscription Card */}
      <FadeIn delay={0.1}>
        <Card variant="neon" className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Current Membership
                </span>
                <Badge
                  variant={
                    user?.subscriptionStatus === "active" ? "emerald" : "rose"
                  }
                >
                  {user?.subscriptionStatus?.toUpperCase()}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold font-display text-white capitalize">
                {user?.subscriptionTier || "Monthly"} Plan
              </h2>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-white">
                {user?.subscriptionTier === "yearly" ? "£200/yr" : "£20/mo"}
              </div>
              <div className="text-xs text-text-muted">
                20% allocated directly to prize pool
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Stripe Self-Serve Billing Portal
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Update debit/credit cards, download official VAT invoices, or modify renewal.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleOpenStripePortal}
              isLoading={loadingPortal}
            >
              Manage in Stripe <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          {portalError && (
            <p className="text-xs text-amber-400 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              {portalError}
            </p>
          )}
        </Card>
      </FadeIn>

      {/* Profile Details */}
      <FadeIn delay={0.2}>
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-emerald" /> Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.fullName || ""}
                className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white opacity-80 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white opacity-80 cursor-not-allowed"
              />
            </div>
          </div>

          <p className="text-xs text-text-muted">
            To change your registered email address, please reach out to compliance support.
          </p>
        </Card>
      </FadeIn>

      {/* Fair Play & Integrity Policy */}
      <FadeIn delay={0.3}>
        <Card className="p-6 space-y-3 text-xs text-text-secondary">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary-emerald" /> Fair Play & Integrity Compliance
          </h3>
          <p>
            Digital Heroes operates in strict accordance with UK prize competition standards. All Stableford scores are audit-checked against official club records for prizes exceeding £100. Any intentionally manipulated scores result in immediate account disqualification and prize forfeit.
          </p>
        </Card>
      </FadeIn>
    </div>
  );
}
