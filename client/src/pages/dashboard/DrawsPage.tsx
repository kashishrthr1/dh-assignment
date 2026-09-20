import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FadeIn } from "../../components/motion/FadeIn";
import confetti from "canvas-confetti";
import {
  Trophy,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";

interface Draw {
  _id: string;
  drawNumber: number;
  drawDate: string;
  status: "scheduled" | "completed";
  drawMode: "pure_random" | "algorithmic";
  prizePoolTotal: number;
  jackpotTotal: number;
  winningNumbers: number[];
  tier1WinnersCount: number;
  tier2WinnersCount: number;
  tier3WinnersCount: number;
  tier1PayoutPerWinner: number;
  tier2PayoutPerWinner: number;
  tier3PayoutPerWinner: number;
  rolloverAmount: number;
}

export function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [userScores, setUserScores] = useState<number[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedCount, setRevealedCount] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drawsRes, scoresRes] = await Promise.all([
          api.get("/draws"),
          api.get("/scores"),
        ]);
        const drawList: Draw[] = drawsRes.data.draws || [];
        setDraws(drawList);
        if (drawList.length > 0) {
          setSelectedDraw(drawList[0]);
        }
        const active = (scoresRes.data.scores || [])
          .slice(0, 5)
          .map((s: any) => s.stablefordScore);
        setUserScores(active);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const triggerReveal = () => {
    setIsRevealing(true);
    setRevealedCount(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= 5) {
        clearInterval(interval);
        setIsRevealing(false);

        // Check if user won and fire confetti
        if (selectedDraw?.winningNumbers && userScores.length > 0) {
          const winSet = new Set(selectedDraw.winningNumbers);
          const matches = Array.from(new Set(userScores)).filter((n) => winSet.has(n));
          if (matches.length >= 3) {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          }
        }
      }
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-emerald border-t-transparent rounded-full" />
      </div>
    );
  }

  const winningSet = new Set(selectedDraw?.winningNumbers || []);
  const uniqueUserNumbers = Array.from(new Set(userScores));
  const matchedNumbers = uniqueUserNumbers.filter((n) => winningSet.has(n));
  const matchCount = matchedNumbers.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Monthly Prize Draws
          </h1>
          <p className="text-text-muted text-sm mt-1">
            20% of all monthly subscriptions fund the prize pool. Match 3, 4, or 5 numbers from your last 5 rounds to win.
          </p>
        </div>
      </FadeIn>

      {/* Featured / Selected Draw Spotlight */}
      {selectedDraw && (
        <FadeIn delay={0.1}>
          <Card variant="neon" className="p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <Badge variant={selectedDraw.status === "completed" ? "emerald" : "gold"}>
                    {selectedDraw.status === "completed" ? "Official Results" : "Upcoming Draw"}
                  </Badge>
                  <span className="text-xs font-mono text-text-muted">
                    Draw #{selectedDraw.drawNumber || 1} • {selectedDraw.drawDate ? new Date(selectedDraw.drawDate).toLocaleDateString("en-GB") : ""}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                  £{((selectedDraw?.prizePoolTotal ?? (selectedDraw as any)?.totalPrizePool ?? 0)).toLocaleString()}{" "}
                  <span className="text-sm font-normal text-text-muted">Prize Pool</span>
                </h2>
              </div>

              {selectedDraw.status === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerReveal}
                  disabled={isRevealing}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Replay Ball Reveal
                </Button>
              )}
            </div>

            {/* Winning Balls Display */}
            <div className="my-8 text-center">
              <div className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-4">
                {selectedDraw.status === "completed"
                  ? "Winning Drawn Numbers (1 – 45)"
                  : "Awaiting Live Draw"}
              </div>

              {selectedDraw.status === "completed" ? (
                <div className="flex justify-center items-center gap-3 sm:gap-5 flex-wrap">
                  {selectedDraw.winningNumbers.map((num, i) => {
                    const isVisible = i < revealedCount;
                    const isUserMatch = userScores.includes(num);

                    return (
                      <div
                        key={i}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-2xl transition-all duration-500 shadow-lg ${
                          isVisible
                            ? isUserMatch
                              ? "bg-primary-emerald text-surface-base scale-110 shadow-neon border-2 border-emerald-300"
                              : "bg-surface-elevated text-white border border-surface-border"
                            : "bg-surface-card border border-surface-border text-transparent animate-pulse"
                        }`}
                      >
                        {isVisible ? num : "?"}
                        {isVisible && isUserMatch && (
                          <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-surface-base">
                            MATCH
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-surface-elevated border border-dashed border-surface-border text-center">
                  <Sparkles className="w-8 h-8 text-accent-gold mx-auto mb-2 animate-bounce" />
                  <p className="text-white font-medium">Draw Scheduled</p>
                  <p className="text-xs text-text-muted mt-1">
                    Balls will be drawn at the end of the calendar month. Ensure your 5 scores are logged!
                  </p>
                </div>
              )}
            </div>

            {/* User Ticket Match Status */}
            {selectedDraw.status === "completed" && (
              <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-text-muted uppercase font-semibold">
                    Your Ticket Check
                  </div>
                  <div className="text-sm font-medium text-white mt-0.5">
                    Your 5 scores:{" "}
                    <span className="font-mono text-primary-emerald">
                      {userScores.length > 0 ? userScores.join(" - ") : "No scores logged"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-text-muted">Result</div>
                    <div className="text-base font-bold font-mono text-white">
                      {matchCount >= 3 ? (
                        <span className="text-accent-gold">Winner! ({matchCount} Matches)</span>
                      ) : (
                        <span>{matchCount} Matches</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={matchCount >= 3 ? "gold" : "muted"}>
                    {matchCount >= 3 ? `Match ${matchCount} Prize` : "No Win"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Tier Prize Distribution */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Match 5 (Jackpot)</span>
                  <span className="font-mono text-accent-gold">40% + Rollover</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  £{((selectedDraw?.jackpotTotal ?? (selectedDraw as any)?.tier5Pool ?? 0)).toLocaleString()}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {(selectedDraw.tier1WinnersCount ?? 0) > 0
                    ? `${selectedDraw.tier1WinnersCount} winner (£${selectedDraw.tier1PayoutPerWinner})`
                    : "No winner — rolls over to next month"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Match 4</span>
                  <span className="font-mono text-white">35%</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  £{(((selectedDraw?.prizePoolTotal ?? (selectedDraw as any)?.totalPrizePool ?? 0) * 0.35)).toFixed(0)}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {(selectedDraw.tier2WinnersCount ?? 0) > 0
                    ? `${selectedDraw.tier2WinnersCount} winner(s) (£${selectedDraw.tier2PayoutPerWinner} ea)`
                    : "Rolled over to Tier 1"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Match 3</span>
                  <span className="font-mono text-white">25%</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  £{(((selectedDraw?.prizePoolTotal ?? (selectedDraw as any)?.totalPrizePool ?? 0) * 0.25)).toFixed(0)}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {(selectedDraw.tier3WinnersCount ?? 0) > 0
                    ? `${selectedDraw.tier3WinnersCount} winner(s) (£${selectedDraw.tier3PayoutPerWinner} ea)`
                    : "Rolled over to Tier 1"}
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Historical Draws Archive */}
      <FadeIn delay={0.2}>
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white font-display mb-4">
            Past Draw Results Archive
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs text-text-muted uppercase">
                  <th className="py-3 px-4">Draw #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Winning Numbers</th>
                  <th className="py-3 px-4">Total Pool</th>
                  <th className="py-3 px-4">Jackpot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {draws.map((d) => (
                  <tr key={d._id} className="hover:bg-surface-elevated/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      #{d.drawNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {new Date(d.drawDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-4 font-mono text-primary-emerald font-bold">
                      {d.winningNumbers?.length > 0 ? d.winningNumbers.join(", ") : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-white">
                      £{d.prizePoolTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-accent-gold">
                      £{d.jackpotTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={d.status === "completed" ? "emerald" : "gold"}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDraw(d);
                          setRevealedCount(5);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Inspect
                      </Button>
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
