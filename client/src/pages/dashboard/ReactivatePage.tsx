import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FadeIn } from "../../components/motion/FadeIn";
import { Lock, Sparkles, Trophy, ArrowRight, ShieldCheck } from "lucide-react";

export function ReactivatePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReactivate = async (tier: "monthly" | "yearly") => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/payments/checkout", { tier });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Could not initialize Stripe checkout. Please contact support or retry."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <FadeIn>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-neon">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Subscription Lapsed
          </h1>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Your Digital Heroes membership is currently inactive. Your scores and historical records are safely archived, but your ticket is not entered into active draws.
          </p>
        </div>
      </FadeIn>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Plan Options */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-white font-display">Monthly Hero</h3>
              <div className="text-3xl font-extrabold font-mono text-white mt-2">
                £20<span className="text-xs text-text-muted font-normal">/mo</span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Standard monthly participation. £4 goes to the draw, minimum £2 to charity.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => handleReactivate("monthly")}
              isLoading={loading}
            >
              Reactivate Monthly
            </Button>
          </Card>

          <Card variant="neon" className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-white font-display">Annual Pass</h3>
                <span className="text-[10px] uppercase font-bold text-accent-gold bg-amber-500/10 px-2 py-0.5 rounded">
                  Save £40
                </span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-white mt-2">
                £200<span className="text-xs text-text-muted font-normal">/yr</span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                12 continuous months of entry for the price of 10. Maximize your charity impact.
              </p>
            </div>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => handleReactivate("yearly")}
              isLoading={loading}
            >
              Reactivate Annual
            </Button>
          </Card>
        </div>
      </FadeIn>

      {/* View Read-only data */}
      <FadeIn delay={0.2}>
        <div className="text-center pt-4 border-t border-surface-border">
          <p className="text-xs text-text-muted mb-3">
            Want to inspect your past achievements first?
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link
              to="/dashboard/scores"
              className="text-primary-emerald hover:underline font-medium"
            >
              View Score Archive →
            </Link>
            <Link
              to="/dashboard/winnings"
              className="text-primary-emerald hover:underline font-medium"
            >
              View Past Winnings →
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
