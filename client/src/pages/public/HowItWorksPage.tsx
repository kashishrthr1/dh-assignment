import { Link } from "react-router-dom";
import { Sparkles, Trophy, Heart, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

export function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="cyan" size="md">Transparent Mechanics</Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          How Digital Heroes Works
        </h1>
        <p className="text-lg text-slate-400">
          Everything you need to know about our score tracking, audited prize engine, jackpot rollover rules, and guaranteed charity impact.
        </p>
      </div>

      {/* 1. Score Logging Engine */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F5A0]/10 text-[#00F5A0] flex items-center justify-center font-bold text-base border border-[#00F5A0]/20">
            01
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Golf Score Logging (Stableford 1–45)
            </h2>
            <p className="text-sm text-slate-400">Tactile, instant, and strictly validated</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Rolling 5-Score Window</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              You maintain exactly 5 active scores at any time. When you submit your 6th score, our system automatically purges your oldest entry so your profile stays fresh.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Single Score Per Date Guard</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Players can only record one score per calendar date. If you played an additional round, you can edit or replace your existing date score rather than submitting duplicates.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Stableford Calibration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Accepted scores range between 1 and 45 points. These 5 numbers form your personal draw profile for the monthly prize event.
            </p>
          </Card>
        </div>
      </section>

      {/* 2. Prize Pot & Rollover */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFB020]/10 text-[#FFB020] flex items-center justify-center font-bold text-base border border-[#FFB020]/20">
            02
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Prize Engine, Rollovers &amp; Tiers
            </h2>
            <p className="text-sm text-slate-400">20% of all gross subscriptions fund the prize pool</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.1] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Match Tier</th>
                <th className="py-4 px-6">Pool Share</th>
                <th className="py-4 px-6">Jackpot Rollover?</th>
                <th className="py-4 px-6">Tie-Splitting Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-4 px-6 font-bold text-[#FFB020] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FFB020]" />
                  5-Number Match
                </td>
                <td className="py-4 px-6 font-mono font-bold text-white">40% of Pool</td>
                <td className="py-4 px-6">
                  <Badge variant="gold" size="sm">YES — Rolls Forward</Badge>
                </td>
                <td className="py-4 px-6 text-slate-300">Split equally among 5-match winners</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-4 px-6 font-bold text-[#00F5A0] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00F5A0]" />
                  4-Number Match
                </td>
                <td className="py-4 px-6 font-mono font-bold text-white">35% of Pool</td>
                <td className="py-4 px-6">
                  <Badge variant="slate" size="sm">No Rollover</Badge>
                </td>
                <td className="py-4 px-6 text-slate-300">Split equally among 4-match winners</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-4 px-6 font-bold text-[#00D2FF] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00D2FF]" />
                  3-Number Match
                </td>
                <td className="py-4 px-6 font-mono font-bold text-white">25% of Pool</td>
                <td className="py-4 px-6">
                  <Badge variant="slate" size="sm">No Rollover</Badge>
                </td>
                <td className="py-4 px-6 text-slate-300">Split equally among 3-match winners</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#FFB020]" />
              The 5-Number Rollover Mechanism
            </h4>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              If a monthly draw concludes with zero players hitting all 5 distinct numbers, that entire 40% allocation rolls directly into the next cycle&apos;s 5-number pool!
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#070A12] border border-[#FFB020]/30 font-mono text-sm font-bold text-[#FFB020]">
            Current Rollover: +$8,200.00
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="p-10 rounded-3xl bg-gradient-to-r from-[#0D1322] to-[#131B30] border border-white/[0.12] text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-white">Ready to take part?</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          Sign up today, choose your cause, log your 5 scores, and enter the upcoming monthly draw.
        </p>
        <Link to="/signup">
          <Button size="lg" className="px-8">
            Start Your Membership
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
