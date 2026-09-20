import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import { handleImageError } from "../../lib/utils";
import {
  CheckSquare,
  FileCheck,
  ExternalLink,
  Check,
  X,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface AdminWinnerItem {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
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
}

export function AdminWinnersPage() {
  const [winners, setWinners] = useState<AdminWinnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinner, setSelectedWinner] = useState<AdminWinnerItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchWinners = async () => {
    try {
      const res = await api.get("/winners/all");
      setWinners(res.data.winners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleVerifyProof = async (status: "approved" | "rejected") => {
    if (!selectedWinner) return;
    setProcessing(true);
    try {
      await api.put(`/winners/${selectedWinner._id}/verify`, {
        verificationStatus: status,
        rejectionReason: status === "rejected" ? rejectionReason : undefined,
      });
      setMessage({
        type: "success",
        text: `Scorecard ${status === "approved" ? "approved" : "rejected"} successfully.`,
      });
      setSelectedWinner(null);
      setRejectionReason("");
      fetchWinners();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Verification failed." });
    } finally {
      setProcessing(false);
    }
  };

  const handleTogglePayout = async (winnerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "paid" ? "pending" : "paid";
    try {
      await api.put(`/winners/${winnerId}/payout`, {
        payoutStatus: nextStatus,
      });
      setMessage({ type: "success", text: `Payout status set to ${nextStatus}.` });
      fetchWinners();
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to update payout status." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Winner Audit & Payout Disbursement
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review uploaded scorecard proofs, verify Amateur Fair Play compliance, and authorize bank prize payouts.
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

      {/* Winners Ledger */}
      <FadeIn delay={0.1}>
        <Card className="p-6 bg-[#0d131a] border-[#1a2330]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1a2330] text-xs text-slate-400 uppercase">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Draw</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Amount Won</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Payout</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2330]">
                {winners.map((w) => (
                  <tr key={w._id} className="hover:bg-[#151e29]/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{w.userId?.fullName || "Player"}</div>
                      <div className="text-xs text-slate-400 font-mono">{w.userId?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      Draw #{w.drawId?.drawNumber || "—"}
                    </td>
                    <td className="py-3 px-4 uppercase text-xs font-semibold text-slate-400">
                      {w.tier} ({w.matchedCount} matches)
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
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
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={w.payoutStatus === "paid" ? "emerald" : "muted"}>
                        {w.payoutStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWinner(w)}
                      >
                        Review Proof
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePayout(w._id, w.payoutStatus)}
                      >
                        {w.payoutStatus === "paid" ? "Mark Pending" : "Mark Paid"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>

      {/* Proof Inspection Modal */}
      {selectedWinner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d131a] border border-[#1a2330] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1a2330] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Scorecard Verification: {selectedWinner.userId?.fullName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Prize: £{selectedWinner.amountWon.toLocaleString()} ({selectedWinner.tier})
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWinner(null)}
              >
                Close
              </Button>
            </div>

            {/* Proof View */}
            <div>
              {selectedWinner.proofScorecardUrl ? (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-[#151e29] border border-[#1f2c3d] text-center">
                    <img
                      src={selectedWinner.proofScorecardUrl}
                      alt="Scorecard Proof"
                      loading="lazy"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                      className="max-h-72 mx-auto rounded-lg object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <a
                      href={selectedWinner.proofScorecardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open original image in new tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-[#151e29] rounded-xl border border-dashed border-[#1f2c3d]">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">No scorecard proof uploaded yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    The player has not yet submitted proof for this prize.
                  </p>
                </div>
              )}
            </div>

            {/* Rejection input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Rejection Reason (Optional / If rejecting)
              </label>
              <input
                type="text"
                placeholder="e.g. Scorecard date does not match logged round date"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 bg-[#151e29] border border-[#1f2c3d] rounded-xl text-white text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-[#1a2330]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWinner(null)}
                disabled={processing}
              >
                Dismiss
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                  onClick={() => handleVerifyProof("rejected")}
                  isLoading={processing}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Reject Proof
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleVerifyProof("approved")}
                  isLoading={processing}
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Approve Verification
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
