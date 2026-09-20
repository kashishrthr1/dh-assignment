import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { FadeIn } from "../../components/motion/FadeIn";
import {
  Target,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Sparkles,
  HelpCircle,
  CheckCircle,
} from "lucide-react";

interface ScoreItem {
  _id: string;
  stablefordScore: number;
  date: string;
  courseName?: string;
  createdAt: string;
}

export function ScoresPage() {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form inputs
  const [scoreVal, setScoreVal] = useState<number>(36);
  const [dateVal, setDateVal] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [courseVal, setCourseVal] = useState<string>("");

  const fetchScores = async () => {
    try {
      const res = await api.get("/scores");
      setScores(res.data.scores || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (scoreVal < 1 || scoreVal > 45) {
      setError("Stableford score must be between 1 and 45.");
      return;
    }

    // Check duplicate date client-side
    const duplicate = scores.find(
      (s) => new Date(s.date).toISOString().split("T")[0] === dateVal
    );
    if (duplicate) {
      setError("You already have a score recorded for this date. Maximum 1 score per calendar day.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/scores", {
        stablefordScore: Number(scoreVal),
        date: dateVal,
        courseName: courseVal || undefined,
      });
      setSuccess("Score successfully logged! Your draw ticket has updated.");
      setCourseVal("");
      fetchScores();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to log score.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this score?")) return;
    try {
      await api.delete(`/scores/${id}`);
      fetchScores();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete score.");
    }
  };

  // Active 5 scores are the most recent 5
  const activeFive = scores.slice(0, 5);
  const historical = scores.slice(5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Stableford Score Tracking
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Log your regular rounds. The last 5 rounds automatically configure your active lottery ticket.
          </p>
        </div>
      </FadeIn>

      {/* Current 5-Ticket Visual Grid */}
      <FadeIn delay={0.1}>
        <Card variant="neon" className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-semibold text-primary-emerald uppercase tracking-wider">
                Live Draw Snapshot
              </span>
              <h2 className="text-xl font-bold font-display text-white">
                Active 5-Number Ticket
              </h2>
            </div>
            <Badge variant={activeFive.length === 5 ? "emerald" : "amber"}>
              {activeFive.length}/5 Scores Registered
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((i) => {
              const score = activeFive[i];
              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    score
                      ? "bg-surface-elevated border-primary-emerald/40 shadow-neon"
                      : "bg-surface-base/40 border-dashed border-surface-border text-text-muted"
                  }`}
                >
                  <span className="text-xs uppercase font-medium text-text-muted mb-1">
                    Slot #{i + 1}
                  </span>
                  {score ? (
                    <>
                      <span className="text-3xl font-extrabold font-mono text-white">
                        {score.stablefordScore}
                      </span>
                      <span className="text-[11px] text-text-muted mt-1 font-mono">
                        {new Date(score.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {score.courseName && (
                        <span className="text-[10px] text-primary-emerald/80 truncate max-w-full mt-0.5">
                          {score.courseName}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-mono text-text-muted/40 py-3">Empty</span>
                  )}
                </div>
              );
            })}
          </div>

          {activeFive.length < 5 ? (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                You need {5 - activeFive.length} more round to qualify for this month's draw.
              </span>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>
                Ticket ready! If you win a major tier prize (&gt;£100), you will be asked to upload
                scorecard verification for these dates.
              </span>
            </div>
          )}
        </Card>
      </FadeIn>

      {/* Log Round Form & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white font-display mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-emerald" /> Log a New Round
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleAddScore} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Stableford Score (1 – 45)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={45}
                      required
                      value={scoreVal}
                      onChange={(e) => setScoreVal(Number(e.target.value))}
                      className="w-24 px-4 py-3 bg-surface-base border border-surface-border rounded-xl text-white font-mono font-bold text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary-emerald"
                    />
                    <span className="text-xs text-text-muted">
                      Standard amateur rounds usually score between 25 and 42 pts.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Date of Round
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      value={dateVal}
                      onChange={(e) => setDateVal(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-base border border-surface-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-emerald"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Course Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. St Andrews Old Course, Wentworth East..."
                  value={courseVal}
                  onChange={(e) => setCourseVal(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-base border border-surface-border rounded-xl text-white placeholder-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary-emerald"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" isLoading={submitting}>
                  Submit Round & Update Ticket
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Rules & Integrity Card */}
        <div>
          <Card className="p-6 h-full space-y-4 text-sm text-text-secondary">
            <h3 className="font-display font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-accent-gold" /> Fair Play Rules
            </h3>
            <ul className="space-y-3 text-xs leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-emerald mt-1.5 shrink-0" />
                <span>
                  <strong>1 Round Per Date:</strong> You cannot log more than one score on the same calendar date.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-emerald mt-1.5 shrink-0" />
                <span>
                  <strong>Rolling Window:</strong> Whenever a new score is logged, your oldest score rolls off the active ticket into your archive.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-emerald mt-1.5 shrink-0" />
                <span>
                  <strong>Scorecard Verification:</strong> Winners of tier prizes over £100 must upload a photo of their physical or app scorecard matching their logged score.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Historical Scores Ledger */}
      {scores.length > 0 && (
        <FadeIn delay={0.2}>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white font-display mb-4">
              All Logged Scores History ({scores.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-xs text-text-muted uppercase">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Date Played</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {scores.map((s, idx) => (
                    <tr key={s._id} className="hover:bg-surface-elevated/40">
                      <td className="py-3 px-4">
                        {idx < 5 ? (
                          <Badge variant="emerald">Active Ticket (Slot {idx + 1})</Badge>
                        ) : (
                          <Badge variant="muted">Archived</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white text-base">
                        {s.stablefordScore}
                      </td>
                      <td className="py-3 px-4 font-mono text-text-secondary">
                        {new Date(s.date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-4 text-text-muted">
                        {s.courseName || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteScore(s._id)}
                          className="p-1.5 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete score"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
