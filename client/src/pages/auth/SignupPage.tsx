import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import { Trophy, Heart, ArrowRight, Check, Sparkles } from "lucide-react";

interface CharityOption {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tier, setTier] = useState<"monthly" | "yearly">("monthly");
  const [charityPercentage, setCharityPercentage] = useState<number>(20);
  const [charities, setCharities] = useState<CharityOption[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/charities")
      .then((res) => {
        setCharities(res.data.charities || []);
        if (res.data.charities?.length > 0) {
          setSelectedCharityId(res.data.charities[0]._id);
        }
      })
      .catch(() => {});
  }, []);

  const price = tier === "monthly" ? 20 : 200;
  const prizePoolAmount = (price * 0.2).toFixed(2);
  const charityAmount = ((price * charityPercentage) / 100).toFixed(2);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please complete all registration fields.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFinalSignup = async () => {
    setLoading(true);
    setError("");

    try {
      await signup({
        fullName,
        email,
        password,
        subscriptionTier: tier,
        charityPercentage,
        selectedCharityId: selectedCharityId || undefined,
      });

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <FadeIn>
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-emerald to-emerald-700 flex items-center justify-center shadow-neon">
                <Trophy className="w-5 h-5 text-surface-base" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                DIGITAL<span className="text-primary-emerald">HEROES</span>
              </span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              {step === 1 ? "Create your account" : "Configure your membership"}
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              {step === 1
                ? "Join the monthly draw and support causes that matter."
                : "Choose your plan and decide your monthly charitable contribution."}
            </p>
          </div>

          <Card variant="neon" className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleInitialSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-xl text-white placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-emerald focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-xl text-white placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-emerald focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-xl text-white placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-emerald focus:border-transparent transition-all"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full mt-6">
                  Continue to Plan Selection <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-center text-sm text-text-muted mt-6">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary-emerald hover:text-emerald-400 font-medium underline-offset-4 hover:underline"
                  >
                    Log in here
                  </Link>
                </p>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Plan Toggle */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-3">
                    Select Membership Plan
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTier("monthly")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        tier === "monthly"
                          ? "bg-primary-emerald/10 border-primary-emerald text-white shadow-neon"
                          : "bg-surface-elevated border-surface-border text-text-muted hover:border-surface-border/80"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-white">Monthly</span>
                        {tier === "monthly" && <Check className="w-4 h-4 text-primary-emerald" />}
                      </div>
                      <div className="text-xl font-bold font-mono text-white">£20<span className="text-xs font-normal text-text-muted">/mo</span></div>
                      <p className="text-xs text-text-muted mt-1">Flexible monthly billing</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTier("yearly")}
                      className={`p-4 rounded-xl border text-left transition-all relative ${
                        tier === "yearly"
                          ? "bg-primary-emerald/10 border-primary-emerald text-white shadow-neon"
                          : "bg-surface-elevated border-surface-border text-text-muted hover:border-surface-border/80"
                      }`}
                    >
                      <Badge variant="gold" className="absolute -top-2.5 right-3">
                        Save £40
                      </Badge>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-white">Annual</span>
                        {tier === "yearly" && <Check className="w-4 h-4 text-primary-emerald" />}
                      </div>
                      <div className="text-xl font-bold font-mono text-white">£200<span className="text-xs font-normal text-text-muted">/yr</span></div>
                      <p className="text-xs text-text-muted mt-1">2 months free included</p>
                    </button>
                  </div>
                </div>

                {/* Charity Picker */}
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2 flex items-center justify-between">
                    <span>Partner Charity</span>
                    <span className="text-xs text-text-muted">Changeable anytime</span>
                  </label>
                  <select
                    value={selectedCharityId}
                    onChange={(e) => setSelectedCharityId(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-card border border-surface-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-emerald focus:border-transparent transition-all"
                  >
                    {charities.map((c) => (
                      <option key={c._id} value={c._id} className="bg-surface-card text-white">
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contribution Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-text-muted flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                      Charity Allocation ({charityPercentage}%)
                    </label>
                    <span className="text-sm font-mono font-bold text-rose-400">
                      £{charityAmount} / {tier === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={charityPercentage}
                    onChange={(e) => setCharityPercentage(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-2 bg-surface-elevated rounded-lg"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>Min 10%</span>
                    <span>Standard 20%</span>
                    <span>Max 50%</span>
                  </div>
                </div>

                {/* Fintech Fund Breakdown */}
                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border/60 space-y-2 text-sm">
                  <div className="font-semibold text-xs text-text-muted uppercase tracking-wider mb-2">
                    Where your {tier === "monthly" ? "£20/mo" : "£200/yr"} goes:
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-accent-gold" /> Prize Pool (20% guaranteed)
                    </span>
                    <span className="font-mono text-white">£{prizePoolAmount}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" /> Charity Impact ({charityPercentage}%)
                    </span>
                    <span className="font-mono text-white">£{charityAmount}</span>
                  </div>
                  <div className="flex justify-between text-text-muted text-xs pt-1 border-t border-surface-border/40">
                    <span>Operations & Platform</span>
                    <span className="font-mono">
                      £{(price - Number(prizePoolAmount) - Number(charityAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={handleFinalSignup}
                    isLoading={loading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Complete Registration
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
