import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Dices,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
} from "lucide-react";

export function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"pure_random" | "algorithmic">("algorithmic");

  // Simulation state
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Publish state
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDraws = async () => {
    try {
      const res = await api.get("/draws");
      setDraws(res.data.draws || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    setMessage(null);
    try {
      const res = await api.post("/draws/simulate", { drawMode: mode });
      setSimResult(res.data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Simulation failed." });
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (
      !window.confirm(
        "Are you sure you want to execute and PUBLISH the official monthly draw? This will snapshot active entries and finalize cash prizes."
      )
    ) {
      return;
    }

    setPublishing(true);
    setMessage(null);
    try {
      const res = await api.post("/draws/publish", { drawMode: mode });
      setMessage({
        type: "success",
        text: `Draw #${res.data.draw.drawNumber} published successfully! Winning numbers: ${res.data.draw.winningNumbers.join(", ")}.`,
      });
      setSimResult(null);
      fetchDraws();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Publish failed." });
    } finally {
      setPublishing(false);
    }
  };

  const upcomingDraw = draws.find((d) => d.status === "scheduled");

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Prize Engine & Draw Execution Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate dry runs, configure algorithm weighting, and publish the official monthly draw.
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

      {/* Control Station Card */}
      <FadeIn delay={0.1}>
        <Card className="p-6 bg-[#0d131a] border-[#1a2330] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase text-amber-400">
                Engine Mode Configuration
              </span>
              <h2 className="text-xl font-bold font-display text-white mt-1">
                Draw Weighting Algorithm
              </h2>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-[#151e29] p-1 rounded-xl border border-[#1f2c3d]">
              <button
                type="button"
                onClick={() => setMode("algorithmic")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === "algorithmic"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Algorithmic Weighted
              </button>
              <button
                type="button"
                onClick={() => setMode("pure_random")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === "pure_random"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Pure Random (Uniform)
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {mode === "algorithmic"
              ? "Algorithmic weighting gives slight mathematical probability adjustments to numbers frequently played by consistent golfers (between 1.0x and 2.75x weight), rewarding regular Stableford performance without skewing integrity."
              : "Pure Random uses cryptographically unweighted selection from 1 to 45 with equal uniform odds for every number."}
          </p>

          <div className="pt-4 border-t border-[#1a2330] flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleSimulate}
              isLoading={simulating}
            >
              <Play className="w-4 h-4 mr-2 text-amber-400" /> Simulate Dry Run
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              isLoading={publishing}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Execute & Publish Official Draw
            </Button>
          </div>
        </Card>
      </FadeIn>

      {/* Dry Run Simulation Modal / Panel */}
      {simResult && (
        <FadeIn>
          <Card className="p-6 bg-[#101824] border-amber-500/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-lg font-bold font-display text-white">
                  Simulation Dry Run Results (Not Saved)
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSimResult(null)}
              >
                Dismiss
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Drawn Winning Numbers:
              </span>
              <div className="flex gap-2">
                {simResult.winningNumbers?.map((num: number, i: number) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center text-lg"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0d131a] border border-[#1a2330]">
                <div className="text-xs text-slate-400">Match 5 Winners</div>
                <div className="text-xl font-bold font-mono text-white">
                  {simResult.tierResults?.tier1?.winnersCount || 0}
                </div>
                <div className="text-xs text-amber-400 mt-1">
                  £{simResult.tierResults?.tier1?.payoutPerWinner || 0} payout each
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0d131a] border border-[#1a2330]">
                <div className="text-xs text-slate-400">Match 4 Winners</div>
                <div className="text-xl font-bold font-mono text-white">
                  {simResult.tierResults?.tier2?.winnersCount || 0}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  £{simResult.tierResults?.tier2?.payoutPerWinner || 0} payout each
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0d131a] border border-[#1a2330]">
                <div className="text-xs text-slate-400">Match 3 Winners</div>
                <div className="text-xl font-bold font-mono text-white">
                  {simResult.tierResults?.tier3?.winnersCount || 0}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  £{simResult.tierResults?.tier3?.payoutPerWinner || 0} payout each
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Historical Draws Ledger */}
      <FadeIn delay={0.2}>
        <Card className="p-6 bg-[#0d131a] border-[#1a2330]">
          <h3 className="text-lg font-bold text-white font-display mb-4">
            Executed Draw Ledger ({draws.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1a2330] text-xs text-slate-400 uppercase">
                  <th className="py-3 px-4">Draw</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Numbers</th>
                  <th className="py-3 px-4">Pool</th>
                  <th className="py-3 px-4">Rollover</th>
                  <th className="py-3 px-4">Winners (T1/T2/T3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2330]">
                {draws.map((d) => (
                  <tr key={d._id} className="hover:bg-[#151e29]/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      #{d.drawNumber}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={d.status === "completed" ? "emerald" : "gold"}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-400 capitalize">
                      {d.drawMode?.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {d.winningNumbers?.length > 0 ? d.winningNumbers.join(", ") : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-white">
                      £{d.prizePoolTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      £{d.rolloverAmount ? d.rolloverAmount.toLocaleString() : "0"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {d.tier1WinnersCount} / {d.tier2WinnersCount} / {d.tier3WinnersCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
