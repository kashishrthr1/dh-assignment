import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Award,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

interface WinnerRecord {
  _id: string;
  drawId: {
    _id: string;
    drawNumber: number;
    drawDate: string;
  };
  tier: "tier1" | "tier2" | "tier3";
  matchedCount: number;
  amountWon: number;
  verificationStatus: "unsubmitted" | "pending_review" | "approved" | "rejected";
  payoutStatus: "pending" | "paid";
  proofScorecardUrl?: string;
  rejectionReason?: string;
  createdAt: string;
}

export function WinningsPage() {
  const [winnings, setWinnings] = useState<WinnerRecord[]>([]);
  const [totalWon, setTotalWon] = useState(0);
  const [loading, setLoading] = useState(true);

  // Upload modal / form state
  const [activeWinner, setActiveWinner] = useState<WinnerRecord | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchWinnings = async () => {
    try {
      const res = await api.get("/winners/my-winnings");
      setWinnings(res.data.winnings || []);
      setTotalWon(res.data.totalWon || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinnings();
  }, []);

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWinner || !proofFile) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("proof", proofFile);

    try {
      await api.post(`/winners/${activeWinner._id}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({
        type: "success",
        text: "Scorecard uploaded successfully! Our compliance team is reviewing it.",
      });
      setActiveWinner(null);
      setProofFile(null);
      fetchWinnings();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload scorecard.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-emerald border-t-transparent rounded-full" />
      </div>
    );
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "tier1":
        return "Tier 1 (5 Match Jackpot)";
      case "tier2":
        return "Tier 2 (4 Matches)";
      case "tier3":
        return "Tier 3 (3 Matches)";
      default:
        return tier;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Winnings & Payouts Ledger
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Track draw winnings, submit scorecard proof for verification, and review disbursement status.
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-surface-card border border-primary-emerald/40 flex items-center gap-4">
            <div>
              <span className="text-xs uppercase text-text-muted font-medium">
                Lifetime Prize Total
              </span>
              <div className="text-2xl font-bold font-mono text-primary-emerald">
                £{totalWon.toLocaleString()}
              </div>
            </div>
            <Award className="w-8 h-8 text-accent-gold" />
          </div>
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

      {/* Winnings Ledger Table */}
      <FadeIn delay={0.1}>
        <Card className="p-6">
          <h2 className="text-xl font-bold font-display text-white mb-4">
            Your Winning Records ({winnings.length})
          </h2>

          {winnings.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-30 text-accent-gold" />
              <p className="text-base font-medium text-white">No winning records yet</p>
              <p className="text-xs mt-1">
                Keep your 5 rounds logged to participate in the upcoming monthly draw!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-xs text-text-muted uppercase">
                    <th className="py-3 px-4">Draw</th>
                    <th className="py-3 px-4">Prize Tier</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Payout Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {winnings.map((w) => (
                    <tr key={w._id} className="hover:bg-surface-elevated/40">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white">
                          Draw #{w.drawId?.drawNumber || "—"}
                        </span>
                        <div className="text-xs text-text-muted">
                          {w.drawId?.drawDate
                            ? new Date(w.drawId.drawDate).toLocaleDateString("en-GB")
                            : ""}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">
                          {getTierLabel(w.tier)}
                        </span>
                        <div className="text-xs text-primary-emerald font-mono">
                          {w.matchedCount} numbers matched
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-accent-gold text-base">
                        £{w.amountWon.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            w.verificationStatus === "approved"
                              ? "emerald"
                              : w.verificationStatus === "pending_review"
                              ? "amber"
                              : w.verificationStatus === "rejected"
                              ? "rose"
                              : "muted"
                          }
                        >
                          {w.verificationStatus.replace("_", " ").toUpperCase()}
                        </Badge>
                        {w.rejectionReason && (
                          <div className="text-[11px] text-rose-400 mt-1">
                            {w.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={w.payoutStatus === "paid" ? "emerald" : "muted"}>
                          {w.payoutStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {w.amountWon >= 100 &&
                        (w.verificationStatus === "unsubmitted" ||
                          w.verificationStatus === "rejected") ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveWinner(w)}
                          >
                            <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload Proof
                          </Button>
                        ) : w.proofScorecardUrl ? (
                          <a
                            href={w.proofScorecardUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary-emerald hover:underline inline-flex items-center gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> View Proof
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted">No proof required</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </FadeIn>

      {/* Upload Proof Modal */}
      {activeWinner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary-emerald" /> Upload Scorecard Proof
            </h3>
            <p className="text-sm text-text-secondary">
              For security and regulatory compliance, prizes of £100+ require an uploaded photo or screenshot of your signed physical scorecard or golf tracking app.
            </p>

            <form onSubmit={handleUploadProof} className="space-y-4">
              <div className="p-4 rounded-xl border border-dashed border-surface-border bg-surface-base text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-emerald file:text-surface-base hover:file:opacity-90 cursor-pointer"
                />
                {proofFile && (
                  <p className="text-xs text-emerald-400 mt-2">
                    Selected: {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveWinner(null)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={uploading}>
                  Submit for Compliance Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
