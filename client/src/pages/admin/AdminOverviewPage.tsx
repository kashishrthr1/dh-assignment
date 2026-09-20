import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Users,
  Dices,
  Heart,
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export function AdminOverviewPage() {
  const [reports, setReports] = useState<any>(null);
  const [pendingWinners, setPendingWinners] = useState<any[]>([]);
  const [activeDraw, setActiveDraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, winnersRes, drawsRes] = await Promise.all([
          api.get("/admin/reports"),
          api.get("/winners/all?verificationStatus=pending_review").catch(() => ({ data: { winners: [] } })),
          api.get("/draws"),
        ]);

        setReports(reportsRes.data);
        setPendingWinners(winnersRes.data.winners || []);
        const upcoming = (drawsRes.data.draws || []).find((d: any) => d.status === "scheduled");
        setActiveDraw(upcoming || drawsRes.data.draws?.[0] || null);
      } catch (err) {
        console.error("Admin overview fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const kpis = reports?.kpis || {
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalCharityRaised: 0,
    totalPrizePoolGenerated: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Administrative Control Deck
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live oversight across subscriptions, prize pool solvency, winner verification, and charity allocations.
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/admin/draws">
              <Button variant="primary">
                <Dices className="w-4 h-4 mr-2" /> Draw Console
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* KPI Cards */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#0d131a] border-[#1a2330]">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Members
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {kpis?.totalSubscribers ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <span className="text-emerald-400 font-medium">{kpis?.activeSubscribers ?? 0}</span> active subscriptions
            </p>
          </Card>

          <Card className="p-5 bg-[#0d131a] border-[#1a2330]">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Charity Raised
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              £{(kpis?.totalCharityRaised ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Disbursed to UK verified partners
            </p>
          </Card>

          <Card className="p-5 bg-[#0d131a] border-[#1a2330]">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Prize Pool Generated
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              £{(kpis?.totalPrizePoolGenerated ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              20% mandatory allocation
            </p>
          </Card>

          <Card className="p-5 bg-[#0d131a] border-[#1a2330]">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pending Proof Audits
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {pendingWinners.length}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <Link to="/admin/winners" className="text-amber-400 hover:underline">
                Review proofs →
              </Link>
            </p>
          </Card>
        </div>
      </FadeIn>

      {/* Active Draw Spotlight & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.2}>
          <Card className="p-6 bg-[#0d131a] border-[#1a2330] space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-mono text-amber-400">
                  Current Draw Status
                </span>
                <h3 className="text-xl font-bold text-white font-display mt-0.5">
                  Draw #{activeDraw?.drawNumber || 1}
                </h3>
              </div>
              <Badge variant={activeDraw?.status === "completed" || activeDraw?.status === "published" ? "emerald" : "gold"}>
                {(activeDraw?.status || "scheduled").toUpperCase()}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-[#151e29] border border-[#1f2c3d] grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">Prize Pool</div>
                <div className="text-xl font-bold font-mono text-white">
                  £{((activeDraw?.prizePoolTotal ?? activeDraw?.totalPrizePool ?? 0)).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Jackpot (Tier 1)</div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  £{((activeDraw?.jackpotTotal ?? activeDraw?.tier5Pool ?? 0)).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">
                Scheduled: {activeDraw?.drawDate ? new Date(activeDraw.drawDate).toLocaleDateString("en-GB") : "TBD"}
              </span>
              <Link to="/admin/draws">
                <Button variant="outline" size="sm">
                  Open Engine Console <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </FadeIn>

        {/* Pending Winner Verification Widget */}
        <FadeIn delay={0.3}>
          <Card className="p-6 bg-[#0d131a] border-[#1a2330] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white font-display">
                Scorecard Proof Verification
              </h3>
              <Badge variant="amber">{pendingWinners.length} Awaiting</Badge>
            </div>

            {pendingWinners.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm text-white">All winner proofs verified</p>
                <p className="text-xs text-slate-500 mt-1">No pending scorecard uploads needing review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWinners.slice(0, 3).map((w: any) => (
                  <div
                    key={w._id}
                    className="p-3.5 rounded-xl bg-[#151e29] border border-[#1f2c3d] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">
                        {w.userId?.fullName || "Player"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {w.tier} • £{w.amountWon.toLocaleString()}
                      </div>
                    </div>
                    <Link to="/admin/winners">
                      <Button variant="outline" size="sm">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <div className="text-right pt-2">
              <Link to="/admin/winners" className="text-xs text-amber-400 hover:underline">
                View all winner payouts →
              </Link>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
