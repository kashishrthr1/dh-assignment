import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Trophy,
  Heart,
  Target,
  Gift,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ScoreItem {
  _id: string;
  stablefordScore: number;
  date: string;
  courseName?: string;
}

interface UpcomingDraw {
  _id: string;
  drawNumber: number;
  drawDate: string;
  prizePoolTotal: number;
  jackpotTotal: number;
  status: string;
}

export function DashboardOverviewPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [upcomingDraw, setUpcomingDraw] = useState<UpcomingDraw | null>(null);
  const [charity, setCharity] = useState<any>(null);
  const [winningsTotal, setWinningsTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresRes, drawsRes, winningsRes] = await Promise.all([
          api.get("/scores"),
          api.get("/draws"),
          api.get("/winners/my-winnings").catch(() => ({ data: { totalWon: 0 } })),
        ]);

        setScores(scoresRes.data.scores || []);
        const upcoming = drawsRes.data.draws?.find((d: any) => d.status === "scheduled");
        setUpcomingDraw(upcoming || drawsRes.data.draws?.[0] || null);
        setWinningsTotal(winningsRes.data.totalWon || 0);

        if (user?.selectedCharityId) {
          const charId = typeof user.selectedCharityId === "object" ? user.selectedCharityId._id : user.selectedCharityId;
          const charityRes = await api.get(`/charities/${charId}`);
          setCharity(charityRes.data.charity);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-emerald border-t-transparent rounded-full" />
      </div>
    );
  }

  const scoresCount = scores.length;
  const isTicketReady = scoresCount === 5;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Welcome back, {user?.fullName?.split(" ")[0]}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Your golf rounds power real charity impact and monthly cash draws.
            </p>
          </div>
          <Link to="/dashboard/scores">
            <Button variant="primary">
              <PlusCircle className="w-4 h-4 mr-2" /> Log Round
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* KPI Cards */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Active Draw Ticket
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-primary-emerald">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {scoresCount} / 5
            </div>
            <p className="text-xs text-text-muted mt-2">
              {isTicketReady
                ? "✓ Ticket fully armed for next draw"
                : `Add ${5 - scoresCount} more score${5 - scoresCount > 1 ? "s" : ""} to enter`}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Next Draw Pool
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-accent-gold">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              £{((upcomingDraw?.prizePoolTotal ?? (upcomingDraw as any)?.totalPrizePool ?? 2500)).toLocaleString()}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Jackpot: £{((upcomingDraw?.jackpotTotal ?? (upcomingDraw as any)?.tier5Pool ?? 1000)).toLocaleString()}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Charity Allocation
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {user?.charityPercentage || 20}%
            </div>
            <p className="text-xs text-text-muted mt-2 truncate">
              Direct to {charity?.name || "Selected Charity"}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Total Winnings
              </span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              £{winningsTotal.toLocaleString()}
            </div>
            <p className="text-xs text-text-muted mt-2">
              <Link to="/dashboard/winnings" className="text-primary-emerald hover:underline">
                View payout ledger →
              </Link>
            </p>
          </Card>
        </div>
      </FadeIn>

      {/* Ticket Tracker & Current Scores */}
      <FadeIn delay={0.2}>
        <Card variant="neon" className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  Your Current Draw Ticket
                </h2>
                <Badge variant={isTicketReady ? "emerald" : "amber"}>
                  {isTicketReady ? "Active In Next Draw" : "Incomplete (Need 5)"}
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Your last 5 logged Stableford scores automatically constitute your lottery numbers.
              </p>
            </div>
            <Link to="/dashboard/scores">
              <Button variant="outline" size="sm">
                Manage Scores <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((index) => {
              const score = scores[index];
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    score
                      ? "bg-surface-elevated border-primary-emerald/40 shadow-neon"
                      : "bg-surface-base/50 border-dashed border-surface-border text-text-muted"
                  }`}
                >
                  <span className="text-[11px] uppercase font-semibold text-text-muted mb-1">
                    Slot {index + 1}
                  </span>
                  {score ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                        {score.stablefordScore}
                      </span>
                      <span className="text-[10px] text-text-muted mt-1 truncate max-w-full">
                        {new Date(score.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-mono text-text-muted/40 py-2">--</span>
                  )}
                </div>
              );
            })}
          </div>

          {!isTicketReady && (
            <div className="mt-5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                You need 5 logged scores to participate in the draw. Log {5 - scoresCount} more round
                to activate your ticket.
              </span>
            </div>
          )}
        </Card>
      </FadeIn>

      {/* Two Column Section: Upcoming Draw + Charity Partner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Draw Card */}
        <FadeIn delay={0.3}>
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-accent-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Next Official Draw
                </span>
                <Badge variant="gold">
                  Draw #{upcomingDraw?.drawNumber || 1}
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-white font-display mb-2">
                Monthly Prize Pool
              </h3>
              <div className="text-3xl font-extrabold font-mono text-white mb-4">
                £{((upcomingDraw?.prizePoolTotal ?? (upcomingDraw as any)?.totalPrizePool ?? 2500)).toLocaleString()}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-surface-border/50 text-text-secondary">
                  <span>Match 5 (Jackpot)</span>
                  <span className="font-mono font-bold text-accent-gold">
                    £{((upcomingDraw?.jackpotTotal ?? (upcomingDraw as any)?.tier5Pool ?? 1000)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-border/50 text-text-secondary">
                  <span>Match 4 (Tier 2)</span>
                  <span className="font-mono font-bold text-white">
                    £{(((upcomingDraw?.prizePoolTotal ?? (upcomingDraw as any)?.totalPrizePool ?? 2500) * 0.35)).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-text-secondary">
                  <span>Match 3 (Tier 3)</span>
                  <span className="font-mono font-bold text-white">
                    £{(((upcomingDraw?.prizePoolTotal ?? (upcomingDraw as any)?.totalPrizePool ?? 2500) * 0.25)).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border flex justify-between items-center">
              <span className="text-xs text-text-muted">
                Draw Date: {upcomingDraw?.drawDate ? new Date(upcomingDraw.drawDate).toLocaleDateString() : "End of month"}
              </span>
              <Link to="/dashboard/draws">
                <Button variant="ghost" size="sm">
                  View Draw Details →
                </Button>
              </Link>
            </div>
          </Card>
        </FadeIn>

        {/* Charity Impact Card */}
        <FadeIn delay={0.4}>
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> Your Giving Impact
                </span>
                <Badge variant="rose">{user?.charityPercentage || 20}% Allocated</Badge>
              </div>

              <h3 className="text-xl font-bold text-white font-display mb-2">
                {charity?.name || "Partner Charity"}
              </h3>
              <p className="text-sm text-text-muted line-clamp-3 mb-4">
                {charity?.shortDescription ||
                  "Every monthly subscription fee directly supports verified charitable causes across the UK."}
              </p>

              <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border/60">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-text-muted">Estimated Monthly Gift:</span>
                  <span className="font-mono font-bold text-rose-400">
                    £{((20 * (user?.charityPercentage || 20)) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted">
                  <span>Category:</span>
                  <span className="text-white capitalize">{charity?.category || "Community"}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border flex justify-between items-center">
              <span className="text-xs text-text-muted">Change charity or percentage anytime</span>
              <Link to="/dashboard/charity">
                <Button variant="ghost" size="sm">
                  Adjust Impact →
                </Button>
              </Link>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
