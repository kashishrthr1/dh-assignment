import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  BarChart3,
  Download,
  TrendingUp,
  Heart,
  Trophy,
  Users,
  ShieldAlert,
} from "lucide-react";

export function AdminReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/reports")
      .then((res) => setReports(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Total Subscribers,${kpis.totalSubscribers}\n` +
      `Active Subscribers,${kpis.activeSubscribers}\n` +
      `Total Charity Raised (£),${kpis.totalCharityRaised}\n` +
      `Total Prize Pool Generated (£),${kpis.totalPrizePoolGenerated}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `digital-heroes-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Financial Solvency & Impact Reports
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Statutory reconciliation of subscriber funds, prize pools, and charity disbursements.
            </p>
          </div>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export Audit CSV
          </Button>
        </div>
      </FadeIn>

      {/* Fund Flow Diagram / Breakdown */}
      <FadeIn delay={0.1}>
        <Card className="p-6 bg-[#0d131a] border-[#1a2330] space-y-6">
          <h2 className="text-xl font-bold font-display text-white">
            Subscription Capital Allocation Model
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#151e29] border border-[#1f2c3d] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
                <span>Prize Pool Engine</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400">20.0%</div>
              <p className="text-xs text-slate-400">
                Guaranteed reserve allocated automatically to every monthly draw. Tier 1 (40%), Tier 2 (35%), Tier 3 (25%).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151e29] border border-[#1f2c3d] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
                <span>Charity Beneficiaries</span>
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-rose-400">10% - 50%</div>
              <p className="text-xs text-slate-400">
                Directed directly by subscriber preference. Minimum 10% statutory giving requirement strictly preserved.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151e29] border border-[#1f2c3d] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
                <span>Platform & Operations</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-blue-400">30% - 70%</div>
              <p className="text-xs text-slate-400">
                Covers payment gateway fees (Stripe 1.5% + 20p), Cloudinary storage, IT compliance, and audit costs.
              </p>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Summary Metrics Table */}
      <FadeIn delay={0.2}>
        <Card className="p-6 bg-[#0d131a] border-[#1a2330]">
          <h3 className="text-lg font-bold text-white font-display mb-4">
            Audited Balance Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-[#1a2330] text-sm">
              <span className="text-slate-400">Total Registered Members:</span>
              <span className="font-mono font-bold text-white">{kpis.totalSubscribers}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#1a2330] text-sm">
              <span className="text-slate-400">Active Paying Subscribers:</span>
              <span className="font-mono font-bold text-emerald-400">{kpis.activeSubscribers}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#1a2330] text-sm">
              <span className="text-slate-400">Cumulative Charity Donations Generated:</span>
              <span className="font-mono font-bold text-rose-400">
                £{kpis.totalCharityRaised.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="text-slate-400">Cumulative Monthly Prize Pool Reserves:</span>
              <span className="font-mono font-bold text-amber-400">
                £{kpis.totalPrizePoolGenerated.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
