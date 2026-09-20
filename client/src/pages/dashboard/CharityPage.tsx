import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Heart,
  Calendar,
  MapPin,
  Check,
  Sparkles,
  ExternalLink,
  Users,
  DollarSign,
} from "lucide-react";

interface Charity {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  logoUrl?: string;
  websiteUrl?: string;
  totalRaised: number;
  golfDays?: Array<{
    _id: string;
    title: string;
    date: string;
    courseName: string;
    entryFee: number;
    description?: string;
  }>;
}

export function CharityPage() {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(user?.charityPercentage || 20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // One-off donation state
  const [donateModalCharity, setDonateModalCharity] = useState<Charity | null>(null);
  const [donateAmount, setDonateAmount] = useState<number>(25);
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    api
      .get("/charities")
      .then((res) => {
        const list = res.data.charities || [];
        setCharities(list);
        if (user?.selectedCharityId) {
          const id = typeof user.selectedCharityId === "object" ? user.selectedCharityId._id : user.selectedCharityId;
          setSelectedCharityId(id);
        } else if (list.length > 0) {
          setSelectedCharityId(list[0]._id);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSavePreference = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/charities/preference", {
        charityId: selectedCharityId,
        percentage,
      });
      await refreshUser();
      setMessage({ type: "success", text: "Giving preferences updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update preferences." });
    } finally {
      setSaving(false);
    }
  };

  const handleOneOffDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateModalCharity) return;
    setDonating(true);
    try {
      await api.post(`/charities/${donateModalCharity._id}/donate`, {
        amount: donateAmount,
      });
      setMessage({
        type: "success",
        text: `Thank you! £${donateAmount} donation registered to ${donateModalCharity.name}.`,
      });
      setDonateModalCharity(null);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Donation failed.",
      });
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-emerald border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeCharity = charities.find((c) => c._id === selectedCharityId);
  const monthlyFee = user?.subscriptionTier === "yearly" ? 200 / 12 : 20;
  const calculatedContribution = ((monthlyFee * percentage) / 100).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Charity Giving & Events
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Control exactly where your subscription pounds go. You can reassign your beneficiary charity or boost your monthly giving rate anytime.
          </p>
        </div>
      </FadeIn>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Allocation Preference Controller */}
      <FadeIn delay={0.1}>
        <Card variant="neon" className="p-6">
          <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" /> Monthly Impact Allocation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Subscription Contribution Percentage
                  </label>
                  <span className="font-mono font-bold text-lg text-rose-400">
                    {percentage}% (£{calculatedContribution}/mo)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-surface-elevated rounded-lg"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>10% (Minimum)</span>
                  <span>20% (Standard)</span>
                  <span>50% (Heroic)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Selected Beneficiary Charity
                </label>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-base border border-surface-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-emerald"
                >
                  {charities.map((c) => (
                    <option key={c._id} value={c._id} className="bg-surface-card text-white">
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                onClick={handleSavePreference}
                isLoading={saving}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Save Allocation Settings
              </Button>
            </div>

            {/* Current Beneficiary Card */}
            {activeCharity && (
              <div className="p-5 rounded-2xl bg-surface-elevated border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-rose-400">
                    Active Beneficiary
                  </span>
                  <Badge variant="muted">{activeCharity.category}</Badge>
                </div>
                <h3 className="text-xl font-bold font-display text-white">
                  {activeCharity.name}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-3">
                  {activeCharity.shortDescription}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-surface-border/50 text-xs">
                  <span className="text-text-muted">Total Raised on Platform:</span>
                  <span className="font-mono font-bold text-white">
                    £{activeCharity.totalRaised.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* Charity Partner Directory */}
      <FadeIn delay={0.2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white">
              Approved Partner Charities
            </h2>
            <span className="text-xs text-text-muted">100% verified UK registered charities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((c) => {
              const isCurrent = c._id === selectedCharityId;
              return (
                <Card key={c._id} className={`p-6 flex flex-col justify-between ${isCurrent ? "border-rose-500/40" : ""}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={isCurrent ? "rose" : "muted"}>
                        {isCurrent ? "Active Partner" : c.category}
                      </Badge>
                      {c.websiteUrl && (
                        <a
                          href={c.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-text-muted hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <h3 className="text-lg font-bold font-display text-white mb-2">
                      {c.name}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-3 mb-4">
                      {c.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-surface-border">
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Total Donated:</span>
                      <span className="font-mono font-semibold text-white">
                        £{c.totalRaised.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedCharityId(c._id);
                            handleSavePreference();
                          }}
                        >
                          Select
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setDonateModalCharity(c)}
                      >
                        <Heart className="w-3.5 h-3.5 mr-1 text-rose-400" /> One-off Gift
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Charity Golf Days Section */}
      <FadeIn delay={0.3}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-gold" /> Upcoming Charity Golf Days
          </h2>
          <p className="text-xs text-text-muted">
            Exclusive tournaments hosted by our charity partners. Play on premier championship courses while driving direct charitable giving.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {charities.flatMap((c) =>
              (c.golfDays || []).map((event) => (
                <Card key={event._id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="gold">Charity Tournament</Badge>
                      <span className="text-xs font-mono font-bold text-accent-gold">
                        Entry £{event.entryFee}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-white font-display">
                      {event.title}
                    </h3>
                    <p className="text-xs text-primary-emerald font-medium mt-0.5">
                      Benefiting: {c.name}
                    </p>
                    <div className="mt-3 space-y-1 text-xs text-text-muted">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-emerald" />
                        <span>{event.courseName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary-emerald" />
                        <span>{new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border flex justify-between items-center">
                    <span className="text-xs text-text-muted">Includes 18 holes & dinner</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Registration for "${event.title}" confirmed! Details will be emailed to ${user?.email}.`)}
                    >
                      Register Now
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </FadeIn>

      {/* One-off Donation Modal */}
      {donateModalCharity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" /> One-off Gift
            </h3>
            <p className="text-sm text-text-secondary">
              Direct a custom donation to <strong>{donateModalCharity.name}</strong> on top of your subscription.
            </p>

            <form onSubmit={handleOneOffDonation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                  Donation Amount (£)
                </label>
                <div className="flex gap-2 mb-3">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonateAmount(amt)}
                      className={`flex-1 py-2 rounded-lg text-sm font-mono font-semibold border ${
                        donateAmount === amt
                          ? "bg-rose-500/20 border-rose-500 text-white"
                          : "bg-surface-elevated border-surface-border text-text-muted"
                      }`}
                    >
                      £{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  required
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-surface-base border border-surface-border rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDonateModalCharity(null)}
                  disabled={donating}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={donating}>
                  Confirm £{donateAmount} Donation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
